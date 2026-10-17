import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { Logo } from "@/components/ui/logo";
import { createServerSupabase } from "@/lib/supabase/server";
import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const { error, next } = await searchParams;
  if (!isSupabaseConfigured()) {
    return (
      <div className="container-page grid min-h-dvh place-items-center py-10">
        <p role="alert" className="max-w-md rounded-xl border border-warning/40 bg-warning/10 p-5 text-sm">
          Admin is not configured. Set <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> (see .env.example).
        </p>
      </div>
    );
  }
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getClaims();
  if (data?.claims && (await supabase.rpc("is_admin")).data) redirect("/admin");

  return (
    <main className="grid min-h-dvh place-items-center bg-background px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <Logo size={44} />
        <h1 className="mt-4 text-2xl font-semibold">Admin sign in</h1>
        <p className="mt-1 mb-6 text-sm text-muted">Private area for managing the portfolio.</p>
        {error === "forbidden" && <p role="alert" className="mb-4 rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm">That account is not authorised for the admin area.</p>}
        <LoginForm next={next} />
      </div>
    </main>
  );
}
