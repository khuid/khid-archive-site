import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { getLinkPreviewVersion, LINK_PREVIEW_SIZE } from "@/lib/exhibitions";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

const freesentation = localFont({
  variable: "--font-freesentation",
  src: [
    { path: "../../public/fonts/Freesentation-4Regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/Freesentation-5Medium.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/Freesentation-6SemiBold.woff2", weight: "600", style: "normal" },
  ],
});

// 링크 공유 미리보기 이미지(og/route.tsx). 초대장이 바뀌면 주소도 바뀌어 메신저가 새로 받아감
const previewImage = {
  url: `/og?v=${getLinkPreviewVersion()}`,
  ...LINK_PREVIEW_SIZE,
  alt: "KHID Graduation Exhibition Archive",
  type: "image/png",
};

export const metadata: Metadata = {
  title: "KHID Online Graduation Exhibition Archive",
  description:
    "경희대학교 산업디자인학과 졸업전시 온라인 아카이브. Kyung Hee University Industrial Design graduation exhibition archive.",
  // 링크 공유 미리보기의 굵은 제목 (탭 제목과 따로 지정)
  openGraph: {
    title: "KHID Graduation Exhibition Archive",
    description:
      "경희대학교 산업디자인학과 졸업전시 온라인 아카이브. Kyung Hee University Industrial Design graduation exhibition archive.",
    type: "website",
    images: [previewImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "KHID Graduation Exhibition Archive",
    images: [previewImage],
  },
  // 파비콘: SVG 하나가 브라우저 다크모드를 따라 색이 바뀜(크롬·엣지·파이어폭스).
  // SVG 파비콘을 못 쓰는 브라우저(사파리)는 모드별 PNG로 대체
  icons: {
    icon: [
      { url: "/favicon/icon-light.png", type: "image/png", sizes: "64x64", media: "(prefers-color-scheme: light)" },
      { url: "/favicon/icon-dark.png", type: "image/png", sizes: "64x64", media: "(prefers-color-scheme: dark)" },
      { url: "/favicon/icon.svg", type: "image/svg+xml", sizes: "any" },
    ],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${roboto.variable} ${freesentation.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
