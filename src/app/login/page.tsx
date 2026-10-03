import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser, homeFor } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/config";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "ログイン", robots: { index: false } };

const SUPPORT_HREF =
  "mailto:ryu.ishizaki514@gmail.com?subject=%E3%80%90%E5%A4%AA%E9%BC%93%E5%88%A4%E3%81%8F%E3%82%93%E3%80%91%E3%82%B5%E3%83%9D%E3%83%BC%E3%83%88%E3%81%8A%E5%95%8F%E3%81%84%E5%90%88%E3%82%8F%E3%81%9B&body=%E5%BA%97%E8%88%97%E5%90%8D%EF%BC%9A%0D%0A%E3%81%94%E9%80%A3%E7%B5%A1%E5%85%88%EF%BC%9A%0D%0A%0D%0A%E3%81%8A%E5%9B%B0%E3%82%8A%E3%81%AE%E5%86%85%E5%AE%B9%EF%BC%9A%0D%0A";

const POINTS = ["Googleに投稿された口コミを一覧で確認", "お店にだけ届いたご意見に対応", "QRコードと卓上POPをいつでも再発行"];

export default async function LoginPage(props: PageProps<"/login">) {
  const u = await getSessionUser();
  if (u && (u.role === "operator" || u.storeId)) redirect(homeFor(u.role));
  const sp = await props.searchParams;
  const demo = !isSupabaseConfigured();

  return (
    <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", background: "#f7f2ea" }}>
      <div style={{ background: "linear-gradient(158deg, #6852c1 0%, #7b67c9 55%, #8474cd 100%)", color: "#ffffff", padding: "clamp(32px, 5vw, 56px)", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 32, minHeight: 260 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.45)", fontSize: 15, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>判</span>
          <span style={{ fontSize: 16, fontWeight: 900 }}>太鼓判くん</span>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: "rgba(255,255,255,0.8)", letterSpacing: "0.06em" }}>店舗管理</span>
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: "clamp(22px, 3.2vw, 30px)", fontWeight: 900, lineHeight: 1.55 }}>お客様の声を、<br />今日の一手に。</h1>
          <p style={{ margin: "14px 0 0", fontSize: 14.5, color: "rgba(255,255,255,0.85)", lineHeight: 1.95, maxWidth: "40ch" }}>届いた口コミとご意見、★の推移、QRコードの管理。店舗のページに関わることは、すべてこの画面から。</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {POINTS.map((p) => (
            <div key={p} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "rgba(255,255,255,0.86)" }}>
              <span style={{ width: 5, height: 5, borderRadius: 999, background: "#ffffff", flex: "none" }} />{p}
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "clamp(28px, 5vw, 56px) clamp(20px, 5vw, 48px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: 400 }}>
          <div style={{ animation: "fadeUp .3s ease both" }}>
            <h2 style={{ margin: 0, fontSize: 21, fontWeight: 900 }}>ログイン</h2>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: "#6e6693" }}>ご契約時にお送りしたメールアドレスでログインしてください。</p>
            <LoginForm initialError={sp.e === "nostore" ? "このアカウントには店舗が登録されていません。サポートにお問い合わせください。" : ""} />
            <div style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid rgba(36,31,61,0.1)", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12.5, color: "#6e6693" }}>ログインできない</span>
              <a href={SUPPORT_HREF} className="h-lilac" style={{ marginLeft: "auto", padding: "9px 16px", border: "1px solid rgba(104,82,193,0.3)", borderRadius: 999, background: "#ffffff", color: "#52409c", fontSize: 12.5, fontWeight: 700 }}>サポートにメールで問い合わせ</a>
            </div>
            {demo && (
              <div style={{ marginTop: 18, padding: "12px 14px", borderRadius: 12, background: "#fdf8ec", border: "1px dashed #b8873a", fontSize: 12, color: "#8a5f20", lineHeight: 1.8 }}>
                デモモード（Supabase 未設定）：<br />
                オーナー owner@example.com ／ 運営 operator@example.com<br />
                パスワードはどちらも password123
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
