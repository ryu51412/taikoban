import { STORE_PLANS, STORE_STATUSES, type StoreInput } from "./types";

export const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const clean = (v: unknown, max: number) => String(v ?? "").replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, "").trim().slice(0, max);

export function isHttpsUrl(v: string) {
  try { return new URL(v).protocol === "https:"; } catch { return false; }
}

/** 店舗設定フォームの値を検証して整える */
export function parseStoreInput(raw: Partial<Record<keyof StoreInput, unknown>>): { ok: true; value: StoreInput } | { ok: false; error: string } {
  const name = clean(raw.name, 60);
  const googleReviewUrl = clean(raw.googleReviewUrl, 500);
  const list = (v: unknown) => (Array.isArray(v) ? v : []).slice(0, 3).map((x) => clean(x, 20));
  const aspects = list(raw.aspects), menus = list(raw.menus);
  const coupon = clean(raw.couponText, 80);
  const notifyEmail = clean(raw.notifyEmail, 200);
  const status = STORE_STATUSES.includes(raw.status as never) ? (raw.status as StoreInput["status"]) : "準備中";
  const plan = STORE_PLANS.includes(raw.plan as never) ? (raw.plan as StoreInput["plan"]) : "ライト";

  if (!name) return { ok: false, error: "店舗名を入力してください。" };
  if (googleReviewUrl && !isHttpsUrl(googleReviewUrl)) return { ok: false, error: "Google口コミのURLは https:// から始まるURLを入力してください。" };
  if (status === "公開中" && !googleReviewUrl) return { ok: false, error: "公開するには Google口コミのURL が必要です。" };
  if (aspects.length !== 3 || aspects.some((x) => !x)) return { ok: false, error: "決め手は3つとも入力してください。" };
  if (menus.length !== 3 || menus.some((x) => !x)) return { ok: false, error: "おすすめメニューは3つとも入力してください。" };
  if (notifyEmail && !EMAIL_RE.test(notifyEmail)) return { ok: false, error: "通知先メールの形式をご確認ください。" };

  return {
    ok: true,
    value: {
      name, googleReviewUrl, aspects, menus, couponText: coupon || null, notifyEmail,
      notifyOn: raw.notifyOn !== false, couponOn: raw.couponOn !== false, status, plan,
    },
  };
}

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export { clean };
