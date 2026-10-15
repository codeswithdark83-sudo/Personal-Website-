import type { Metadata } from "next";
import "./globals.css";

const origin = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(origin),
  title: { default: "Jatin Kr. Koli — Full Stack Developer", template: "%s | Jatin Kr. Koli" },
  description: "Portfolio of Jatin Kr. Koli, a full stack developer building thoughtful digital experiences.",
  openGraph: { title: "Jatin Kr. Koli — Full Stack Developer", description: "Thoughtful digital experiences, built end to end.", type: "website" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
