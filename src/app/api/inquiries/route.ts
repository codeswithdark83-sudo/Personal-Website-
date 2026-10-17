import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { inquirySchema } from "@/lib/validation/inquiry";
import { clientIp, rateLimit } from "@/lib/rate-limit/memory";
import { sendInquiryEmail } from "@/lib/email/inquiry";
import { fieldErrorsFrom } from "@/lib/validation/content";

export const dynamic = "force-dynamic";

const json = (body: object, status = 200, headers?: HeadersInit) => NextResponse.json(body, { status, headers });

export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  const rl = rateLimit(`inquiry:${ip}`, 5, 10 * 60_000);
  if (!rl.allowed) return json({ ok: false, error: "Too many requests. Please try again later." }, 429, { "Retry-After": String(rl.retryAfterSec) });

  const len = Number(req.headers.get("content-length") ?? 0);
  if (len > 30_000) return json({ ok: false, error: "Request too large." }, 413);

  let body: unknown;
  try { body = await req.json(); } catch { return json({ ok: false, error: "Invalid request." }, 400); }

  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) {
    // A filled honeypot is treated as success so bots learn nothing.
    if ((body as { website?: unknown } | null)?.website) return json({ ok: true });
    return json({ ok: false, error: "Please fix the highlighted fields.", fieldErrors: fieldErrorsFrom(parsed.error) }, 422);
  }
  const { website: _hp, ...data } = parsed.data;
  void _hp;

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return json({ ok: false, error: "The inquiry form is not available right now. Please email or WhatsApp me instead." }, 503);
  }

  let id: string;
  try {
    const supabase = createServiceClient();
    const { data: row, error } = await supabase.from("inquiries").insert(data).select("id").single();
    if (error) throw error;
    id = row.id;
    // Email is best-effort: the inquiry is already saved, so a mail failure must not lose it or turn into an error.
    try {
      const status = await sendInquiryEmail(data);
      await supabase.from("inquiries").update({ email_notification: status }).eq("id", id);
    } catch { /* record stays 'pending'; visible in the admin inbox */ }
  } catch (e) {
    console.error("[inquiry] save failed", (e as { code?: string }).code);
    return json({ ok: false, error: "Could not send your inquiry. Please try again or email me directly." }, 500);
  }
  return json({ ok: true });
}
