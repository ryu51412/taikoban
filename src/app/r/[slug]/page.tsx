import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { repo } from "@/lib/repo";
import type { PublicStore } from "@/lib/types";
import { ReviewFlow } from "./ReviewFlow";

export const dynamic = "force-dynamic";

async function load(slug: string): Promise<PublicStore | null> {
  const st = await repo().getStoreBySlug(slug);
  if (!st || st.status === "未発行") return null;
  return {
    slug: st.slug, name: st.name, googleReviewUrl: st.googleReviewUrl, aspects: st.aspects, menus: st.menus,
    coupon: st.couponOn && st.couponText ? st.couponText : null,
  };
}

export async function generateMetadata(props: PageProps<"/r/[slug]">): Promise<Metadata> {
  const st = await load((await props.params).slug);
  return { title: st ? `${st.name} のご感想` : "ページが見つかりません", robots: { index: false } };
}

export default async function ReviewPage(props: PageProps<"/r/[slug]">) {
  const store = await load((await props.params).slug);
  if (!store) notFound();
  return <ReviewFlow store={store} />;
}
