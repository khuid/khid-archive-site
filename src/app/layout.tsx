import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "KHID Online Graduation Exhibition Archive",
  description:
    "경희대학교 산업디자인학과 졸업전시 온라인 아카이브. Kyung Hee University Industrial Design graduation exhibition archive.",
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
