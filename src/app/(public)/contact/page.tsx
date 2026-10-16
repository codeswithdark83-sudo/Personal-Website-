import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = { title: "Contact", description: "Get in touch about a project.", alternates: { canonical: "/contact" } };

export default function ContactPage() {
  return <PageHeader title="Get In Touch" description="Have a project in mind or just want to say hello? I'd love to hear from you." />;
}
