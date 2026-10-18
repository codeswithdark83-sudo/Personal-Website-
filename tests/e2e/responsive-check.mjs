// Visits every public route at several viewport widths; reports horizontal overflow and saves screenshots.
import { chromium } from "playwright";

const base = process.env.BASE ?? "http://localhost:3100";
const out = process.env.OUT;
const routes = ["/", "/about", "/projects", "/projects/taskflow", "/services", "/credentials", "/blog", "/blog/sample-article", "/contact", "/privacy", "/does-not-exist"];
const sizes = [[320, 640], [375, 812], [667, 375], [768, 1024], [1024, 768], [1440, 900], [1920, 1080]];

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" }).catch(() => chromium.launch());
let bad = 0;
for (const [w, h] of sizes) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  for (const r of routes) {
    await page.goto(base + r, { waitUntil: "networkidle" });
    const over = await page.evaluate(() => {
      const de = document.documentElement;
      const offenders = [...document.querySelectorAll("body *")].filter((el) => el.getBoundingClientRect().right > de.clientWidth + 1 && getComputedStyle(el).position !== "fixed").slice(0, 3).map((el) => el.tagName + "." + String(el.className).slice(0, 50));
      return { sw: de.scrollWidth, cw: de.clientWidth, offenders };
    });
    if (over.sw > over.cw) { bad++; console.log(`OVERFLOW ${w}px ${r}`, JSON.stringify(over)); }
    if (out && (r === "/" || r === "/projects/taskflow") ) await page.screenshot({ path: `${out}/${w}${r.replace(/\//g, "_")}.png`, fullPage: false });
  }
  await ctx.close();
}
await browser.close();
console.log(bad === 0 ? "No horizontal overflow on any route/viewport" : `${bad} overflow issue(s)`);
