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
  await page
    .waitForFunction(() => {
      const v = document.querySelector("video");
      return !v || v.readyState >= 2;
    }, { timeout: 5000 })
    .catch(() => {});
  // 헤드리스 자동화 컨텍스트에서는 autoplay가 간헐적으로 지연될 수 있어 명시적으로 play() 호출
  // (실사용자 브라우저에서는 muted+autoPlay만으로 정상 재생됨 — 이건 캡처 신뢰성을 위한 보정)
  await page.evaluate(() => document.querySelector("video")?.play().catch(() => {}));
  await page.waitForTimeout(1500); // 영상이 몇 프레임 진행된 뒤 캡처
  const file = path.join(outDir, `${vp.name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  console.log("saved", file);
  await page.close();
}
await browser.close();
