import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "next-themes";
import { siteConfig } from "@/config/site";
import { ogImage } from "@/lib/seo";
import "./globals.css";

// Self-hosted variable fonts (via @fontsource-variable) so builds never depend on Google Fonts.
const inter = localFont({ src: "../fonts/inter-latin-wght-normal.woff2", variable: "--font-inter", display: "swap", weight: "100 900" });
const grotesk = localFont({ src: "../fonts/space-grotesk-latin-wght-normal.woff2", variable: "--font-space-grotesk", display: "swap", weight: "300 700" });
const mono = localFont({ src: "../fonts/jetbrains-mono-latin-wght-normal.woff2", variable: "--font-jetbrains-mono", display: "swap", weight: "100 800" });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: `${siteConfig.name} — ${siteConfig.headline}`, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  keywords: ["Full Stack Developer", "Web Developer", "Next.js", "React", "Supabase", "Freelance Web Developer India", "E-commerce Website Developer"],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  openGraph: {
    type: "website", url: "/", siteName: siteConfig.name, title: `${siteConfig.name} — ${siteConfig.headline}`, description: siteConfig.description, locale: "en_IN",
    images: [{ url: ogImage(), width: 1200, height: 630, alt: siteConfig.name }],
  },
  twitter: { card: "summary_large_image", title: `${siteConfig.name} — ${siteConfig.headline}`, description: siteConfig.description, images: [ogImage()] },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b0d12",
  colorScheme: "dark light",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${grotesk.variable} ${mono.variable}`}>
      <body className="min-h-dvh antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" themes={["dark", "light"]} enableSystem={false} disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
