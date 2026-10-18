import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth/admin";
import { signOutAction } from "@/app/admin/actions";

// Every page in this group re-verifies the session AND the admin allowlist on the server.
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { user, supabase } = await requireAdmin();
  // One cheap count powers the bell and the sidebar badge on every admin page.
  const { count } = await supabase.from("inquiries").select("*", { count: "exact", head: true }).eq("status", "new");
  return <AdminShell email={user.email ?? "admin"} newInquiries={count ?? 0} signOut={signOutAction}>{children}</AdminShell>;
}
