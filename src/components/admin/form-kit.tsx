"use client";

import { createContext, useActionState, useContext, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActionResult } from "@/lib/validation/content";

const ErrorsContext = createContext<Record<string, string[]>>({});

type Action = (prev: ActionResult, formData: FormData) => Promise<ActionResult>;

/** Form wired to a server action: shows accessible status, per-field errors and follows redirects. */
export function ActionForm({ action, children, className, resetOnSuccess = false }: { action: Action; children: React.ReactNode; className?: string; resetOnSuccess?: boolean }) {
  const [state, formAction] = useActionState(action, { ok: false } as ActionResult);
  const router = useRouter();
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok && state.redirectTo) router.push(state.redirectTo);
    if (state.ok && resetOnSuccess) ref.current?.reset();
  }, [state, router, resetOnSuccess]);

  return (
    <ErrorsContext.Provider value={state.fieldErrors ?? {}}>
      <form ref={ref} action={formAction} className={className} noValidate={false}>
        <div role="status" aria-live="polite" className="empty:hidden">
          {state.ok && state.message && <p className="mb-4 flex items-center gap-2 rounded-lg border border-success/40 bg-success/10 p-3 text-sm"><CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden />{state.message}</p>}
        </div>
        <div role="alert" className="empty:hidden">
          {!state.ok && state.error && <p className="mb-4 flex items-center gap-2 rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm"><AlertCircle className="size-4 shrink-0 text-danger" aria-hidden />{state.error}</p>}
        </div>
        {children}
      </form>
    </ErrorsContext.Provider>
  );
}

const inputCls = "min-h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted/70 aria-[invalid=true]:border-danger";

type FieldProps = {
  name: string; label: string; hint?: string; type?: string; defaultValue?: string | number | null; required?: boolean;
  rows?: number; as?: "input" | "textarea" | "select"; options?: { value: string; label: string }[]; placeholder?: string;
  maxLength?: number; mono?: boolean; className?: string;
};

export function Field({ name, label, hint, type = "text", defaultValue, required, rows = 4, as = "input", options, placeholder, maxLength, mono, className }: FieldProps) {
  const id = useId();
  const errors = useContext(ErrorsContext)[name];
  const describedBy = [hint ? `${id}-hint` : "", errors ? `${id}-err` : ""].filter(Boolean).join(" ") || undefined;
  const common = { id, name, required, "aria-invalid": errors ? true : undefined, "aria-describedby": describedBy, className: cn(inputCls, mono && "font-mono") } as const;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">{label}{required && <span className="text-danger" aria-hidden> *</span>}</label>
      {as === "textarea" ? <textarea {...common} rows={rows} defaultValue={defaultValue ?? ""} placeholder={placeholder} maxLength={maxLength} />
        : as === "select" ? <select {...common} defaultValue={String(defaultValue ?? "")}>{options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
        : <input {...common} type={type} defaultValue={defaultValue ?? ""} placeholder={placeholder} maxLength={maxLength} />}
      {hint && <p id={`${id}-hint`} className="mt-1 text-xs text-muted">{hint}</p>}
      {errors && <p id={`${id}-err`} className="mt-1 text-xs text-danger">{errors.join(" ")}</p>}
    </div>
  );
}

export function Checkbox({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex min-h-11 items-center gap-2 text-sm">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="size-4 accent-[var(--accent-strong)]" />{label}
    </label>
  );
}

export function SubmitButton({ children, variant = "primary", className }: { children: React.ReactNode; variant?: "primary" | "secondary" | "danger"; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-busy={pending}
      className={cn("inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-medium transition-colors disabled:opacity-60",
        variant === "primary" && "bg-accent-strong text-white hover:bg-accent-strong/90",
        variant === "secondary" && "border border-border bg-surface hover:bg-elevated",
        variant === "danger" && "bg-danger text-white hover:bg-danger/90", className)}>
      {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}{children}
    </button>
  );
}

/** Delete with a native <dialog> confirmation (focus-trapped, Escape closes). `action` is a server action taking FormData. */
export function DeleteButton({ action, id, label, what }: { action: (formData: FormData) => Promise<void>; id: string; label?: string; what: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button type="button" onClick={() => ref.current?.showModal()} className="min-h-11 rounded-lg border border-danger/50 px-4 text-sm text-danger hover:bg-danger/10">{label ?? "Delete"}</button>
      <dialog ref={ref} aria-labelledby={`del-${id}`} className="m-auto w-[min(92vw,26rem)] rounded-xl border border-border bg-surface p-6 text-foreground backdrop:bg-black/60">
        <h2 id={`del-${id}`} className="text-lg font-semibold">Delete {what}?</h2>
        <p className="mt-2 text-sm text-muted">This permanently deletes it and cannot be undone.</p>
        <form action={action} className="mt-6 flex justify-end gap-3">
          <input type="hidden" name="id" value={id} />
          <button type="button" onClick={() => ref.current?.close()} className="min-h-11 rounded-lg border border-border px-4 text-sm">Cancel</button>
          <SubmitButton variant="danger">Delete</SubmitButton>
        </form>
      </dialog>
    </>
  );
}

/** Ordered list of {title, body} sections serialised to a hidden JSON field. */
export function BlocksEditor({ name, initial }: { name: string; initial: { id?: string; title: string; body: string }[] }) {
  const [blocks, setBlocks] = useState(initial);
  const move = (i: number, d: -1 | 1) => setBlocks((b) => { const n = [...b]; const j = i + d; if (j < 0 || j >= n.length) return b; [n[i], n[j]] = [n[j]!, n[i]!]; return n; });
  const update = (i: number, patch: Partial<{ title: string; body: string }>) => setBlocks((b) => b.map((x, k) => (k === i ? { ...x, ...patch } : x)));
  return (
    <div className="space-y-4">
      <input type="hidden" name={name} value={JSON.stringify(blocks)} />
      {blocks.length === 0 && <p className="text-sm text-muted">No extra sections yet.</p>}
      {blocks.map((b, i) => (
        <fieldset key={i} className="rounded-lg border border-border p-4">
          <legend className="px-1 text-xs text-muted">Section {i + 1}</legend>
          <label className="mb-1.5 block text-sm font-medium" htmlFor={`${name}-t-${i}`}>Title</label>
          <input id={`${name}-t-${i}`} className={inputCls} value={b.title} maxLength={160} onChange={(e) => update(i, { title: e.target.value })} />
          <label className="mb-1.5 mt-3 block text-sm font-medium" htmlFor={`${name}-b-${i}`}>Content (Markdown)</label>
          <textarea id={`${name}-b-${i}`} rows={5} className={cn(inputCls, "font-mono")} value={b.body} maxLength={20000} onChange={(e) => update(i, { body: e.target.value })} />
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="min-h-11 rounded-lg border border-border px-3 text-sm disabled:opacity-40">Move up</button>
            <button type="button" onClick={() => move(i, 1)} disabled={i === blocks.length - 1} className="min-h-11 rounded-lg border border-border px-3 text-sm disabled:opacity-40">Move down</button>
            <button type="button" onClick={() => setBlocks((x) => x.filter((_, k) => k !== i))} className="min-h-11 rounded-lg border border-danger/50 px-3 text-sm text-danger">Remove</button>
          </div>
        </fieldset>
      ))}
      <button type="button" onClick={() => setBlocks((b) => [...b, { title: "", body: "" }])} className="min-h-11 rounded-lg border border-border bg-surface px-4 text-sm hover:bg-elevated">+ Add section</button>
    </div>
  );
}
