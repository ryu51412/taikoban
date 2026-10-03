import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StoreDetail } from "@/components/console/StoreDetail";
import { requireRole } from "@/lib/auth";
import { siteOrigin } from "@/lib/origin";
import { repo } from "@/lib/repo";
import { AdminShell } from "../../AdminShell";

export const metadata: Metadata = { title: "店舗設定・QR" };
export const dynamic = "force-dynamic";

export default async function AdminStoreDetail(props: PageProps<"/admin/stores/[id]">) {
  const user = await requireRole("operator");
  const { id } = await props.params;
  const tab = (await props.searchParams).tab;
  const [store, stores] = await Promise.all([repo().getStore(id), repo().listStores()]);
  if (!store) notFound();
  const origin = await siteOrigin();
  return (
    <AdminShell active="detail" user={user} storeCount={stores.length} detailId={store.id}>
      <StoreDetail key={store.id} store={store} role="operator" pageUrl={`${origin}/r/${store.slug}`} initialTab={tab === "qr" || tab === "preview" ? tab : "settings"} />
    </AdminShell>
  );
}
