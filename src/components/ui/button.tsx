import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-medium transition duration-200 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "btn3d btn3d-primary text-white",
        secondary: "btn3d btn3d-secondary border border-border text-foreground",
        ghost: "text-muted hover:text-foreground",
      },
      size: { md: "", sm: "min-h-9 px-3 text-xs" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type Props = VariantProps<typeof buttonVariants> & { className?: string; children: React.ReactNode };

export function ButtonLink({ href, variant, size, className, children, ...rest }: Props & { href: string } & Omit<React.ComponentProps<typeof Link>, "href" | "className" | "children">) {
  return (
    <Link href={href} className={cn(buttonVariants({ variant, size }), className)} {...rest}>
      {children}
    </Link>
  );
}

export function Button({ variant, size, className, ...rest }: Props & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...rest} />;
}
