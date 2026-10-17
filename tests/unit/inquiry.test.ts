import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { inquirySchema } from "@/lib/validation/inquiry";
import { csvCell, toCsv } from "@/lib/csv";
import { escapeHtml, renderInquiryEmail } from "@/lib/email/inquiry";

const valid = { name: " Asha ", email: "ASHA@Example.com", project_type: "Web application", brief: "I need a dashboard for my shop.", phone: "", company: "" };

describe("inquirySchema", () => {
  it("normalises valid input", () => {
    const r = inquirySchema.parse(valid);
    expect(r.name).toBe("Asha");
    expect(r.email).toBe("asha@example.com");
    expect(r.company).toBeNull();
    expect(r.preferred_contact).toBe("email");
  });
  it("rejects bad email, short brief, unknown type", () => {
    expect(inquirySchema.safeParse({ ...valid, email: "nope" }).success).toBe(false);
    expect(inquirySchema.safeParse({ ...valid, brief: "hi" }).success).toBe(false);
    expect(inquirySchema.safeParse({ ...valid, project_type: "Hack" }).success).toBe(false);
  });
  it("rejects a filled honeypot", () => {
    expect(inquirySchema.safeParse({ ...valid, website: "http://spam" }).success).toBe(false);
  });
});

describe("csv", () => {
  it("neutralises formula injection and quotes", () => {
    expect(csvCell("=SUM(A1)")).toBe("'=SUM(A1)");
    expect(csvCell('a "b", c')).toBe('"a ""b"", c"');
    expect(toCsv([{ a: 1, b: "x" }])).toBe("a,b\r\n1,x\r\n");
  });
});

describe("email", () => {
  it("escapes HTML and strips newlines from subject", () => {
    expect(escapeHtml(`<script>"&'`)).toBe("&lt;script&gt;&quot;&amp;&#39;");
    const e = renderInquiryEmail({ name: "A\r\nBcc: x", email: "a@b.co", company: null, phone: null, project_type: "T", project_title: null, budget_range: null, timeline: null, brief: "<img src=x>", preferred_contact: "email" });
    expect(e.subject).not.toMatch(/[\r\n]/);
    expect(e.html).not.toContain("<img");
  });
});
