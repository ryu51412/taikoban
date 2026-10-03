"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Toast, useToast } from "@/components/Toast";
import { composeDraft, ISSUE_TAGS } from "@/lib/compose";
import type { EventType, PublicStore } from "@/lib/types";

type Step = "rate" | "aspect" | "menu" | "positive" | "negative" | "thanks";

const RATING_WORDS = ["", "申し訳ありません…", "ご期待に添えず…", "ありがとうございます", "うれしいです！", "最高の評価、感激です！"];

function newSessionId(): string {
  try {
    const k = "tk_session";
    const saved = sessionStorage.getItem(k);
    if (saved) return saved;
    const id = crypto.randomUUID();
    sessionStorage.setItem(k, id);
    return id;
  } catch {
    const b = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256));
    b[6] = (b[6] & 0x0f) | 0x40; b[8] = (b[8] & 0x3f) | 0x80;
    const h = b.map((x) => x.toString(16).padStart(2, "0")).join("");
    return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
  }
}

const reducedMotion = () => typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

function chipStyle(active: boolean, tone: "warm" | "muted"): CSSProperties {
  const on = tone === "warm" ? "#6852c1" : "#8b7f63";
  return {
    padding: "12px 20px", borderRadius: 999, fontFamily: "inherit", fontSize: 15, fontWeight: 700, cursor: "pointer", minHeight: 46,
    transition: "transform .15s ease", border: `1.5px solid ${active ? on : "#ded5ef"}`, background: active ? on : "#ffffff",
    color: active ? "#ffffff" : "#4b4272", transform: active ? "scale(1.03)" : "none",
  };
}

const linkBtn: CSSProperties = { background: "none", border: "none", fontFamily: "inherit", fontSize: 13, color: "#8b7f63", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 };

export function ReviewFlow({ store }: { store: PublicStore }) {
  const hasMenus = store.menus.length > 0;
  const [step, setStep] = useState<Step>("rate");
  const [rating, setRating] = useState(0);
  const [tapped, setTapped] = useState(0);
  const [aspect, setAspect] = useState<string | null>(null);
  const [menu, setMenu] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [typed, setTyped] = useState(0);
  const [typing, setTyping] = useState(false);
  const [copied, setCopied] = useState(false);
  const [issues, setIssues] = useState<string[]>([]);
  const [feedback, setFeedback] = useState("");
  const [sending, setSending] = useState(false);
  const [toast, showToast] = useToast(2000);

  const session = useRef("");
  const stepTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const typeTimer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const track = (type: EventType, extra: Record<string, unknown> = {}) => {
    try {
      fetch("/api/track", {
        method: "POST", keepalive: true, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: store.slug, sessionId: session.current, type, ...extra }),
      }).catch(() => {});
    } catch {}
  };

  useEffect(() => {
    session.current = newSessionId();
    track("qr_open");
    return () => { clearTimeout(stepTimer.current); clearInterval(typeTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const typeOut = (text: string) => {
    clearInterval(typeTimer.current);
    setDraft(text);
    if (reducedMotion()) { setTyped(text.length); setTyping(false); return; }
    setTyped(0); setTyping(true);
    let n = 0;
    typeTimer.current = setInterval(() => {
      n += 2;
      if (n >= text.length) { clearInterval(typeTimer.current); setTyped(text.length); setTyping(false); }
      else setTyped(n);
    }, 26);
  };

  const toPositive = (a: string, m: string | null) => {
    setStep("positive"); setCopied(false);
    typeOut(composeDraft({ store: store.name, aspect: a, menu: m, rating }));
  };

  const pickStar = (n: number) => {
    setRating(n); setTapped(n);
    track("star", { rating: n });
    clearTimeout(stepTimer.current);
    // どの★でも同じ流れ（レビューゲーティングをしない）
    stepTimer.current = setTimeout(() => { setStep("aspect"); setTapped(0); }, 480);
  };

  const pickAspect = (label: string) => {
    setAspect(label);
    track("aspect", { value: label });
    clearTimeout(stepTimer.current);
    stepTimer.current = setTimeout(() => (hasMenus ? setStep("menu") : toPositive(label, null)), 240);
  };

  const pickMenu = (label: string) => {
    setMenu(label);
    track("menu", { value: label });
    clearTimeout(stepTimer.current);
    stepTimer.current = setTimeout(() => toPositive(aspect ?? store.aspects[0], label), 240);
  };

  const skipMenu = () => { setMenu(null); toPositive(aspect ?? store.aspects[0], null); };

  const copyText = async (text: string) => {
    try {
      if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); return true; }
    } catch {}
    try {
      const tmp = document.createElement("textarea");
      tmp.value = text; tmp.setAttribute("readonly", ""); tmp.style.position = "fixed"; tmp.style.opacity = "0";
      document.body.appendChild(tmp); tmp.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(tmp);
      return ok;
    } catch { return false; }
  };

  const copyAndOpen = async () => {
    if (typing) return;
    track("post_click", { rating, text: draft, tags: [aspect, menu].filter(Boolean) });
    const ok = await copyText(draft);
    setCopied(true);
    showToast(ok ? "コピーしました。貼り付けて投稿してください" : "手動でコピーしてください");
    setTimeout(() => {
      const w = window.open(store.googleReviewUrl, "_blank");
      if (w) { try { w.opener = null; } catch {} } else window.location.href = store.googleReviewUrl;
    }, 400);
  };

  const sendFeedback = async () => {
    if (sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: store.slug, sessionId: session.current, rating: rating || 1, issues, text: feedback }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        showToast(j.error || "送信できませんでした。もう一度お試しください");
        return;
      }
      setStep("thanks");
    } catch {
      showToast("送信できませんでした。電波の良い場所でお試しください");
    } finally {
      setSending(false);
    }
  };

  const goBack = () => {
    const back: Partial<Record<Step, Step>> = { aspect: "rate", menu: "aspect", positive: hasMenus ? "menu" : "aspect", negative: "positive" };
    clearTimeout(stepTimer.current);
    setStep(back[step] ?? "rate");
    setCopied(false);
  };

  const order: Step[] = hasMenus ? ["rate", "aspect", "menu", "positive"] : ["rate", "aspect", "positive"];
  const idx = order.indexOf(step);
  const visibleDraft = typing ? draft.slice(0, typed) : draft;
  const canGoBack = step === "aspect" || step === "menu" || step === "positive" || step === "negative";

  const coupon = store.coupon ? (
    <div style={{ marginTop: 18, display: "flex", gap: 12, alignItems: "center", textAlign: "left", padding: "15px 16px", borderRadius: 16, background: "#fdf8ec", border: "1.5px dashed #b8873a" }}>
      <div style={{ width: 34, height: 34, borderRadius: 999, background: "#b8873a", color: "#fdf8ec", fontSize: 16, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>判</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: "#b8873a" }}>
          {step === "thanks" ? "この画面を店員にお見せください" : "ご回答ありがとうございます。特典"}
        </div>
        <div style={{ fontSize: 14.5, fontWeight: 700, marginTop: 2, color: "#2a2350" }}>{store.coupon}</div>
      </div>
    </div>
  ) : null;

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(120% 60% at 50% 0%, #faf5ec 0%, #f3ece1 55%, #ece3d4 100%)", padding: "28px 18px 40px", display: "flex", flexDirection: "column", alignItems: "center", gap: 18, color: "#2a2350" }}>
      <div style={{ width: "100%", maxWidth: 430, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 30, height: 30, borderRadius: 10, background: "#6852c1", color: "#ffffff", fontSize: 15, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 14px -6px rgba(104,82,193,0.8)" }}>判</div>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", color: "#8b7f63" }}>太鼓判くん</div>
        </div>
        <div style={{ fontSize: 12, fontWeight: 500, color: "#8b7f63" }}>{idx >= 0 ? `STEP ${idx + 1} / ${order.length}` : ""}</div>
      </div>

      <main style={{ width: "100%", maxWidth: 430, background: "#ffffff", borderRadius: 26, boxShadow: "0 2px 4px rgba(42,35,80,0.05), 0 26px 50px -28px rgba(104,82,193,0.55)", overflow: "hidden" }}>
        <div style={{ padding: "26px 24px 22px", background: "linear-gradient(155deg, #6852c1 0%, #7b67c9 60%, #8474cd 100%)", color: "#ffffff", textAlign: "center" }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.86)" }}>ご来店ありがとうございました</div>
          <h1 style={{ margin: "8px 0 0", fontSize: 27, fontWeight: 900, lineHeight: 1.35, letterSpacing: "0.01em" }}>{store.name}</h1>
          <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 18 }} aria-hidden>
            {order.map((k, i) => (
              <div key={k} style={{ height: 4, width: i <= idx ? 26 : 18, borderRadius: 999, background: i <= idx && idx >= 0 ? "#ffffff" : "rgba(255,255,255,0.32)", transition: "all .25s ease" }} />
            ))}
          </div>
        </div>

        <div style={{ padding: "26px 22px 24px" }}>
          {step === "rate" && (
            <div style={{ textAlign: "center", animation: "popIn .3s ease both" }}>
              <div style={{ fontSize: 17, fontWeight: 700 }}>今日のお食事はいかがでしたか？</div>
              <div style={{ fontSize: 13, color: "#6b6396", marginTop: 6 }}>星をタップするだけ。30秒で終わります。</div>
              <div style={{ display: "flex", justifyContent: "center", gap: 2, marginTop: 20 }} role="radiogroup" aria-label="評価">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`星${n}つ`} onClick={() => pickStar(n)}
                    style={{
                      width: 56, height: 56, flex: "none", border: "none", background: "transparent", cursor: "pointer", padding: 0, fontSize: 40, lineHeight: 1,
                      transition: "transform .18s ease, color .18s ease", color: n <= rating ? "#6852c1" : "#ded5ef", transform: n <= rating ? "scale(1.06)" : "none",
                      animation: n <= tapped ? `starTap .42s ease ${(n - 1) * 55}ms both` : "none",
                    }}
                  >★</button>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#a49b7f", margin: "2px 8px 0" }}>
                <span>もう少し</span><span>最高</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#6852c1", marginTop: 12, height: 20, transition: "opacity .25s ease", opacity: rating ? 1 : 0 }}>{RATING_WORDS[rating]}</div>
            </div>
          )}

          {step === "aspect" && (
            <div style={{ textAlign: "center", animation: "popIn .3s ease both" }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#6852c1" }}>ありがとうございます！</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginTop: 16 }}>今日の決め手はどれですか？</div>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 9, marginTop: 16 }}>
                {store.aspects.map((label) => (
                  <button key={label} type="button" style={chipStyle(aspect === label, "warm")} onClick={() => pickAspect(label)}>{label}</button>
                ))}
              </div>
            </div>
          )}

          {step === "menu" && (
            <div style={{ textAlign: "center", animation: "popIn .3s ease both" }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: "#8b7f63" }}>あと1つだけ</div>
              <div style={{ fontSize: 17, fontWeight: 700, marginTop: 8 }}>特に良かったメニューは？</div>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 9, marginTop: 16 }}>
                {store.menus.map((label) => (
                  <button key={label} type="button" style={chipStyle(menu === label, "warm")} onClick={() => pickMenu(label)}>{label}</button>
                ))}
              </div>
              <button type="button" style={{ ...linkBtn, marginTop: 16 }} onClick={skipMenu}>選ばずに進む</button>
            </div>
          )}

          {step === "positive" && (
            <div style={{ animation: "popIn .3s ease both" }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
                <div style={{ fontSize: 17, fontWeight: 700 }}>口コミの下書きができました</div>
                <button type="button" disabled={typing} style={{ background: "none", border: "none", fontFamily: "inherit", fontSize: 12, fontWeight: 700, color: "#6852c1", cursor: "pointer", padding: "4px 0", whiteSpace: "nowrap", opacity: typing ? 0.5 : 1 }}
                  onClick={() => { setCopied(false); typeOut(composeDraft({ store: store.name, aspect: aspect ?? store.aspects[0], menu, rating })); }}>
                  別の文にする
                </button>
              </div>
              <div style={{ fontSize: 12.5, color: "#6b6396", marginTop: 4 }}>
                {typing ? "あなたの選択から下書きを組み立てています…" : "自動で作った下書きです。そのままでも、自由に書き直してもOKです。"}
              </div>

              <div style={{ marginTop: 14, border: "1.5px solid #ded5ef", borderRadius: 16, background: "#f8f6fd", padding: 4, position: "relative" }}>
                <textarea
                  rows={7} aria-label="口コミの下書き" value={visibleDraft} readOnly={typing}
                  onChange={(e) => { setDraft(e.target.value); setTyped(e.target.value.length); setCopied(false); }}
                  style={{ width: "100%", display: "block", border: "none", background: "transparent", resize: "vertical", fontSize: 15, lineHeight: 1.85, color: "#2a2350", padding: "12px 13px", minHeight: 152, outline: "none" }}
                />
                <div style={{ position: "absolute", top: 10, right: 12, display: typing ? "flex" : "none", alignItems: "center", gap: 6, fontSize: 10.5, fontWeight: 700, color: "#6852c1", background: "#ffffff", padding: "4px 9px", borderRadius: 999, border: "1px solid #ded5ef" }}>
                  <span style={{ width: 6, height: 6, borderRadius: 999, background: "#6852c1", display: "block", animation: "blink .9s steps(1) infinite" }} />
                  生成中
                </div>
              </div>

              <button
                type="button" onClick={copyAndOpen} aria-disabled={typing}
                style={{
                  width: "100%", marginTop: 16, padding: "17px 20px", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, border: "none", borderRadius: 999,
                  fontFamily: "inherit", fontSize: 16, fontWeight: 700, cursor: typing ? "default" : "pointer", background: typing ? "#b9b0dd" : copied ? "#3f7a5c" : "#6852c1",
                  color: "#ffffff", boxShadow: "0 14px 26px -14px rgba(104,82,193,0.9)", transition: "background .3s ease",
                }}
              >
                <span style={{ width: 24, height: 24, borderRadius: 999, border: "1.5px solid currentColor", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, flex: "none" }}>G</span>
                {typing ? "文章を生成中…" : copied ? "コピー済み・Googleを開く" : "コピーしてGoogleに投稿"}
              </button>
              <div style={{ fontSize: 12, color: "#8b7f63", textAlign: "center", marginTop: 10, lineHeight: 1.65 }}>コピーしてGoogleを開きます。投稿画面で長押し＆貼り付けしてください。</div>

              {rating > 0 && rating < 4 && (
                <div style={{ marginTop: 18, padding: "14px 16px", borderRadius: 16, background: "#faf7f1", border: "1.5px solid #e2dbcd", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ fontSize: 12.5, color: "#6b6396", lineHeight: 1.7, minWidth: 0, flex: "1 1 180px" }}>気になった点は、お店にだけ伝えることもできます。</div>
                  <button type="button" onClick={() => setStep("negative")} style={{ background: "#ffffff", border: "1.5px solid #ded5ef", borderRadius: 999, padding: "9px 16px", fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: "#6852c1", cursor: "pointer", whiteSpace: "nowrap" }}>
                    お店に直接伝える →
                  </button>
                </div>
              )}

              {coupon}
            </div>
          )}

          {step === "negative" && (
            <div style={{ animation: "popIn .3s ease both" }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#2a2350" }}>お聞かせいただけますか</div>
              <div style={{ fontSize: 13.5, color: "#6b6396", marginTop: 8, lineHeight: 1.8 }}>この内容は店長にだけ届きます。Googleには投稿されません。今後の改善に必ず活かします。</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
                {ISSUE_TAGS.map((label) => {
                  const on = issues.includes(label);
                  return (
                    <button key={label} type="button" aria-pressed={on} style={chipStyle(on, "muted")} onClick={() => setIssues((xs) => (on ? xs.filter((x) => x !== label) : [...xs, label]))}>{label}</button>
                  );
                })}
              </div>
              <div style={{ marginTop: 14, border: "1.5px solid #e2dbcd", borderRadius: 16, background: "#faf7f1", padding: 4 }}>
                <textarea
                  rows={5} placeholder="気になった点をご記入ください（任意）" aria-label="ご意見" value={feedback} maxLength={2000} onChange={(e) => setFeedback(e.target.value)}
                  style={{ width: "100%", display: "block", border: "none", background: "transparent", resize: "vertical", fontSize: 15, lineHeight: 1.8, color: "#2a2350", padding: "12px 13px", minHeight: 112, outline: "none" }}
                />
              </div>
              <button type="button" className="h-purple" disabled={sending} onClick={sendFeedback}
                style={{ width: "100%", marginTop: 16, padding: "17px 20px", border: "none", borderRadius: 999, background: sending ? "#b9b0dd" : "#6852c1", color: "#ffffff", fontFamily: "inherit", fontSize: 16, fontWeight: 700, cursor: sending ? "default" : "pointer", boxShadow: "0 12px 24px -14px rgba(104,82,193,0.9)" }}>
                {sending ? "送信しています…" : "送信する"}
              </button>
            </div>
          )}

          {step === "thanks" && (
            <div style={{ textAlign: "center", animation: "popIn .3s ease both", padding: "8px 0" }}>
              <div style={{ width: 58, height: 58, margin: "0 auto", borderRadius: 999, background: "#6852c1", color: "#ffffff", fontSize: 26, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>判</div>
              <div style={{ fontSize: 20, fontWeight: 900, marginTop: 16 }}>ありがとうございました</div>
              <div style={{ fontSize: 13.5, color: "#6b6396", marginTop: 8, lineHeight: 1.8 }}>いただいたご意見は店長が直接確認します。<br />またのご来店を心よりお待ちしております。</div>
              {coupon}
            </div>
          )}
        </div>
      </main>

      {canGoBack && (
        <button type="button" onClick={goBack} style={{ background: "none", border: "none", fontFamily: "inherit", fontSize: 13, fontWeight: 500, color: "#8b7f63", cursor: "pointer", padding: "4px 10px" }}>← ひとつ前にもどる</button>
      )}

      <div style={{ fontSize: 11.5, color: "#a49b7f", letterSpacing: "0.04em", marginTop: "auto", paddingTop: 8 }}>判 太鼓判くん</div>
      <Toast msg={toast} tone="review" />
    </div>
  );
}
