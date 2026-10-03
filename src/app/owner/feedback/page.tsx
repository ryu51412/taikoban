import type { Metadata } from "next";
import { repo } from "@/lib/repo";
import { fmtWhen } from "@/lib/stats";
import { loadOwner, OwnerShell } from "../OwnerShell";
import { FeedbackList, type FbFilter } from "./FeedbackList";

export const metadata: Metadata = { title: "届いたご意見" };
export const dynamic = "force-dynamic";

const LIMIT = 200;

export default async function OwnerFeedback(props: PageProps<"/owner/feedback">) {
  const ctx = await loadOwner();
  const list = await repo().listResponses(ctx.store.id, LIMIT);
  const f = (await props.searchParams).filter;
  const initial: FbFilter = f === "open" ? "未対応" : f === "google" ? "Google投稿" : f === "form" ? "ご意見フォーム" : "すべて";
  return (
    <OwnerShell active="feedback" {...ctx}>
      <FeedbackList initialFilter={initial} items={list.map((r) => ({ ...r, when: fmtWhen(r.createdAt) }))} />
    </OwnerShell>
  );
}
