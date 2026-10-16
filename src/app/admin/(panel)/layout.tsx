import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth/admin";
import { signOutAction } from "@/app/admin/actions";

// Every page in this group re-verifies the session AND the admin allowlist on the server.
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdmin();
  return <AdminShell email={user.email ?? "admin"} signOut={signOutAction}>{children}</AdminShell>;
}
