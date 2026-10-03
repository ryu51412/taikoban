import type { NewEvent, Store, StoreStats } from "./types";

const DAY = 86_400_000;
export const PERIOD_DAYS = 30;
export const WEEKS = 10;

export type StatsRange = { from: Date; to: Date; prevFrom: Date; weekFrom: Date };

/** 直近30日・その前の30日・直近10週 */
export function currentRange(now = new Date()): StatsRange {
  const to = new Date(now.getTime() + 60_000);
  return {
    to,
    from: new Date(to.getTime() - PERIOD_DAYS * DAY),
    prevFrom: new Date(to.getTime() - PERIOD_DAYS * 2 * DAY),
    weekFrom: new Date(to.getTime() - WEEKS * 7 * DAY),
  };
}

export function emptyStats(storeId: string): StoreStats {
  return {
    storeId, taps: 0, prevTaps: 0, starred: 0, aspected: 0, posted: 0, feedback: 0,
    ratings: [0, 0, 0, 0, 0], prevStarred: 0, prevRatingSum: 0,
    weekly: Array(WEEKS).fill(0), hours: [0, 0, 0, 0, 0],
  };
}

/** 日本時間の時台 → [11–14, 14–17, 17–20, 20–23, その他] */
export function hourBucket(d: Date): number {
  const h = (d.getUTCHours() + 9) % 24;
  if (h >= 11 && h < 14) return 0;
  if (h >= 14 && h < 17) return 1;
  if (h >= 17 && h < 20) return 2;
  if (h >= 20 && h < 23) return 3;
  return 4;
}

type Ev = Required<Pick<NewEvent, "storeId" | "sessionId" | "type">> & { rating: number | null; createdAt: string };

/** メモリ版の集計。Supabase 版は SQL 関数 tk_store_stats が同じ定義で計算する */
export function computeStats(events: Ev[], storeIds: string[], range: StatsRange): StoreStats[] {
  const from = range.from.getTime(), to = range.to.getTime(), prevFrom = range.prevFrom.getTime(), weekFrom = range.weekFrom.getTime();
  type Acc = {
    s: StoreStats;
    sets: Record<string, Set<string>>;
    prevTaps: Set<string>;
    lastRating: Map<string, { t: number; r: number }>;
    prevLastRating: Map<string, { t: number; r: number }>;
    weekly: Set<string>[];
    hours: Set<string>[];
  };
  const acc = new Map<string, Acc>();
  for (const id of storeIds) {
    acc.set(id, {
      s: emptyStats(id),
      sets: { qr_open: new Set(), star: new Set(), aspect: new Set(), post_click: new Set() },
      prevTaps: new Set(), lastRating: new Map(), prevLastRating: new Map(),
      weekly: Array.from({ length: WEEKS }, () => new Set<string>()),
      hours: Array.from({ length: 5 }, () => new Set<string>()),
    });
  }
  for (const e of events) {
    const a = acc.get(e.storeId);
    if (!a) continue;
    const t = new Date(e.createdAt).getTime();
    if (t >= to || t < Math.min(prevFrom, weekFrom)) continue;
    if (e.type === "qr_open" && t >= weekFrom) {
      const w = Math.floor((t - weekFrom) / (7 * DAY));
      if (w >= 0 && w < WEEKS) a.weekly[w].add(e.sessionId);
    }
    if (t >= from) {
      if (a.sets[e.type]) a.sets[e.type].add(e.sessionId);
      if (e.type === "feedback_submit") a.s.feedback += 1;
      if (e.type === "qr_open") a.hours[hourBucket(new Date(t))].add(e.sessionId);
      if (e.type === "star" && e.rating && e.rating >= 1 && e.rating <= 5) {
        const cur = a.lastRating.get(e.sessionId);
        if (!cur || cur.t <= t) a.lastRating.set(e.sessionId, { t, r: e.rating });
      }
    } else if (t >= prevFrom) {
      if (e.type === "qr_open") a.prevTaps.add(e.sessionId);
      if (e.type === "star" && e.rating && e.rating >= 1 && e.rating <= 5) {
        const cur = a.prevLastRating.get(e.sessionId);
        if (!cur || cur.t <= t) a.prevLastRating.set(e.sessionId, { t, r: e.rating });
      }
    }
  }
  return storeIds.map((id) => {
    const a = acc.get(id)!;
    const s = a.s;
    s.taps = a.sets.qr_open.size;
    s.aspected = a.sets.aspect.size;
    s.posted = a.sets.post_click.size;
    s.prevTaps = a.prevTaps.size;
    for (const { r } of a.lastRating.values()) s.ratings[r - 1] += 1;
    s.starred = a.lastRating.size;
    s.prevStarred = a.prevLastRating.size;
    for (const { r } of a.prevLastRating.values()) s.prevRatingSum += r;
    s.weekly = a.weekly.map((x) => x.size);
    s.hours = a.hours.map((x) => x.size);
    return s;
  });
}

// ---------- 画面で使う派生値（どの画面も同じ関数を通して数字を揃える） ----------

export function sumStats(list: StoreStats[], storeId = "all"): StoreStats {
  const t = emptyStats(storeId);
  for (const s of list) {
    t.taps += s.taps; t.prevTaps += s.prevTaps; t.starred += s.starred; t.aspected += s.aspected;
    t.posted += s.posted; t.feedback += s.feedback; t.prevStarred += s.prevStarred; t.prevRatingSum += s.prevRatingSum;
    s.ratings.forEach((n, i) => (t.ratings[i] += n));
    s.weekly.forEach((n, i) => (t.weekly[i] += n));
    s.hours.forEach((n, i) => (t.hours[i] += n));
  }
  return t;
}

export const ratingSum = (s: StoreStats) => s.ratings.reduce((t, n, i) => t + n * (i + 1), 0);
export const avgRating = (s: StoreStats): number | null => (s.starred ? ratingSum(s) / s.starred : null);
export const prevAvgRating = (s: StoreStats): number | null => (s.prevStarred ? s.prevRatingSum / s.prevStarred : null);
export const reachPct = (s: StoreStats): number | null => (s.taps ? Math.round((s.posted / s.taps) * 100) : null);
export const lowPct = (s: StoreStats): number | null => (s.starred ? Math.round(((s.ratings[0] + s.ratings[1]) / s.starred) * 100) : null);
export const changePct = (s: StoreStats): number | null => (s.prevTaps ? Math.round(((s.taps - s.prevTaps) / s.prevTaps) * 100) : null);
export const pctOf = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0);

export const fmtAvg = (v: number | null) => (v === null ? "—" : v.toFixed(1));
export const fmtPct = (v: number | null) => (v === null ? "—" : `${v}%`);
export const fmtChange = (v: number | null) => (v === null ? "—" : `${v >= 0 ? "+" : ""}${v}%`);
export const fmtNum = (n: number) => n.toLocaleString("ja-JP");

export function funnelRows(s: StoreStats) {
  return [
    { label: "QRを読み取った", n: s.taps, pct: s.taps ? 100 : 0 },
    { label: "★をタップした", n: s.starred, pct: pctOf(s.starred, s.taps) },
    { label: "決め手を選んだ", n: s.aspected, pct: pctOf(s.aspected, s.taps) },
    { label: "投稿ボタンを押した", n: s.posted, pct: pctOf(s.posted, s.taps) },
  ].map((r, i) => ({ ...r, value: i === 0 ? fmtNum(r.n) : `${fmtNum(r.n)} (${r.pct}%)` }));
}

// ---------- 運営：フォローが必要な店舗 ----------
export const ALERT_CHANGE = -10; // 前月比 −10% 以下
export const ALERT_REACH = 62; // 到達率 62% 未満
export const ALERT_LOW = 9; // ★2以下が 9% 以上

export type StoreAlert = { store: Store; level: "high" | "mid"; reason: string; action: string };

export function storeAlerts(stores: Store[], stats: Map<string, StoreStats>, avgReach: number | null): StoreAlert[] {
  const out: StoreAlert[] = [];
  for (const st of stores) {
    const s = stats.get(st.id);
    const why: string[] = [];
    if (st.status === "未発行") why.push("ページが未発行です。契約済みのため早めに発行を。");
    if (st.status === "準備中") why.push(`準備中のまま ${fmtMD(st.updatedAt)} から更新がありません。`);
    if (s && st.status === "公開中") {
      const ch = changePct(s), r = reachPct(s), low = lowPct(s);
      if (ch !== null && ch <= ALERT_CHANGE) why.push(`タップ数が前月比 ${ch}%`);
      if (r !== null && r < ALERT_REACH) why.push(`投稿到達率 ${r}%${avgReach !== null ? `（全店平均 ${avgReach}%）` : ""}`);
      if (low !== null && low >= ALERT_LOW) why.push(`★2以下が ${low}%`);
    }
    if (!why.length) continue;
    out.push({
      store: st,
      level: why.length >= 2 ? "high" : "mid",
      reason: why.join("・"),
      action: st.status === "未発行" ? "発行する" : st.status === "準備中" ? "設定を確認" : "店舗を見る",
    });
  }
  return out.sort((a, b) => (a.level === "high" ? 0 : 1) - (b.level === "high" ? 0 : 1));
}

const jst = (iso: string) => new Date(new Date(iso).getTime() + 9 * 3600_000);
export const fmtMD = (iso: string) => { const d = jst(iso); return `${d.getUTCMonth() + 1}/${d.getUTCDate()}`; };
export const fmtWhen = (iso: string) => {
  const d = jst(iso);
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()} ${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
};
export const storeMark = (st: Pick<Store, "mark" | "name">) => st.mark || Array.from(st.name.trim())[0] || "店";
