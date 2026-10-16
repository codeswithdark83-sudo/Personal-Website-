import { getAdminOrNull } from "@/lib/auth/admin";
import { toCsv } from "@/lib/csv";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getAdminOrNull();
  if (!admin) return new Response("Unauthorized", { status: 401 });
  const { data, error } = await admin.supabase.from("inquiries").select("created_at,name,email,company,phone,project_type,project_title,budget_range,timeline,preferred_contact,status,next_action,follow_up_at,brief").order("created_at", { ascending: false }).limit(5000);
  if (error) return new Response("Export failed", { status: 500 });
  return new Response(toCsv(data ?? []), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="inquiries.csv"', "Cache-Control": "private, no-store" } });
}
