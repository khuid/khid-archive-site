import { chromium } from "playwright";
import path from "path";
import fs from "fs";

const outDir = path.join(process.cwd(), "scripts", "out");
fs.mkdirSync(outDir, { recursive: true });

const viewports = [
  { name: "mobile-390", width: 390, height: 844 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "wide-1920", width: 1920, height: 1080 },
];

const browser = await chromium.launch();
for (const vp of viewports) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.waitForTimeout(800); // let entrance animation settle
  const file = path.join(outDir, `${vp.name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  console.log("saved", file);
  await page.close();
}
await browser.close();
