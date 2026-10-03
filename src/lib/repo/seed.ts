// デモ用のサンプルデータ（デザイン見本の数値に近づくよう乱数で events を作る）
import { composeDraft } from "../compose";
import type { NewEvent, ReviewResponse, Store } from "../types";

const DAY = 86_400_000;

function mulberry32(a: number) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const uuid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
export const DEMO_STORE_ID = uuid(1);

type Seed = { mark: string; slug: string; name: string; plan: Store["plan"]; status: Store["status"]; taps: number; prev: number; avg: number; reach: number; low: number; aspects: string[]; menus: string[]; coupon: string | null; updatedDaysAgo: number; openFb: number };

const SEEDS: Seed[] = [
  { mark: "丑", slug: "ushinosuke", name: "ホルモン丑之助", plan: "スタンダード", status: "公開中", taps: 412, prev: 362, avg: 4.5, reach: 72, low: 4, aspects: ["旨味", "ビール", "店員"], menus: ["肉さし", "ビビンバ", "白米"], coupon: "当日の利用のみ500円引き", updatedDaysAgo: 19, openFb: 3 },
  { mark: "蔵", slug: "kuramae", name: "焙煎所 蔵前", plan: "スタンダード", status: "公開中", taps: 288, prev: 270, avg: 4.6, reach: 75, low: 3, aspects: ["香り", "雰囲気", "接客"], menus: ["浅煎りブレンド", "カフェラテ", "チーズケーキ"], coupon: "次回ドリンク50円引き", updatedDaysAgo: 21, openFb: 0 },
  { mark: "海", slug: "isomatsu", name: "海鮮居酒屋 いそ松", plan: "ライト", status: "公開中", taps: 196, prev: 231, avg: 4.2, reach: 64, low: 9, aspects: ["鮮度", "料理", "雰囲気"], menus: ["刺身盛り合わせ", "海鮮丼", "あら汁"], coupon: null, updatedDaysAgo: 22, openFb: 2 },
  { mark: "麺", slug: "yui", name: "手打ちうどん 結", plan: "ライト", status: "公開中", taps: 174, prev: 168, avg: 4.4, reach: 69, low: 5, aspects: ["コシ", "出汁", "接客"], menus: ["かけうどん", "肉ぶっかけ", "天ぷら"], coupon: null, updatedDaysAgo: 24, openFb: 0 },
  { mark: "焼", slug: "toriichi", name: "炭火焼鳥 とりいち", plan: "スタンダード", status: "公開中", taps: 331, prev: 290, avg: 4.3, reach: 70, low: 7, aspects: ["炭火の香り", "ビール", "店員"], menus: ["ねぎま", "つくね", "鶏白湯"], coupon: "ドリンク1杯サービス", updatedDaysAgo: 25, openFb: 1 },
  { mark: "洋", slug: "maruyama", name: "洋食キッチン まるやま", plan: "ライト", status: "公開中", taps: 121, prev: 158, avg: 4.1, reach: 58, low: 12, aspects: ["料理", "雰囲気", "接客"], menus: ["オムライス", "ハンバーグ", "ナポリタン"], coupon: null, updatedDaysAgo: 28, openFb: 2 },
  { mark: "喫", slug: "hirune", name: "喫茶 ひるね", plan: "ライト", status: "公開中", taps: 88, prev: 80, avg: 4.7, reach: 78, low: 2, aspects: ["雰囲気", "コーヒー", "接客"], menus: ["ナポリタン", "クリームソーダ", "プリン"], coupon: null, updatedDaysAgo: 30, openFb: 0 },
  { mark: "鮨", slug: "takaya", name: "鮨 たかや", plan: "スタンダード", status: "公開中", taps: 143, prev: 126, avg: 4.8, reach: 81, low: 1, aspects: ["鮮度", "接客", "雰囲気"], menus: ["おまかせ", "中トロ", "穴子"], coupon: null, updatedDaysAgo: 31, openFb: 0 },
  { mark: "美", slug: "niji", name: "ヘアサロン NIJI", plan: "ライト", status: "準備中", taps: 64, prev: 0, avg: 4.5, reach: 66, low: 3, aspects: ["技術", "接客", "雰囲気"], menus: ["カット", "カラー", "ヘッドスパ"], coupon: null, updatedDaysAgo: 34, openFb: 0 },
  { mark: "整", slug: "minami", name: "からだ整院 みなみ", plan: "ライト", status: "未発行", taps: 0, prev: 0, avg: 0, reach: 0, low: 0, aspects: ["施術", "接客", "清潔さ"], menus: ["整体60分", "骨盤矯正", "肩こりコース"], coupon: null, updatedDaysAgo: 36, openFb: 0 },
];

// デザイン見本「届いたご意見」の18件（ホルモン丑之助）。見本の 9/15 0:00 を「今」とみなした相対時刻
const FEEDBACK_SAMPLE: [string, number, string, string[], string, boolean][] = [
  ["form", 2, "9/14 21:40", ["待ち時間"], "土曜の混雑時、注文から提供まで25分ほどかかりました。列の案内がないので店内で立ち尽くす人が多かったです。味は良いので運用だけ見直してほしいです。", false],
  ["google", 5, "9/14 20:02", ["旨味", "肉さし"], "ホルモン丑之助に伺いました。旨味がしっかりしていて、箸が止まりませんでした。肉さしが特においしかったです。また利用したいと思います。", true],
  ["form", 1, "9/13 20:12", ["接客", "会計"], "テイクアウトの注文を間違えられ、指摘しても謝罪がありませんでした。混雑時の連携を見直していただけると嬉しいです。", false],
  ["google", 5, "9/13 19:24", ["ビール", "ビビンバ"], "ホルモン丑之助を利用しました。キンキンに冷えたビールとの相性が抜群でした。ビビンバは特におすすめです。リピートしたいお店です。", true],
  ["form", 2, "9/12 19:05", ["店内の清潔さ"], "座敷の座卓が少しべたついていました。忙しい時間帯だったと思いますが、気になってしまいました。", false],
  ["google", 4, "9/12 18:41", ["店員", "白米"], "先日、ホルモン丑之助でお食事しました。店員さんの対応が気持ちよく、居心地の良い時間でした。白米をぜひ食べてみてほしいです。友人にもおすすめしたいです。", true],
  ["google", 5, "9/11 21:15", ["旨味"], "ホルモン丑之助へ行ってきました。噛むほどに旨味が広がって感動しました。また利用したいと思います。", true],
  ["form", 2, "9/10 13:22", ["価格", "料理の味"], "ランチのボリュームが以前より減ったように感じました。価格が上がるのは仕方ないので、その分の説明があると納得できます。", true],
  ["google", 5, "9/9 20:30", ["ビール", "肉さし"], "ホルモン丑之助に伺いました。ビールがすすむ味付けで、つい何杯もいただきました。肉さしが特においしかったです。機会があればまた行きたいと思います。", true],
  ["form", 1, "9/7 22:48", ["待ち時間"], "予約していたのに20分以上待ちました。到着時の案内があれば気にならなかったと思います。", true],
  ["google", 4, "9/7 19:12", ["店員"], "ホルモン丑之助を利用しました。店員さんのおすすめが的確で助かりました。リピートしたいお店です。", true],
  ["form", 2, "9/5 20:31", ["待ち時間", "接客"], "追加注文が通っておらず、確認をお願いしても回答まで時間がかかりました。人手が足りていない印象でした。", true],
  ["google", 5, "9/5 19:03", ["旨味", "ビビンバ"], "先日、ホルモン丑之助でお食事しました。素材の旨味が濃く、想像以上の美味しさでした。特にビビンバが印象に残りました。友人にもおすすめしたいです。", true],
  ["form", 3, "9/3 19:58", ["店内の清潔さ"], "換気はされていましたが、煙のにおいが服に強く残りました。上着を預かってもらえると助かります。", true],
  ["google", 5, "9/2 20:47", ["ビール", "白米"], "ホルモン丑之助へ行ってきました。ビールと一緒にいただくと最高でした。白米は特におすすめです。また利用したいと思います。", true],
  ["form", 2, "8/31 21:10", ["価格"], "ドリンクの値段が分かりにくく、会計で驚きました。メニューに税込表示があると安心です。", true],
  ["google", 4, "8/31 18:22", ["店員", "ビビンバ"], "ホルモン丑之助を利用しました。スタッフの方が親切で、安心して過ごせました。ビビンバをぜひ食べてみてほしいです。機会があればまた行きたいと思います。", true],
  ["google", 5, "8/29 20:05", ["旨味", "肉さし"], "ホルモン丑之助に伺いました。旨味がしっかりしていて、箸が止まりませんでした。肉さしが特においしかったです。リピートしたいお店です。", true],
];

const FORM_POOL: [string[], string][] = [
  [["待ち時間"], "料理が出てくるまでかなり待ちました。目安の時間を教えてもらえると助かります。"],
  [["接客"], "注文を取りに来てもらうまで時間がかかり、声をかけづらい雰囲気でした。"],
  [["価格"], "量に対して少し高く感じました。セットメニューがあると嬉しいです。"],
  [["店内の清潔さ"], "お手洗いの清掃が行き届いていないように感じました。"],
  [["料理の味"], "以前より味が薄くなったように思います。"],
];

function ratingProbs(avg: number, low: number): number[] {
  const p1 = (low / 100) * 0.32, p2 = (low / 100) * 0.68, p3 = 0.05;
  const rest = 1 - p1 - p2 - p3;
  const p5 = Math.min(rest, Math.max(0, avg - (p1 + 2 * p2 + 3 * p3 + 4 * rest)));
  return [p1, p2, p3, rest - p5, p5];
}

function pickWeighted(w: number[], r: number) {
  let acc = 0;
  for (let i = 0; i < w.length; i++) { acc += w[i]; if (r < acc) return i; }
  return w.length - 1;
}

const HOUR_W = [0.31, 0.09, 0.34, 0.22, 0.04];
const HOUR_RANGES = [[11, 14], [14, 17], [17, 20], [20, 23], [23, 35]]; // 23–翌11時は「その他」

export function buildSeed(now = new Date()) {
  const rnd = mulberry32(20260914);
  const stores: Store[] = [];
  const events: (NewEvent & { createdAt: string; rating: number | null })[] = [];
  const responses: ReviewResponse[] = [];
  let sid = 1, rid = 1;

  SEEDS.forEach((s, i) => {
    const id = uuid(i + 1);
    stores.push({
      id, slug: s.slug, name: s.name, mark: s.mark, googleReviewUrl: "https://g.page/r/CZLVVImPLaEtEAE/review",
      aspects: s.aspects, menus: s.menus, couponText: s.coupon, notifyEmail: "owner@example.com",
      status: s.status, plan: s.plan, notifyOn: true, couponOn: !!s.coupon,
      updatedAt: new Date(now.getTime() - s.updatedDaysAgo * DAY).toISOString(),
    });
    if (!s.taps) return;
    const probs = ratingProbs(s.avg, s.low);
    // 期間ごとのセッション数: 直近30日 / その前の30日 / 60〜70日前
    const periods: [number, number, number][] = [[0, 30, s.taps], [30, 60, s.prev], [60, 70, Math.round(s.prev * 0.3)]];
    for (const [d0, d1, count] of periods) {
      for (let k = 0; k < count; k++) {
        const day = d0 + rnd() * (d1 - d0);
        const hb = pickWeighted(HOUR_W, rnd());
        const [h0, h1] = HOUR_RANGES[hb];
        const hourJst = (h0 + rnd() * (h1 - h0)) % 24;
        const j = new Date(now.getTime() - Math.floor(day) * DAY + 9 * 3600_000);
        const jstMidnight = Date.UTC(j.getUTCFullYear(), j.getUTCMonth(), j.getUTCDate()) - 9 * 3600_000;
        let t = jstMidnight + hourJst * 3600_000;
        if (t > now.getTime()) t -= DAY;
        const session = `seed-${sid++}`;
        const ev = (type: NewEvent["type"], dt: number, rating: number | null = null, value: string | null = null) =>
          events.push({ storeId: id, sessionId: session, type, rating, value, createdAt: new Date(t + dt * 1000).toISOString() });
        ev("qr_open", 0);
        if (rnd() > 0.93) continue;
        const rating = pickWeighted(probs, rnd()) + 1;
        ev("star", 5, rating);
        if (rnd() > 0.81 / 0.93) continue;
        ev("aspect", 12, null, s.aspects[Math.floor(rnd() * 3)]);
        if (rnd() < 0.8) ev("menu", 18, null, s.menus[Math.floor(rnd() * 3)]);
        if (rnd() < s.reach / 81) ev("post_click", 25);
        if (rating <= 3 && rnd() < 0.35) ev("feedback_submit", 60, rating);
      }
    }
  });

  // 届いたご意見
  const designNow = Date.UTC(2026, 8, 15) - 9 * 3600_000; // 見本の 9/15 0:00 JST
  for (const [route, rating, when, tags, text, done] of FEEDBACK_SAMPLE) {
    const [md, hm] = when.split(" ");
    const [m, d] = md.split("/").map(Number);
    const [hh, mm] = hm.split(":").map(Number);
    const t = Date.UTC(2026, m - 1, d, hh, mm) - 9 * 3600_000;
    responses.push({
      id: uuid(1000 + rid++), storeId: DEMO_STORE_ID, sessionId: `fb-${rid}`, rating, route: route as "google" | "form",
      tags, text, done, createdAt: new Date(now.getTime() - (designNow - t)).toISOString(),
    });
  }
  SEEDS.forEach((s, i) => {
    if (i === 0 || !s.taps) return;
    const id = uuid(i + 1);
    for (let k = 0; k < 4; k++) {
      const asp = s.aspects[k % 3], menu = s.menus[(k + 1) % 3];
      responses.push({
        id: uuid(1000 + rid++), storeId: id, sessionId: `fb-${rid}`, rating: 5 - (k % 2), route: "google", tags: [asp, menu],
        text: composeDraft({ store: s.name, aspect: asp, menu, rating: 5, rnd }), done: true,
        createdAt: new Date(now.getTime() - (k * 3 + 1) * DAY - 5 * 3600_000).toISOString(),
      });
    }
    for (let k = 0; k < s.openFb + 1; k++) {
      const [tags, text] = FORM_POOL[(i + k) % FORM_POOL.length];
      responses.push({
        id: uuid(1000 + rid++), storeId: id, sessionId: `fb-${rid}`, rating: 2, route: "form", tags, text,
        done: k >= s.openFb, createdAt: new Date(now.getTime() - (k * 2 + 0.5) * DAY).toISOString(),
      });
    }
  });
  responses.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return { stores, events, responses };
}

/** デモ用ログイン（Supabase 未設定時のみ有効） */
export const DEMO_USERS = [
  { id: "demo-owner", email: "owner@example.com", password: "password123", role: "owner" as const, storeId: DEMO_STORE_ID },
  { id: "demo-operator", email: "operator@example.com", password: "password123", role: "operator" as const, storeId: null },
];
