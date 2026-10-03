import { NextResponse, type NextRequest } from "next/server";
import { ISSUE_TAGS } from "@/lib/compose";
import { sendFeedbackMail } from "@/lib/mail";
import { siteOrigin } from "@/lib/origin";
import { repo } from "@/lib/repo";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { clean, UUID_RE } from "@/lib/validate";

// ご意見フォーム（お店に直接伝える）。Google には投稿されない
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ ok: false }, { status: 400 });
  const slug = clean(body.slug, 64), sessionId = clean(body.sessionId, 64);
  const rating = Number(body.rating);
  if (!UUID_RE.test(sessionId) || !Number.isInteger(rating) || rating < 1 || rating > 5) return NextResponse.json({ ok: false }, { status: 400 });
  if (!rateLimit(`fb:${clientIp(req.headers)}`, 5, 10 * 60_000)) return NextResponse.json({ ok: false, error: "送信が続いています。少し時間をおいてお試しください。" }, { status: 429 });

  const store = await repo().getStoreBySlug(slug);
  if (!store || store.status === "未発行") return NextResponse.json({ ok: false }, { status: 404 });

  const issues = (Array.isArray(body.issues) ? body.issues : []).map(String).filter((t) => ISSUE_TAGS.includes(t));
  const text = clean(body.text, 2000);
  await repo().upsertResponse({ storeId: store.id, sessionId, rating, route: "form", tags: issues, text });
  await repo().insertEvent({ storeId: store.id, sessionId, type: "feedback_submit", rating });
  await sendFeedbackMail(store, { rating, issues, text }, await siteOrigin());
  return NextResponse.json({ ok: true });
}
