import type { Metadata } from "next";
import Link from "next/link";
import { BarRows, Card, Distribution, Funnel, grid, KpiGrid, WeeklyBars } from "@/components/console/Panels";
import { PageTitle } from "@/components/console/PageTitle";
import { requireRole } from "@/lib/auth";
import { repo } from "@/lib/repo";
import {
  ALERT_CHANGE, ALERT_REACH, avgRating, changePct, currentRange, emptyStats, fmtChange, fmtNum, fmtPct, lowPct, pctOf, reachPct, storeAlerts, sumStats,
} from "@/lib/stats";
import { STORE_PLANS } from "@/lib/types";
import { AdminShell } from "../AdminShell";
import { Ranking, type RankRow } from "./Ranking";

export const metadata: Metadata = { title: "集計（全店舗）" };
export const dynamic = "force-dynamic";

const HOUR_LABELS = ["11–14時", "14–17時", "17–20時", "20–23時", "その他"];

export default async function AdminAnalytics() {
  const user = await requireRole("operator");
  const range = currentRange();
  const [stores, list, open] = await Promise.all([repo().listStores(), repo().stats(range), repo().countOpenResponses()]);
  const stats = new Map(list.map((s) => [s.storeId, s]));
  const live = stores.filter((s) => s.status === "公開中");
  const liveStats = sumStats(live.map((s) => stats.get(s.id) ?? emptyStats(s.id)));
  const total = sumStats(list);
  const avgReach = reachPct(liveStats);
  const alerts = storeAlerts(stores, stats, avgReach);

  const rows: RankRow[] = stores.map((st) => {
    const s = stats.get(st.id) ?? emptyStats(st.id);
    return { id: st.id, name: st.name, taps: s.taps, change: changePct(s), avg: avgRating(s), reach: reachPct(s), low: lowPct(s), open: open.get(st.id) ?? 0 };
  });

  const hourMax = Math.max(1, ...total.hours);
  const hourTotal = total.hours.reduce((a, b) => a + b, 0);
  const low2 = total.ratings[0] + total.ratings[1];

  return (
    <AdminShell active="analytics" user={user} storeCount={stores.length} detailId={stores[0]?.id}>
      <div className="tk-fade">
        <PageTitle title="集計" sub="太鼓判くんのページ内で計測できる数値です（直近30日・全店舗）。Google側の口コミ件数・評価は含みません。" />

        <KpiGrid items={[
          { label: "稼働店舗", value: `${live.length} / ${stores.length}`, sub: `準備中・未発行 ${stores.length - live.length} 店舗` },
          { label: "直近30日のタップ数", value: fmtNum(total.taps), sub: `前の30日比 ${fmtChange(changePct(total))}` },
          { label: "投稿到達率", value: fmtPct(avgReach), sub: "公開中の店舗の平均" },
          { label: "要フォロー", value: String(alerts.length), sub: "下の一覧を確認" },
        ]} />

        <div style={{ marginTop: 16, background: "#ffffff", border: "1px solid rgba(184,135,58,0.35)", borderRadius: 18, padding: "20px 22px" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>フォローが必要な店舗</div>
            <div style={{ fontSize: 11.5, color: "#8b7f63" }}>前月比 {ALERT_CHANGE}%以下・到達率{ALERT_REACH}%未満・★2以下9%以上・未公開の店舗</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
            {alerts.length === 0 && <div style={{ fontSize: 12.5, color: "#6e6693" }}>いまフォローが必要な店舗はありません。</div>}
            {alerts.map((a) => (
              <Link key={a.store.id} href={`/admin/stores/${a.store.id}`} className="h-alert"
                style={{ display: "grid", gridTemplateColumns: "auto minmax(0, 1fr) auto", gap: 12, alignItems: "center", width: "100%", textAlign: "left", padding: "12px 14px", borderRadius: 12, border: "1px solid rgba(36,31,61,0.08)", background: "#fdfaf4" }}>
                <span style={{ width: 9, height: 9, borderRadius: 999, flex: "none", background: a.level === "high" ? "#c0562f" : "#b8873a" }} aria-label={a.level === "high" ? "要対応（複数の条件）" : "注意"} />
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#241f3d" }}>{a.store.name}</span>
                  <span style={{ display: "block", fontSize: 12, color: "#6e6693", lineHeight: 1.6 }}>{a.reason}</span>
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#6852c1", whiteSpace: "nowrap" }}>{a.action} →</span>
              </Link>
            ))}
          </div>
        </div>

        <Ranking rows={rows} />

        <div style={grid(270)}>
          <Card title="時間帯別のタップ数" sub="全店舗合計・POPの置き場所や声かけの目安に">
            <BarRows labelWidth={74} rows={total.hours.map((n, i) => ({ label: HOUR_LABELS[i], value: `${pctOf(n, hourTotal)}%`, pct: Math.round((n / hourMax) * 100), color: n === hourMax ? "#6852c1" : "#b9aee4" }))} />
          </Card>
          <Card title="プラン別">
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 18 }}>
              {STORE_PLANS.map((p) => {
                const g = live.filter((x) => x.plan === p).map((x) => stats.get(x.id) ?? emptyStats(x.id));
                const sum = sumStats(g);
                return (
                  <div key={p} style={{ padding: "14px 16px", borderRadius: 14, background: "#faf7f1", border: "1px solid rgba(36,31,61,0.08)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{p}</span>
                      <span style={{ fontSize: 12, color: "#6e6693" }}>公開中 {g.length} 店舗</span>
                    </div>
                    <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 12, color: "#4b4272", flexWrap: "wrap" }}>
                      <span>平均タップ {g.length ? fmtNum(Math.round(sum.taps / g.length)) : 0}回</span><span>到達率 {fmtPct(reachPct(sum))}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div style={grid(270)}>
          <WeeklyBars stats={total} weekFrom={range.weekFrom} />
          <Distribution stats={total} lowFrom={2} footer={<>★2以下は {fmtNum(low2)} 件（{pctOf(low2, total.starred)}%）。ご意見フォームの回答は {fmtNum(total.feedback)} 件です。</>} />
          <Funnel stats={total} />
        </div>
      </div>
    </AdminShell>
  );
}
