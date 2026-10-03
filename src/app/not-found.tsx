import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "radial-gradient(120% 60% at 50% 0%, #faf5ec 0%, #f3ece1 55%, #ece3d4 100%)" }}>
      <div style={{ textAlign: "center", maxWidth: 360 }}>
        <div style={{ width: 52, height: 52, margin: "0 auto", borderRadius: 999, border: "2px solid #b8873a", color: "#b8873a", fontSize: 22, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>判</div>
        <h1 style={{ fontSize: 20, fontWeight: 900, margin: "16px 0 0" }}>ページが見つかりません</h1>
        <p style={{ fontSize: 13.5, color: "#6e6693", margin: "8px 0 0", lineHeight: 1.85 }}>URLが変わったか、まだ公開されていないページです。お手数ですが、お店の方にお声がけください。</p>
        <Link href="/" style={{ display: "inline-block", marginTop: 20, fontSize: 13, fontWeight: 700 }}>太鼓判くんのトップへ</Link>
      </div>
    </div>
  );
}
