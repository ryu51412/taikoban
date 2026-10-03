import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { repo } from "@/lib/repo";

export default async function AdminStoresIndex() {
  await requireRole("operator");
  const stores = await repo().listStores();
  redirect(stores[0] ? `/admin/stores/${stores[0].id}` : "/admin/new");
}
