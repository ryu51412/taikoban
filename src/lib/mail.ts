import "server-only";
import type { Store } from "./types";

/** ご意見フォームの通知（Resend）。RESEND_API_KEY が無ければログに出すだけ */
export async function sendFeedbackMail(store: Store, fb: { rating: number; issues: string[]; text: string }, origin: string) {
  if (!store.notifyOn || !store.notifyEmail) return;
  const subject = `【太鼓判くん】${store.name} にご意見が届きました（★${fb.rating}）`;
  const lines = [
    `${store.name} のご意見フォームに回答が届きました。`,
    "",
    `評価：${"★".repeat(fb.rating)}${"☆".repeat(5 - fb.rating)}`,
    fb.issues.length ? `気になった点：${fb.issues.join("、")}` : "",
    "",
    "ご意見：",
    fb.text || "（記入なし）",
    "",
    `管理画面で確認する：${origin}/owner/feedback`,
  ].filter((l, i, a) => !(l === "" && a[i - 1] === ""));
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.info("[mail] RESEND_API_KEY 未設定のため送信をスキップ:", store.notifyEmail, subject);
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.RESEND_FROM || "太鼓判くん <onboarding@resend.dev>", to: [store.notifyEmail], subject, text: lines.join("\n") }),
    });
    if (!res.ok) console.error("[mail] 送信に失敗しました", res.status, await res.text());
  } catch (e) {
    console.error("[mail] 送信に失敗しました", e);
  }
}
