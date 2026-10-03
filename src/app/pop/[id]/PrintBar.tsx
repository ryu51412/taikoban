"use client";

export function PrintBar({ name }: { name: string }) {
  return (
    <div className="no-print" style={{ width: "100%", maxWidth: 560, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", background: "#ffffff", border: "1px solid rgba(36,31,61,0.1)", borderRadius: 16, padding: "14px 16px" }}>
      <div style={{ minWidth: 0, flex: "1 1 220px" }}>
        <div style={{ fontSize: 13.5, fontWeight: 700 }}>{name} の卓上POP（A6）</div>
        <div style={{ fontSize: 12, color: "#6e6693", lineHeight: 1.7 }}>印刷画面で「PDFに保存」を選ぶとPDFになります。用紙サイズはA6、余白なし・背景のグラフィックをオンにしてください。</div>
      </div>
      <button type="button" className="h-dark" onClick={() => window.print()} style={{ padding: "11px 20px", border: "none", borderRadius: 999, background: "#241f3d", color: "#ffffff", fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>
        印刷・PDFに保存
      </button>
    </div>
  );
}
