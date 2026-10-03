"use client";

import { useRouter } from "next/navigation";
import { useState, type CSSProperties, type KeyboardEvent } from "react";
import { loginAction } from "../actions";

const field = (hasError: boolean): CSSProperties => ({
  width: "100%", marginTop: 6, padding: "13px 14px", border: `1px solid ${hasError ? "#c0562f" : "rgba(36,31,61,0.18)"}`, borderRadius: 12, fontSize: 14, color: "#241f3d", background: "#ffffff",
});

export function LoginForm({ initialError = "" }: { initialError?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (loading) return;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) return setError("メールアドレスの形式をご確認ください。");
    if (password.length < 8) return setError("パスワードは8文字以上です。");
    setLoading(true); setError("");
    try {
      const r = await loginAction(email, password, remember);
      if (!r.ok) { setError(r.error); setLoading(false); return; }
      router.replace(r.to);
      router.refresh();
    } catch {
      setError("通信に失敗しました。時間をおいてお試しください。");
      setLoading(false);
    }
  };
  const onKey = (e: KeyboardEvent) => { if (e.key === "Enter") { e.preventDefault(); submit(); } };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 24 }}>
      <label style={{ display: "block" }}>
        <span style={{ fontSize: 12.5, fontWeight: 700 }}>メールアドレス</span>
        <input type="email" autoComplete="email" placeholder="owner@example.com" style={field(!!error && error.startsWith("メール"))} value={email}
          onChange={(e) => { setEmail(e.target.value); setError(""); }} onKeyDown={onKey} />
      </label>

      <div>
        <label htmlFor="tk-pw" style={{ fontSize: 12.5, fontWeight: 700, display: "block" }}>パスワード</label>
        <span style={{ position: "relative", display: "block" }}>
          <input id="tk-pw" type={showPw ? "text" : "password"} autoComplete="current-password" placeholder="8文字以上" style={{ ...field(!!error && error.startsWith("パスワード")), paddingRight: 58 }}
            value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} onKeyDown={onKey} />
          <button type="button" onClick={() => setShowPw((v) => !v)} aria-label={showPw ? "パスワードを隠す" : "パスワードを表示"}
            style={{ position: "absolute", top: "calc(50% + 3px)", right: 8, transform: "translateY(-50%)", background: "none", border: "none", fontFamily: "inherit", fontSize: 11.5, fontWeight: 700, color: "#6e6693", cursor: "pointer", padding: "6px 8px" }}>
            {showPw ? "隠す" : "表示"}
          </button>
        </span>
      </div>

      <div role="alert" style={{ fontSize: 12.5, fontWeight: 700, color: "#a8452a", background: "#fbeee9", border: "1px solid rgba(168,69,42,0.24)", borderRadius: 12, padding: "11px 13px", lineHeight: 1.7, display: error ? "block" : "none" }}>{error}</div>

      <label style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer" }}>
        <button type="button" role="checkbox" aria-checked={remember} onClick={() => setRemember((v) => !v)}
          style={{ width: 20, height: 20, flex: "none", borderRadius: 6, border: `1px solid ${remember ? "#6852c1" : "rgba(36,31,61,0.24)"}`, background: remember ? "#6852c1" : "#ffffff", color: "#ffffff", fontSize: 11, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 }}>
          <span style={{ opacity: remember ? 1 : 0, lineHeight: 1 }}>✓</span>
        </button>
        <span style={{ fontSize: 12.5, color: "#4b4272" }}>このブラウザでログインを保持する</span>
      </label>

      <button type="button" onClick={submit}
        style={{ width: "100%", marginTop: 4, padding: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, border: "none", borderRadius: 999, fontFamily: "inherit", fontSize: 15, fontWeight: 700, cursor: loading ? "default" : "pointer", background: loading ? "#b9b0dd" : "#6852c1", color: "#ffffff", boxShadow: "0 16px 28px -16px rgba(104,82,193,0.9)", transition: "background .25s ease" }}>
        <span style={{ width: 15, height: 15, borderRadius: 999, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#ffffff", animation: "spin .7s linear infinite", display: loading ? "block" : "none" }} />
        {loading ? "確認しています…" : "ログイン"}
      </button>
    </div>
  );
}
