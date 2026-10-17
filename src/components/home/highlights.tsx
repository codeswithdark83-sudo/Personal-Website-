import { Code2, GraduationCap, LayoutDashboard, Sparkles } from "lucide-react";

const items = [
  { icon: LayoutDashboard, title: "Web Applications", text: "Modern & Scalable" },
  { icon: Code2, title: "Clean Code", text: "Maintainable & Tested" },
  { icon: Sparkles, title: "User Focused", text: "Better Experiences" },
  { icon: GraduationCap, title: "Always Learning", text: "Stay Updated" },
];

export function Highlights() {
  return (
    <section className="container-page">
      <ul className="grid grid-cols-1 gap-3 xs:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent-strong/15 text-accent"><Icon className="size-5" aria-hidden /></span>
            <span><span className="block text-sm font-medium">{title}</span><span className="block text-xs text-muted">{text}</span></span>
          </li>
        ))}
      </ul>
    </section>
  );
}
