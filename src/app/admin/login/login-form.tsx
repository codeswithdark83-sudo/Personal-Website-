"use client";

import { ActionForm, Field, SubmitButton } from "@/components/admin/form-kit";
import { signInAction } from "@/app/admin/actions";

export function LoginForm({ next }: { next?: string }) {
  return (
    <ActionForm action={signInAction} className="space-y-4">
      <input type="hidden" name="next" value={next ?? ""} />
      <Field name="email" label="Email" type="email" required placeholder="you@example.com" />
      <Field name="password" label="Password" type="password" required />
      <SubmitButton className="w-full">Sign in</SubmitButton>
    </ActionForm>
  );
}
