import type { CSSProperties } from "react";

export type PopTone = "paper" | "white" | "dark";
export const POP_TONES: { key: PopTone; label: string }[] = [
  { key: "paper", label: "生成紙" },
  { key: "white", label: "白" },
  { key: "dark", label: "墨" },
];

const TONES = {
  paper: { bg: "#faf6ee", ink: "#2a2620", sub: "#6b6558", faint: "#a39a88", line: "rgba(42,38,32,0.14)", edge: "rgba(42,38,32,0.16)", gold: "#9c7530" },
  white: { bg: "#ffffff", ink: "#241f3d", sub: "#6e6693", faint: "#a49b7f", line: "rgba(36,31,61,0.12)", edge: "rgba(36,31,61,0.14)", gold: "#8a5f20" },
  dark: { bg: "#231f2c", ink: "#f7f2ea", sub: "rgba(247,242,234,0.74)", faint: "rgba(247,242,234,0.45)", line: "rgba(247,242,234,0.2)", edge: "rgba(247,242,234,0.24)", gold: "#c9a862" },
};

/** 卓上POP（幅240px・高さ352px以上）。qrSvg が無ければ見本と同じしま模様を出す */
export function TablePop({ tone, name, coupon, qrSvg, zoom, flat }: { tone: PopTone; name: string; coupon: string | null; qrSvg?: string; zoom?: number; flat?: boolean }) {
  const T = TONES[tone] ?? TONES.paper;
  const corner = (pos: CSSProperties, radius: string): CSSProperties => ({ position: "absolute", width: 16, height: 16, borderColor: T.gold, borderStyle: "solid", borderWidth: 0, borderRadius: radius, ...pos });
  return (
    <div style={{ width: 240, minHeight: 352, background: T.bg, border: `1px solid ${T.edge}`, borderRadius: 8, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: flat ? "none" : "0 2px 0 rgba(36,31,61,0.04), 0 22px 36px -20px rgba(36,31,61,0.5)", transition: "background .3s ease", zoom, printColorAdjust: "exact", WebkitPrintColorAdjust: "exact", lineHeight: 1.7, color: T.ink }}>
      <div style={{ padding: "11px 16px", borderBottom: `1px solid ${T.line}`, textAlign: "center" }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.24em", color: T.ink }}>{name || "店舗名"}</span>
      </div>
      <div style={{ padding: "20px 22px 0", textAlign: "center" }}>
        <div style={{ fontSize: 9.5, letterSpacing: "0.12em", color: T.sub }}>ご来店ありがとうございます</div>
        <div style={{ fontSize: 18, fontWeight: 900, lineHeight: 1.5, color: T.ink, marginTop: 6, letterSpacing: "0.02em" }}>今日のご感想を<br />★ひとつから。</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 4, marginTop: 12 }} aria-hidden>
          {[0, 1, 2, 3, 4].map((i) => <span key={i} style={{ fontSize: 17, lineHeight: 1, color: T.gold }}>★</span>)}
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, padding: "16px 22px 14px" }}>
        <div style={{ position: "relative", padding: 10 }}>
          <span style={corner({ top: 0, left: 0, borderTopWidth: 2, borderLeftWidth: 2 }, "5px 0 0 0")} />
          <span style={corner({ top: 0, right: 0, borderTopWidth: 2, borderRightWidth: 2 }, "0 5px 0 0")} />
          <span style={corner({ bottom: 0, left: 0, borderBottomWidth: 2, borderLeftWidth: 2 }, "0 0 0 5px")} />
          <span style={corner({ bottom: 0, right: 0, borderBottomWidth: 2, borderRightWidth: 2 }, "0 0 5px 0")} />
          {qrSvg ? (
            <div style={{ width: 112, height: 112, borderRadius: 4, background: "#ffffff", padding: 6 }} dangerouslySetInnerHTML={{ __html: qrSvg }} />
          ) : (
            <div style={{ width: 112, height: 112, borderRadius: 4, background: "#ffffff", backgroundImage: "repeating-linear-gradient(45deg, #d8d3c6 0 6px, #ffffff 6px 12px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: "#6b6558", background: "#ffffff", padding: "3px 6px", borderRadius: 4 }}>QR</span>
            </div>
          )}
        </div>
        <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, letterSpacing: "0.06em" }}>カメラをかざすだけ ・ 約30秒</div>
      </div>
      {coupon && (
        <div style={{ margin: "0 16px 14px", padding: "9px 12px", borderRadius: 6, background: tone === "dark" ? "rgba(201,168,98,0.12)" : "rgba(156,117,48,0.08)", color: T.ink, fontSize: 10.5, fontWeight: 700, lineHeight: 1.5, alignItems: "center", gap: 9, display: "flex" }}>
          <span style={{ flex: "none", fontSize: 9, fontWeight: 900, letterSpacing: "0.08em", padding: "3px 7px", borderRadius: 3, background: T.gold, color: T.bg }}>特典</span>
          <span style={{ minWidth: 0 }}>{coupon}</span>
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: 9, fontSize: 8.5, fontWeight: 700, letterSpacing: "0.2em", color: T.faint, borderTop: `1px solid ${T.line}` }}>
        <span style={{ width: 14, height: 14, borderRadius: 999, border: `1px solid ${T.faint}`, fontSize: 7.5, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", letterSpacing: 0 }}>判</span>
        <span>太鼓判くん</span>
      </div>
    </div>
  );
}
