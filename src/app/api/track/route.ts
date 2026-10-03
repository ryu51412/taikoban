import { NextResponse, type NextRequest } from "next/server";
import { repo } from "@/lib/repo";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { EVENT_TYPES, type EventType } from "@/lib/types";
import { clean, UUID_RE } from "@/lib/validate";

// 口コミページからの記録（匿名）。slug → store はサーバーで解決する
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ ok: false }, { status: 400 });
  const slug = clean(body.slug, 64), sessionId = clean(body.sessionId, 64), type = body.type as EventType;
  if (!UUID_RE.test(sessionId) || !EVENT_TYPES.includes(type) || type === "feedback_submit") return NextResponse.json({ ok: false }, { status: 400 });
  if (!rateLimit(`track:${clientIp(req.headers)}`, 60, 60_000)) return NextResponse.json({ ok: false }, { status: 429 });

  const store = await repo().getStoreBySlug(slug);
  if (!store || store.status === "未発行") return NextResponse.json({ ok: false }, { status: 404 });

  const rating = Number(body.rating);
  const validRating = Number.isInteger(rating) && rating >= 1 && rating <= 5 ? rating : null;
  await repo().insertEvent({ storeId: store.id, sessionId, type, rating: type === "star" ? validRating : null, value: clean(body.value, 40) || null });

  // 投稿ボタン：届いたご意見に「Googleに投稿」として残す（同じ来店は1件にまとめる）
  if (type === "post_click" && validRating) {
    const tags = (Array.isArray(body.tags) ? body.tags : []).slice(0, 2).map((t) => clean(t, 20)).filter(Boolean);
    await repo().upsertResponse({ storeId: store.id, sessionId, rating: validRating, route: "google", tags, text: clean(body.text, 2000) });
  }
  return NextResponse.json({ ok: true });
}
