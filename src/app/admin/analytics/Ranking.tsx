"use client";

import Link from "next/link";
import { useState } from "react";
import { pill } from "@/components/console/StoreDetail";
import { ALERT_CHANGE, ALERT_LOW, ALERT_REACH, fmtAvg, fmtChange, fmtNum, fmtPct } from "@/lib/stats";

export type RankRow = { id: string; name: string; taps: number; change: number | null; avg: number | null; reach: number | null; low: number | null; open: number };
type SortKey = "taps" | "change" | "reach" | "low";
const COLS = "34px minmax(160px, 2fr) repeat(6, minmax(70px, 1fr))";

export function Ranking({ rows }: { rows: RankRow[] }) {
  const [sort, setSort] = useState<SortKey>("taps");
  const v = (r: RankRow) => (sort === "taps" ? r.taps : sort === "change" ? r.change ?? -999 : sort === "reach" ? r.reach ?? -1 : r.low ?? -1);
  const ranked = [...rows].sort((a, b) => v(b) - v(a));

  return (
    <div style={{ marginTop: 16, background: "#ffffff", border: "1px solid rgba(36,31,61,0.1)", borderRadius: 18, overflow: "hidden" }}>
      <div style={{ padding: "18px 20px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>店舗別の成績</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {([["taps", "タップ数"], ["change", "前月比"], ["reach", "到達率"], ["low", "★2以下率"]] as [SortKey, string][]).map(([k, label]) => (
            <button key={k} type="button" style={pill(sort === k)} aria-pressed={sort === k} onClick={() => setSort(k)}>{label}</button>
          ))}
        </div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <div style={{ minWidth: 720 }}>
          <div style={{ display: "grid", gridTemplateColumns: COLS, gap: 10, padding: "10px 20px", background: "#faf7f1", borderTop: "1px solid rgba(36,31,61,0.08)", borderBottom: "1px solid rgba(36,31,61,0.08)", fontSize: 11, fontWeight: 700, color: "#6e6693" }}>
            <div>#</div><div>店舗</div><div>タップ数</div><div>前月比</div><div>平均★</div><div>投稿到達</div><div>★2以下率</div><div>未対応ご意見</div>
          </div>
          {ranked.map((r, i) => (
            <Link key={r.id} href={`/admin/stores/${r.id}`} className="h-cream-row"
              style={{ display: "grid", gridTemplateColumns: COLS, gap: 10, alignItems: "center", width: "100%", textAlign: "left", padding: "12px 20px", borderBottom: "1px solid rgba(36,31,61,0.06)", background: "#ffffff", color: "#241f3d" }}>
              <div style={{ fontSize: 12, fontWeight: 900, color: "#a49b7f" }}>{i + 1}</div>
              <div style={{ fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{fmtNum(r.taps)}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: r.change === null ? "#a49b7f" : r.change <= ALERT_CHANGE ? "#c0562f" : r.change > 0 ? "#2f6b4f" : "#4b4272" }}>{fmtChange(r.change)}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#6852c1" }}>{fmtAvg(r.avg)}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: r.reach !== null && r.reach < ALERT_REACH ? "#c0562f" : "#241f3d" }}>{fmtPct(r.reach)}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: r.low !== null && r.low >= ALERT_LOW ? "#c0562f" : "#241f3d" }}>{fmtPct(r.low)}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: r.open > 0 ? "#8a5f20" : "#a49b7f" }}>{r.open}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
