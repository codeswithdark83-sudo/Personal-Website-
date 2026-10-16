"use client";

import { useId, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { BUDGETS, CONTACT_METHODS, PROJECT_TYPES, TIMELINES } from "@/lib/validation/inquiry";
import { cn } from "@/lib/utils";

type Values = { project_type: string; project_title: string; brief: string; budget_range: string; timeline: string; name: string; email: string; company: string; phone: string; preferred_contact: string; website: string };
const empty: Values = { project_type: "", project_title: "", brief: "", budget_range: "", timeline: "", name: "", email: "", company: "", phone: "", preferred_contact: "email", website: "" };
const steps = ["Project", "Details", "Contact", "Review"] as const;
const stepFields: Record<number, (keyof Values)[]> = { 0: ["project_type", "brief"], 1: [], 2: ["name", "email"], 3: [] };
const inputCls = "min-h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground aria-[invalid=true]:border-danger";

function Field({ label, error, children, id }: { label: string; error?: string; children: React.ReactNode; id: string }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">{label}</label>
      {children}
      {error && <p id={`${id}-err`} className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}

export function InquiryWizard() {
  const uid = useId();
  const [step, setStep] = useState(0);
  const [v, setV] = useState<Values>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [formError, setFormError] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const set = (k: keyof Values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setV((p) => ({ ...p, [k]: e.target.value }));
  const id = (k: string) => `${uid}-${k}`;
  const props = (k: keyof Values) => ({ id: id(k), value: v[k], onChange: set(k), "aria-invalid": errors[k] ? (true as const) : undefined, "aria-describedby": errors[k] ? `${id(k)}-err` : undefined, className: inputCls });

  function validate(s: number) {
    const e: Record<string, string> = {};
    if (stepFields[s]!.includes("project_type") && !v.project_type) e.project_type = "Choose a project type";
    if (stepFields[s]!.includes("brief") && v.brief.trim().length < 10) e.brief = "Please describe your project in at least a few words";
    if (stepFields[s]!.includes("name") && !v.name.trim()) e.name = "Please enter your name";
    if (stepFields[s]!.includes("email") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) e.email = "Enter a valid email address";
    setErrors(e);
    return Object.keys(e).length === 0;
  }
  const go = (n: number) => { setStep(n); setTimeout(() => heading.current?.focus(), 0); };
  const next = () => { if (validate(step)) go(step + 1); };

  async function submit() {
    if (!validate(0) || !validate(2)) { go(!validate(0) ? 0 : 2); return; }
    setStatus("sending"); setFormError("");
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...v, budget_range: v.budget_range || null, timeline: v.timeline || null }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; fieldErrors?: Record<string, string[]> };
      if (res.ok && data.ok) { setStatus("done"); return; }
      if (data.fieldErrors) {
        const fe = Object.fromEntries(Object.entries(data.fieldErrors).map(([k, m]) => [k, m.join(" ")]));
        setErrors(fe);
        go(["project_type", "brief"].some((k) => fe[k]) ? 0 : 2);
      }
      setFormError(data.error ?? "Something went wrong. Please try again.");
    } catch {
      setFormError("Network problem. Please check your connection and try again.");
    }
    setStatus("idle");
  }

  if (status === "done") {
    return (
      <div role="status" className="rounded-2xl border border-success/40 bg-success/10 p-6">
        <CheckCircle2 className="size-6 text-success" aria-hidden />
        <h2 className="mt-3 text-xl font-semibold">Thanks, your inquiry was sent.</h2>
        <p className="mt-2 text-sm text-muted">I will read it and reply using your preferred contact method. If it is urgent, message me on WhatsApp.</p>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); if (step === 3) void submit(); else next(); }} className="rounded-2xl border border-border bg-surface p-5 sm:p-6" noValidate>
      <ol className="mb-6 grid grid-cols-4 gap-2" aria-label="Progress">
        {steps.map((s, i) => (
          <li key={s} aria-current={i === step ? "step" : undefined} className="min-w-0">
            <div className={cn("h-1 rounded-full", i <= step ? "bg-accent-strong" : "bg-elevated")} />
            <span className={cn("mt-1.5 block truncate text-xs", i === step ? "font-medium text-foreground" : "text-muted")}>{i + 1}. {s}</span>
          </li>
        ))}
      </ol>
      <h2 ref={heading} tabIndex={-1} className="mb-4 text-xl font-semibold outline-none">{["Tell me about the project", "A few more details", "How can I reach you?", "Review and send"][step]}</h2>

      {/* Honeypot: hidden from people and assistive tech. */}
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
        <label>Website<input tabIndex={-1} autoComplete="off" value={v.website} onChange={set("website")} /></label>
      </div>

      <div className="space-y-4">
        {step === 0 && (<>
          <Field label="What do you need? *" id={id("project_type")} error={errors.project_type}>
            <select {...props("project_type")}><option value="">Choose…</option>{PROJECT_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
          </Field>
          <Field label="Project name (optional)" id={id("project_title")}><input {...props("project_title")} maxLength={200} /></Field>
          <Field label="Describe your project *" id={id("brief")} error={errors.brief}><textarea {...props("brief")} rows={6} maxLength={5000} /></Field>
        </>)}
        {step === 1 && (<>
          <Field label="Budget (optional)" id={id("budget_range")}><select {...props("budget_range")}><option value="">Prefer not to say</option>{BUDGETS.map((t) => <option key={t}>{t}</option>)}</select></Field>
          <Field label="Timeline (optional)" id={id("timeline")}><select {...props("timeline")}><option value="">Not decided</option>{TIMELINES.map((t) => <option key={t}>{t}</option>)}</select></Field>
        </>)}
        {step === 2 && (<>
          <Field label="Your name *" id={id("name")} error={errors.name}><input {...props("name")} autoComplete="name" maxLength={120} /></Field>
          <Field label="Email *" id={id("email")} error={errors.email}><input {...props("email")} type="email" autoComplete="email" maxLength={254} /></Field>
          <Field label="Company (optional)" id={id("company")}><input {...props("company")} autoComplete="organization" maxLength={160} /></Field>
          <Field label="Phone / WhatsApp (optional)" id={id("phone")} error={errors.phone}><input {...props("phone")} type="tel" autoComplete="tel" maxLength={40} /></Field>
          <Field label="Preferred way to reply" id={id("preferred_contact")}><select {...props("preferred_contact")}>{CONTACT_METHODS.map((m) => <option key={m} value={m}>{m[0]!.toUpperCase() + m.slice(1)}</option>)}</select></Field>
        </>)}
        {step === 3 && (
          <dl className="divide-y divide-border rounded-lg border border-border text-sm">
            {([["Project type", v.project_type], ["Project name", v.project_title], ["Brief", v.brief], ["Budget", v.budget_range], ["Timeline", v.timeline], ["Name", v.name], ["Email", v.email], ["Company", v.company], ["Phone", v.phone], ["Reply via", v.preferred_contact]] as const).filter(([, x]) => x).map(([k, x]) => (
              <div key={k} className="grid gap-1 px-3 py-2 sm:grid-cols-[9rem_1fr]"><dt className="text-muted">{k}</dt><dd className="min-w-0 whitespace-pre-wrap break-words">{x}</dd></div>
            ))}
          </dl>
        )}
      </div>

      <div role="alert" className="empty:hidden">{formError && <p className="mt-4 flex items-start gap-2 rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm"><AlertCircle className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden />{formError}</p>}</div>

      <div className="mt-6 flex flex-wrap justify-between gap-3">
        <button type="button" onClick={() => go(step - 1)} disabled={step === 0 || status === "sending"} className="min-h-11 rounded-lg border border-border px-5 text-sm font-medium disabled:invisible">Back</button>
        <button type="submit" disabled={status === "sending"} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-accent-strong px-6 text-sm font-medium text-white disabled:opacity-60">
          {status === "sending" && <Loader2 className="size-4 animate-spin" aria-hidden />}{step === 3 ? (status === "sending" ? "Sending…" : "Send inquiry") : "Next"}
        </button>
      </div>
    </form>
  );
}
