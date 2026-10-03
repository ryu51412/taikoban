import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { repo } from "@/lib/repo";
import { AdminShell } from "../AdminShell";
import { NewStoreForm } from "./NewStoreForm";

export const metadata: Metadata = { title: "新規ページ発行" };
export const dynamic = "force-dynamic";

export default async function AdminNew() {
  const user = await requireRole("operator");
  const stores = await repo().listStores();
  return (
    <AdminShell active="new" user={user} storeCount={stores.length} detailId={stores[0]?.id}>
      <NewStoreForm />
    </AdminShell>
  );
}
