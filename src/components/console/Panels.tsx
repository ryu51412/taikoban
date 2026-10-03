import type { ReactNode } from "react";
import { fmtNum, funnelRows, WEEKS } from "@/lib/stats";
import type { StoreStats } from "@/lib/types";

export type Kpi = { label: string; value: string; sub?: string };

export function KpiGrid({ items, min = 160, size = 24, compact = false }: { items: Kpi[]; min?: number; size?: number; compact?: boolean }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`, gap: 10, marginTop: 18 }}>
      {items.map((k) => (
        <div key={k.label} className="tk-kpi" style={compact ? { padding: "14px 16px" } : undefined}>
          <div style={{ fontSize: 11.5, color: "#6e6693" }}>{k.label}</div>
          <div style={{ fontSize: size, fontWeight: 900, marginTop: 4 }}>{k.value}</div>
          {k.sub !== undefined && <div style={{ fontSize: 11.5, color: "#8b7f63", marginTop: 4 }}>{k.sub}</div>}
        </div>
      ))}
    </div>
  );
}

export function Card({ title, sub, children, style }: { title: ReactNode; sub?: ReactNode; children: ReactNode; style?: React.CSSProperties }) {
  return (
    <div className="tk-card" style={style}>
      <div style={{ fontSize: 14, fontWeight: 700 }}>{title}</div>
      {sub && <div style={{ fontSize: 11.5, color: "#8b7f63", marginTop: 2 }}>{sub}</div>}
      {children}
    </div>
  );
}

/** 週ごとのタップ数（最新週だけ濃い紫） */
export function WeeklyBars({ stats, weekFrom }: { stats: StoreStats; weekFrom: Date }) {
  const max = Math.max(1, ...stats.weekly);
  return (
    <Card title="週ごとのタップ数">
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 170, marginTop: 20 }}>
        {stats.weekly.map((v, i) => {
          const start = new Date(weekFrom.getTime() + i * 7 * 86400_000 + 9 * 3600_000);
          return (
            <div key={i} title={`${start.getUTCMonth() + 1}/${start.getUTCDate()}〜の週：${fmtNum(v)}回`} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%", gap: 6 }}>
              <div style={{ height: `${Math.round((v / max) * 100)}%`, minHeight: v ? 2 : 0, borderRadius: "6px 6px 0 0", background: i === WEEKS - 1 ? "#6852c1" : "#b9aee4" }} />
              <div style={{ fontSize: 9.5, color: "#a49b7f", textAlign: "center" }}>W{i + 1}</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/** ★の分布（高評価は紫、低評価は金） */
export function Distribution({ stats, lowFrom, footer }: { stats: StoreStats; lowFrom: number; footer: ReactNode }) {
  const rows = [5, 4, 3, 2, 1].map((n) => ({ label: `★${n}`, n: stats.ratings[n - 1], low: n <= lowFrom }));
  const max = Math.max(1, ...rows.map((r) => r.n));
  return (
    <Card title="★の分布">
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
        {rows.map((d) => (
          <div key={d.label} style={{ display: "grid", gridTemplateColumns: "44px minmax(0, 1fr) 46px", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 12, color: "#6e6693" }}>{d.label}</div>
            <div style={{ height: 9, borderRadius: 999, background: "#f1edfb", overflow: "hidden" }}>
              <div style={{ width: `${Math.round((d.n / max) * 100)}%`, height: "100%", borderRadius: 999, background: d.low ? "#b8873a" : "#6852c1" }} />
            </div>
            <div style={{ fontSize: 11.5, fontWeight: 700, textAlign: "right" }}>{fmtNum(d.n)}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid rgba(36,31,61,0.1)", fontSize: 12, color: "#6e6693", lineHeight: 1.8 }}>{footer}</div>
    </Card>
  );
}

/** 投稿までの到達（QR → ★ → 決め手 → 投稿ボタン） */
export function Funnel({ stats }: { stats: StoreStats }) {
  return (
    <Card title="投稿までの到達">
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
        {funnelRows(stats).map((f, i) => (
          <div key={f.label}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
              <span style={{ fontWeight: 700 }}>{f.label}</span>
              <span style={{ color: "#6e6693" }}>{f.value}</span>
            </div>
            <div style={{ height: 22, borderRadius: 8, background: "#f1edfb", overflow: "hidden" }}>
              <div style={{ width: `${f.pct}%`, height: "100%", borderRadius: 8, background: i === 3 ? "#6852c1" : "#b9aee4" }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/** 横棒の一覧（タグ別・時間帯別など） */
export function BarRows({ rows, labelWidth, track = "#f1edfb", valueWidth = 42 }: { rows: { label: string; value: string; pct: number; color: string }[]; labelWidth: number; track?: string; valueWidth?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 16 }}>
      {rows.map((r) => (
        <div key={r.label} style={{ display: "grid", gridTemplateColumns: `${labelWidth}px minmax(0, 1fr) ${valueWidth}px`, alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 12.5, color: "#4b4272" }}>{r.label}</div>
          <div style={{ height: 9, borderRadius: 999, background: track, overflow: "hidden" }}>
            <div style={{ width: `${r.pct}%`, height: "100%", borderRadius: 999, background: r.color }} />
          </div>
          <div style={{ fontSize: 11.5, fontWeight: 700, textAlign: "right" }}>{r.value}</div>
        </div>
      ))}
    </div>
  );
}

export const grid = (min: number): React.CSSProperties => ({ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`, gap: 16, marginTop: 16 });
