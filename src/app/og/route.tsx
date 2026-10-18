import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { siteConfig } from "@/config/site";

// Link-preview card (1200x630) used by Open Graph and Twitter metadata.
export function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const title = (p.get("title") || `${siteConfig.name}`).slice(0, 90);
  const sub = (p.get("sub") || siteConfig.headline).slice(0, 120);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "linear-gradient(135deg,#0b0d12 0%,#12192b 60%,#1b1f4a 100%)", color: "#f4f6fb" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="72" height="72" viewBox="0 0 512 512" fill="none">
            <defs><linearGradient id="g" x1="90" y1="80" x2="420" y2="430" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#22d3ee" /><stop offset="0.55" stopColor="#5b8cff" /><stop offset="1" stopColor="#8b5cf6" /></linearGradient></defs>
            <g stroke="url(#g)" strokeWidth="54" strokeLinecap="round" strokeLinejoin="round">
              <path d="M262 92V324C262 382 226 416 176 416C140 416 116 400 102 372" /><path d="M262 272L396 98" /><path d="M316 200L402 414" />
            </g>
          </svg>
          <div style={{ fontSize: 34, fontWeight: 600 }}>{siteConfig.name}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: title.length > 40 ? 62 : 80, fontWeight: 700, lineHeight: 1.1 }}>{title}</div>
          <div style={{ fontSize: 30, color: "#9fb4e8", lineHeight: 1.35 }}>{sub}</div>
        </div>
        <div style={{ fontSize: 26, color: "#78a6ff" }}>{siteConfig.url.replace(/^https?:\/\//, "")}</div>
      </div>
    ),
    { width: 1200, height: 630, headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400" } },
  );
}
