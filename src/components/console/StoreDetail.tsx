"use client";

import { useState, type CSSProperties } from "react";
import { saveStoreAction } from "@/app/actions";
import { POP_TONES, TablePop, type PopTone } from "@/components/TablePop";
import { Toast, useToast } from "@/components/Toast";
import { downloadQr, useQrSvg } from "@/components/useQr";
import { fmtMD } from "@/lib/stats";
import { STORE_PLANS, STORE_STATUSES, type Role, type Store } from "@/lib/types";

export const pill = (active: boolean): CSSProperties => ({
  padding: "9px 16px", borderRadius: 999, border: `1px solid ${active ? "#241f3d" : "rgba(36,31,61,0.16)"}`, background: active ? "#241f3d" : "#ffffff",
  color: active ? "#ffffff" : "#4b4272", fontFamily: "inherit", fontSize: 12.5, fontWeight: 700, cursor: "pointer",
});
const smallPill = (active: boolean): CSSProperties => ({
  padding: "6px 13px", borderRadius: 999, border: `1px solid ${active ? "#241f3d" : "rgba(36,31,61,0.16)"}`, background: active ? "#241f3d" : "#ffffff",
  color: active ? "#ffffff" : "#6e6693", fontFamily: "inherit", fontSize: 11.5, fontWeight: 700, cursor: "pointer",
});

export function Toggle({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={onClick}
      style={{ marginLeft: "auto", flex: "none", width: 44, height: 26, borderRadius: 999, border: "none", cursor: "pointer", padding: 3, display: "flex", justifyContent: on ? "flex-end" : "flex-start", background: on ? "#6852c1" : "#ded7c9" }}>
      <span style={{ width: 20, height: 20, borderRadius: 999, background: "#ffffff", display: "block" }} />
    </button>
  );
}

type Tab = "settings" | "qr" | "preview";

export function StoreDetail({ store: initial, role, pageUrl, initialTab = "settings" }: { store: Store; role: Role; pageUrl: string; initialTab?: Tab }) {
  const [store, setStore] = useState(initial);
  const [tab, setTab] = useState<Tab>(initialTab);
  const [form, setForm] = useState({
    name: initial.name, googleReviewUrl: initial.googleReviewUrl, couponText: initial.couponText ?? "", notifyEmail: initial.notifyEmail,
    aspects: [...initial.aspects, "", "", ""].slice(0, 3), menus: [...initial.menus, "", "", ""].slice(0, 3),
    notifyOn: initial.notifyOn, couponOn: initial.couponOn, status: initial.status, plan: initial.plan,
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [tone, setTone] = useState<PopTone>("paper");
  const [copyState, setCopyState] = useState("");
  const [toast, showToast] = useToast();
  const qrSvg = useQrSvg(pageUrl);
  const popQr = useQrSvg(pageUrl, tone === "dark" ? "#231f2c" : "#241f3d");

  const set = (patch: Partial<typeof form>) => { setForm((f) => ({ ...f, ...patch })); setSaved(false); setError(""); };

  const save = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const r = await saveStoreAction(store.id, { ...form, couponText: form.couponText || null });
      if (!r.ok) { setError(r.error); showToast("保存できませんでした"); return; }
      setStore(r.store); setSaved(true); showToast("設定を保存しました");
    } catch {
      setError("通信に失敗しました。時間をおいてお試しください。");
    } finally {
      setSaving(false);
    }
  };

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(pageUrl); setCopyState("ページURLをコピーしました"); showToast("URLをコピーしました"); }
    catch { setCopyState(pageUrl); showToast("手動でコピーしてください"); }
  };

  const openPop = () => window.open(`/pop/${store.id}?tone=${tone}`, "_blank");
  const fileBase = `taikoban-qr-${store.slug}`;
  const couponShown = form.couponOn && form.couponText ? form.couponText : null;
  const isOperator = role === "operator";

  return (
    <div className="tk-fade">
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900 }}>{store.name}</h1>
        <span style={{ fontSize: 12, fontWeight: 700, padding: "5px 12px", borderRadius: 999, background: "#f1edfb", color: "#52409c" }}>{store.plan}</span>
        {isOperator && <StatusBadge status={store.status} />}
        <span style={{ fontSize: 12, color: "#6e6693" }}>最終更新 {fmtMD(store.updatedAt)}</span>
      </div>

      <div style={{ display: "flex", gap: 6, marginTop: 16, flexWrap: "wrap" }} role="tablist">
        {([["settings", "設定"], ["qr", "QRコード"], ["preview", "プレビュー"]] as [Tab, string][]).map(([k, label]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} style={pill(tab === k)} onClick={() => setTab(k)}>{label}</button>
        ))}
      </div>

      {tab === "settings" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginTop: 16, alignItems: "start" }}>
          <div className="tk-card">
            <div style={{ fontSize: 14, fontWeight: 700 }}>基本設定</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
              <label style={{ display: "block" }}>
                <span className="tk-label">店舗名</span>
                <input className="tk-input" value={form.name} maxLength={60} onChange={(e) => set({ name: e.target.value })} />
              </label>
              <label style={{ display: "block" }}>
                <span className="tk-label">Google口コミのURL</span>
                <input className="tk-input" value={form.googleReviewUrl} inputMode="url" placeholder="https://g.page/r/..." onChange={(e) => set({ googleReviewUrl: e.target.value })} />
              </label>
              <label style={{ display: "block" }}>
                <span className="tk-label">特典メッセージ</span>
                <input className="tk-input" value={form.couponText} maxLength={80} placeholder="例：当日の利用のみ500円引き" onChange={(e) => set({ couponText: e.target.value })} />
              </label>
              <label style={{ display: "block" }}>
                <span className="tk-label">ご意見の通知先メール</span>
                <input className="tk-input" type="email" value={form.notifyEmail} onChange={(e) => set({ notifyEmail: e.target.value })} />
              </label>
              {isOperator && (
                <>
                  <div>
                    <span className="tk-label">公開状態</span>
                    <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                      {STORE_STATUSES.map((s) => <button key={s} type="button" style={pill(form.status === s)} onClick={() => set({ status: s })}>{s}</button>)}
                    </div>
                  </div>
                  <div>
                    <span className="tk-label">プラン</span>
                    <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                      {STORE_PLANS.map((p) => <button key={p} type="button" style={pill(form.plan === p)} onClick={() => set({ plan: p })}>{p}</button>)}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid rgba(36,31,61,0.1)", display: "flex", flexDirection: "column", gap: 12 }}>
              {([
                ["notifyOn", "ご意見をメールで通知", "ご意見フォームに回答が届いたら、すぐにメールします。"],
                ["couponOn", "特典メッセージを表示", "回答してくださったお客様全員に特典を表示します（Googleへの投稿とは関係ありません）。"],
              ] as const).map(([key, label, desc]) => (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{label}</div>
                    <div style={{ fontSize: 11.5, color: "#6e6693", lineHeight: 1.6 }}>{desc}</div>
                  </div>
                  <Toggle on={form[key]} label={label} onClick={() => set({ [key]: !form[key] } as Partial<typeof form>)} />
                </div>
              ))}
            </div>
            {error && <div role="alert" style={{ marginTop: 16, fontSize: 12.5, fontWeight: 700, color: "#a8452a", background: "#fbeee9", border: "1px solid rgba(168,69,42,0.24)", borderRadius: 12, padding: "11px 13px", lineHeight: 1.7 }}>{error}</div>}
            <button type="button" className="h-purple" onClick={save} disabled={saving}
              style={{ marginTop: 18, padding: "12px 20px", border: "none", borderRadius: 999, background: saving ? "#b9b0dd" : "#6852c1", color: "#ffffff", fontFamily: "inherit", fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>
              {saving ? "保存しています…" : saved ? "保存しました" : "変更を保存"}
            </button>
          </div>

          <div className="tk-card">
            <div style={{ fontSize: 14, fontWeight: 700 }}>選択肢</div>
            <div style={{ fontSize: 12, color: "#6e6693", marginTop: 4 }}>お客様が「決め手」「メニュー」で選ぶ項目です。</div>
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 14 }}>
              {([["aspects", "決め手"], ["menus", "おすすめメニュー"]] as const).map(([key, label]) => (
                <div key={key}>
                  <span className="tk-label">{label}</span>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(96px, 1fr))", gap: 8, marginTop: 6 }}>
                    {form[key].map((v, i) => (
                      <input key={i} className="tk-input-tight" aria-label={`${label}${i + 1}`} value={v} maxLength={20}
                        onChange={(e) => { const next = [...form[key]]; next[i] = e.target.value; set({ [key]: next } as Partial<typeof form>); }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 18, padding: "14px 16px", borderRadius: 14, background: "#faf7f1", border: "1px solid rgba(36,31,61,0.1)", fontSize: 12, color: "#4b4272", lineHeight: 1.8 }}>選択肢を変えると、生成される文章の言い回しも変わります。3つとも埋めてください。</div>
          </div>
        </div>
      )}

      {tab === "qr" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginTop: 16, alignItems: "start" }}>
          <div className="tk-card">
            <div style={{ fontSize: 14, fontWeight: 700 }}>QRコード</div>
            <div style={{ fontSize: 12, color: "#6e6693", marginTop: 4, wordBreak: "break-all" }}>読み取り先：{pageUrl}</div>
            <div style={{ margin: "18px auto 0", width: 190, height: 190, borderRadius: 12, background: "#ffffff", border: "1px solid rgba(36,31,61,0.14)", padding: 14 }}
              role="img" aria-label="QRコード" dangerouslySetInnerHTML={{ __html: qrSvg }} />
            <div style={{ display: "flex", gap: 8, marginTop: 18, flexWrap: "wrap", justifyContent: "center" }}>
              {([["PNG（画像）", () => downloadQr(pageUrl, "png", fileBase)], ["SVG（印刷用）", () => downloadQr(pageUrl, "svg", fileBase)], ["PDF（卓上POP）", openPop]] as const).map(([label, fn]) => (
                <button key={label} type="button" className="h-lilac" onClick={() => { fn(); if (!label.startsWith("PDF")) showToast(`${label} をダウンロードしました`); }}
                  style={{ padding: "10px 16px", border: "1px solid rgba(104,82,193,0.3)", borderRadius: 999, background: "#ffffff", color: "#52409c", fontFamily: "inherit", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="tk-card">
            <div style={{ fontSize: 14, fontWeight: 700 }}>卓上POPテンプレート</div>
            <div style={{ fontSize: 12, color: "#6e6693", marginTop: 4 }}>印刷してレジ横やテーブルに置くだけ。</div>
            <div style={{ display: "flex", gap: 5, marginTop: 14 }}>
              {POP_TONES.map((t) => <button key={t.key} type="button" style={smallPill(tone === t.key)} onClick={() => setTone(t.key)}>{t.label}</button>)}
            </div>
            <div style={{ marginTop: 14, padding: "26px 22px", borderRadius: 16, background: "#e9e2d4", display: "flex", justifyContent: "center" }}>
              <TablePop tone={tone} name={form.name} coupon={couponShown} qrSvg={popQr} />
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
              <button type="button" className="h-dark" onClick={openPop}
                style={{ flex: 1, minWidth: 150, padding: 12, border: "none", borderRadius: 999, background: "#241f3d", color: "#ffffff", fontFamily: "inherit", fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>
                印刷用PDFを開く
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === "preview" && (
        <div className="tk-card" style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>お客様画面の確認</div>
            <p style={{ fontSize: 13, color: "#6e6693", margin: "8px 0 0", lineHeight: 1.85 }}>設定した内容が反映された実際のページを開いて確認できます。公開前にスマホでも読み取ってみてください。</p>
            {store.status === "未発行" && <p style={{ fontSize: 12, color: "#a8452a", margin: "8px 0 0", fontWeight: 700 }}>この店舗は「未発行」のため、お客様画面はまだ表示されません。</p>}
            <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
              <a href={pageUrl} target="_blank" rel="noopener" className="h-purple" style={{ padding: "12px 20px", borderRadius: 999, background: "#6852c1", color: "#ffffff", fontSize: 13.5, fontWeight: 700 }}>お客様画面を開く</a>
              <button type="button" className="h-white" onClick={copyLink} style={{ padding: "12px 18px", border: "1px solid rgba(36,31,61,0.16)", borderRadius: 999, background: "#ffffff", fontFamily: "inherit", fontSize: 13.5, fontWeight: 700, color: "#241f3d", cursor: "pointer" }}>ページURLをコピー</button>
            </div>
            <div style={{ marginTop: 14, fontSize: 12, color: "#8b7f63", fontWeight: 700, wordBreak: "break-all" }}>{copyState}</div>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ width: 240, borderRadius: 24, background: "#16112b", padding: 9 }}>
              <div style={{ background: "#f7f4ee", borderRadius: 17, padding: "14px 12px", textAlign: "center" }}>
                <div style={{ background: "linear-gradient(155deg, #6852c1, #8474cd)", borderRadius: 14, padding: "14px 12px", color: "#ffffff" }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>ご来店ありがとうございました</div>
                  <div style={{ fontSize: 14, fontWeight: 900, marginTop: 4 }}>{form.name || "店舗名"}</div>
                </div>
                <div style={{ display: "flex", justifyContent: "center", gap: 1, marginTop: 12 }} aria-hidden>
                  {[0, 1, 2, 3, 4].map((i) => <span key={i} style={{ fontSize: 20, color: i < 4 ? "#6852c1" : "#ded5ef" }}>★</span>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Toast msg={toast} />
    </div>
  );
}

export function StatusBadge({ status }: { status: Store["status"] }) {
  const c = status === "公開中" ? ["#eaf3ee", "#2f6b4f"] : status === "準備中" ? ["#fdf8ec", "#8a5f20"] : ["#f4f1ea", "#6e6693"];
  return <span style={{ fontSize: 11.5, fontWeight: 700, padding: "4px 10px", borderRadius: 999, background: c[0], color: c[1], whiteSpace: "nowrap" }}>{status}</span>;
}
