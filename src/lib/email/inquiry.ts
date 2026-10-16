import "server-only";

/** Escapes user text before placing it in HTML email. */
export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

type Summary = { name: string; email: string; company: string | null; phone: string | null; project_type: string; project_title: string | null; budget_range: string | null; timeline: string | null; brief: string; preferred_contact: string };

export function renderInquiryEmail(i: Summary): { subject: string; html: string; text: string } {
  const rows: [string, string | null][] = [
    ["Name", i.name], ["Email", i.email], ["Company", i.company], ["Phone", i.phone], ["Project type", i.project_type],
    ["Project title", i.project_title], ["Budget", i.budget_range], ["Timeline", i.timeline], ["Preferred contact", i.preferred_contact],
  ];
  const shown = rows.filter((r): r is [string, string] => !!r[1]);
  const html = `<h2>New project inquiry</h2><table cellpadding="6">${shown.map(([k, v]) => `<tr><td><b>${escapeHtml(k)}</b></td><td>${escapeHtml(v)}</td></tr>`).join("")}</table><h3>Brief</h3><p style="white-space:pre-wrap">${escapeHtml(i.brief)}</p>`;
  const text = `New project inquiry\n\n${shown.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\nBrief:\n${i.brief}`;
  // Strip CR/LF so user text cannot inject headers into the subject.
  const subject = `New inquiry: ${i.project_type} from ${i.name}`.replace(/[\r\n]+/g, " ").slice(0, 150);
  return { subject, html, text };
}

/** Returns "sent" | "skipped" (not configured) | "failed". Never throws. */
export async function sendInquiryEmail(i: Summary): Promise<"sent" | "skipped" | "failed"> {
  const key = process.env.RESEND_API_KEY, from = process.env.CONTACT_FROM_EMAIL, to = process.env.CONTACT_TO_EMAIL;
  if (!key || !from || !to) return "skipped";
  try {
    const { Resend } = await import("resend");
    const { subject, html, text } = renderInquiryEmail(i);
    const { error } = await new Resend(key).emails.send({ from, to, subject, html, text, replyTo: i.email });
    return error ? "failed" : "sent";
  } catch {
    return "failed";
  }
}
