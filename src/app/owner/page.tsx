import type { Metadata } from "next";
import { Distribution, Funnel, grid, KpiGrid, WeeklyBars } from "@/components/console/Panels";
import { PageTitle } from "@/components/console/PageTitle";
import { repo } from "@/lib/repo";
import { avgRating, changePct, currentRange, emptyStats, fmtAvg, fmtChange, fmtNum, fmtPct, prevAvgRating, reachPct } from "@/lib/stats";
import { loadOwner, OwnerShell } from "./OwnerShell";

export const metadata: Metadata = { title: "集計" };
export const dynamic = "force-dynamic";

export default async function OwnerAnalytics() {
  const ctx = await loadOwner();
  const range = currentRange();
  const s = (await repo().stats(range, ctx.store.id))[0] ?? emptyStats(ctx.store.id);
  const low = s.ratings[0] + s.ratings[1] + s.ratings[2];
  const prevAvg = prevAvgRating(s);

  return (
    <OwnerShell active="analytics" {...ctx}>
      <div className="tk-fade">
        <PageTitle title="集計" sub="太鼓判くんのページ内で計測できる数値です（直近30日）。Google側の口コミ件数・評価は含みません。" />
        <KpiGrid items={[
          { label: "直近30日のタップ数", value: fmtNum(s.taps), sub: `前の30日比 ${fmtChange(changePct(s))}` },
          { label: "平均★", value: fmtAvg(avgRating(s)), sub: `前の30日 ${fmtAvg(prevAvg)}` },
          { label: "投稿ボタン押下", value: fmtNum(s.posted), sub: `到達率 ${fmtPct(reachPct(s))}` },
          { label: "ご意見フォーム", value: fmtNum(s.feedback), sub: "お店に直接届いた回答" },
        ]} />
        <div style={grid(270)}>
          <WeeklyBars stats={s} weekFrom={range.weekFrom} />
          <Distribution stats={s} lowFrom={3} footer={<>★3以下は {fmtNum(low)} 件。そのうち {fmtNum(s.feedback)} 件はご意見フォームでお店に直接届いています。</>} />
          <Funnel stats={s} />
        </div>
      </div>
    </OwnerShell>
  );
}
