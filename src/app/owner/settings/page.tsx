import type { Metadata } from "next";
import { StoreDetail } from "@/components/console/StoreDetail";
import { siteOrigin } from "@/lib/origin";
import { loadOwner, OwnerShell } from "../OwnerShell";

export const metadata: Metadata = { title: "店舗設定・QR" };
export const dynamic = "force-dynamic";

export default async function OwnerSettings(props: PageProps<"/owner/settings">) {
  const ctx = await loadOwner();
  const tab = (await props.searchParams).tab;
  const origin = await siteOrigin();
  return (
    <OwnerShell active="settings" {...ctx}>
      <StoreDetail store={ctx.store} role="owner" pageUrl={`${origin}/r/${ctx.store.slug}`} initialTab={tab === "qr" || tab === "preview" ? tab : "settings"} />
    </OwnerShell>
  );
}
