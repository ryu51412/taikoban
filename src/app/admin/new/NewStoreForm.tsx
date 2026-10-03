"use client";

import Link from "next/link";
import { useState } from "react";
import { createStoreAction } from "@/app/actions";
import { PageTitle } from "@/components/console/PageTitle";
import { pill } from "@/components/console/StoreDetail";
import { Toast, useToast } from "@/components/Toast";
import { STORE_PLANS, type StorePlan } from "@/lib/types";

const EMPTY = { name: "", googleReviewUrl: "", aspects: ["", "", ""], menus: ["", "", ""], couponText: "", notifyEmail: "", plan: "ライト" as StorePlan };

export function NewStoreForm() {
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [published, setPublished] = useState<{ id: string } | null>(null);
  const [toast, showToast] = useToast();
  const set = (patch: Partial<typeof form>) => { setForm((f) => ({ ...f, ...patch })); setError(""); };

  const publish = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const r = await createStoreAction({ ...form, couponText: form.couponText || null, couponOn: true });
      if (!r.ok) { setError(r.error); return; }
      setPublished({ id: r.id });
      showToast("ページを発行しました");
    } catch {
      setError("通信に失敗しました。時間をおいてお試しください。");
    } finally {
      setBusy(false);
    }
  };

  const previewName = form.name || "店舗名";

  return (
    <div className="tk-fade">
      <PageTitle title="新しい店舗ページを発行" sub="入力内容がそのままお客様の画面になります。発行後も編集できます。" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: 16, marginTop: 20, alignItems: "start" }}>
        <div className="tk-card">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <label style={{ display: "block" }}>
              <span className="tk-label">店舗名</span>
              <input className="tk-input" value={form.name} maxLength={60} onChange={(e) => set({ name: e.target.value })} placeholder="例：ホルモン丑之助" />
            </label>
            <label style={{ display: "block" }}>
              <span className="tk-label">Google口コミのURL</span>
              <input className="tk-input" value={form.googleReviewUrl} inputMode="url" onChange={(e) => set({ googleReviewUrl: e.target.value })} placeholder="https://g.page/r/..." />
              <span style={{ fontSize: 11.5, color: "#6e6693" }}>ビジネスプロフィールの「クチコミを増やす」から取得できます。</span>
            </label>
            {([["aspects", "決め手の選択肢（3つ）"], ["menus", "おすすめメニュー（3つ）"]] as const).map(([key, label]) => (
              <div key={key}>
                <span className="tk-label">{label}</span>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(96px, 1fr))", gap: 8, marginTop: 6 }}>
                  {form[key].map((v, i) => (
                    <input key={i} className="tk-input-tight" aria-label={`${label} ${i + 1}`} value={v} maxLength={20}
                      placeholder={key === "aspects" ? ["料理", "接客", "雰囲気"][i] : ["おすすめ1", "おすすめ2", "おすすめ3"][i]}
                      onChange={(e) => { const next = [...form[key]]; next[i] = e.target.value; set({ [key]: next } as Partial<typeof form>); }} />
                  ))}
                </div>
              </div>
            ))}
            <label style={{ display: "block" }}>
              <span className="tk-label">特典メッセージ（任意）</span>
              <input className="tk-input" value={form.couponText} maxLength={80} onChange={(e) => set({ couponText: e.target.value })} placeholder="例：当日の利用のみ500円引き" />
              <span style={{ fontSize: 11.5, color: "#6e6693" }}>回答してくださったお客様全員に表示します（Googleへの投稿の見返りにはしません）。</span>
            </label>
            <label style={{ display: "block" }}>
              <span className="tk-label">ご意見の通知先メール</span>
              <input className="tk-input" type="email" value={form.notifyEmail} onChange={(e) => set({ notifyEmail: e.target.value })} placeholder="owner@example.com" />
            </label>
            <div>
              <span className="tk-label">プラン</span>
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                {STORE_PLANS.map((p) => <button key={p} type="button" style={pill(form.plan === p)} onClick={() => set({ plan: p })}>{p}</button>)}
              </div>
            </div>
          </div>

          {error && <div role="alert" style={{ marginTop: 16, fontSize: 12.5, fontWeight: 700, color: "#a8452a", background: "#fbeee9", border: "1px solid rgba(168,69,42,0.24)", borderRadius: 12, padding: "11px 13px", lineHeight: 1.7 }}>{error}</div>}

          <div style={{ display: "flex", gap: 10, marginTop: 22, flexWrap: "wrap" }}>
            <button type="button" className="h-purple" onClick={publish} disabled={busy || !!published}
              style={{ padding: "13px 22px", border: "none", borderRadius: 999, background: busy || published ? "#b9b0dd" : "#6852c1", color: "#ffffff", fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              {busy ? "発行しています…" : "ページを発行する"}
            </button>
            <Link href="/admin" className="h-white" style={{ padding: "13px 20px", border: "1px solid rgba(36,31,61,0.16)", borderRadius: 999, background: "#ffffff", color: "#241f3d", fontSize: 14, fontWeight: 700 }}>キャンセル</Link>
          </div>
          {published && (
            <div style={{ marginTop: 14, fontSize: 12.5, fontWeight: 700, color: "#2f6b4f" }}>
              発行しました（状態：準備中）。<Link href={`/admin/stores/${published.id}?tab=qr`} style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>QRコードのダウンロードに進む →</Link>
            </div>
          )}
        </div>

        <div style={{ position: "sticky", top: 80 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#8b7f63", letterSpacing: "0.06em", marginBottom: 10 }}>お客様画面のプレビュー</div>
          <div style={{ width: "100%", maxWidth: 300, borderRadius: 26, background: "#16112b", padding: 10, boxShadow: "0 26px 48px -26px rgba(36,31,61,0.6)" }}>
            <div style={{ background: "#f7f4ee", borderRadius: 19, padding: "16px 13px" }}>
              <div style={{ background: "#ffffff", borderRadius: 16, overflow: "hidden" }}>
                <div style={{ background: "linear-gradient(155deg, #6852c1, #8474cd)", padding: "16px 14px", textAlign: "center", color: "#ffffff" }}>
                  <div style={{ fontSize: 9.5, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>ご来店ありがとうございました</div>
                  <div style={{ fontSize: 15, fontWeight: 900, marginTop: 5 }}>{previewName}</div>
                </div>
                <div style={{ padding: "14px 13px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, fontWeight: 700 }}>今日の決め手は？</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, justifyContent: "center", marginTop: 10 }}>
                    {form.aspects.map((a, i) => (
                      <span key={i} style={{ fontSize: 10.5, fontWeight: 700, padding: "6px 11px", borderRadius: 999, background: i === 0 ? "#6852c1" : "#ffffff", color: i === 0 ? "#ffffff" : "#4b4272", border: `1.5px solid ${i === 0 ? "#6852c1" : "#ded5ef"}` }}>{a || "—"}</span>
                    ))}
                  </div>
                  {form.couponText && <div style={{ marginTop: 12, fontSize: 10.5, fontWeight: 700, color: "#8a5f20", background: "#fdf8ec", border: "1px dashed #b8873a", borderRadius: 10, padding: 8 }}>{form.couponText}</div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toast msg={toast} />
    </div>
  );
}
