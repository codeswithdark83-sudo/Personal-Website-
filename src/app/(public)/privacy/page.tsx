import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = pageMetadata({ title: "Privacy", description: "How personal information submitted through this site is handled.", path: "/privacy" });

const sections = [
  ["What I collect", "When you submit the project inquiry form I collect the details you enter: name, email, optional company, project details, budget and timeline, and preferred contact method."],
  ["How it is used", "Only to reply to your inquiry and to discuss a potential project. It is never sold or used for unrelated marketing."],
  ["Where it is stored", "Inquiries are stored in a private database that only the site owner can access, and may be forwarded to the owner by email."],
  ["Retention", "Inquiries are kept only as long as needed to handle the conversation. [Owner: confirm your retention period.]"],
  ["Your rights", "You can ask to see, correct or delete your information at any time by contacting me."],
  ["Analytics", "If analytics is enabled it is configured to be privacy-conscious. [Owner: name the provider you use.]"],
];

export default function PrivacyPage() {
  return (
    <>
      <PageHeader title="Privacy" description="How personal information submitted through this website is handled." />
      <div className="container-page max-w-3xl space-y-8 py-10">
        {sections.map(([h, t]) => (<section key={h}><h2 className="text-xl font-semibold">{h}</h2><p className="mt-2 text-muted">{t}</p></section>))}
      </div>
    </>
  );
}
