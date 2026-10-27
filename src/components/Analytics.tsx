import Script from "next/script";

/**
 * 방문자 기록 — Google Analytics 4 ("아카이빙" 스트림). 보고서는 analytics.google.com (졸준위 구글 계정)에서
 * 월·주·일·시간대별 방문자, 페이지별 조회, 기기, 유입 경로 확인. 2026 졸전 사이트와 같은 속성, 스트림만 다름.
 * 배포 사이트(Vercel production)에서만 기록 — 로컬·미리보기 배포에서 들어간 건 세지 않음.
 */
const GA_ID = "G-BLVJYDCWPQ";

export default function Analytics() {
  if (!GA_ID || process.env.VERCEL_ENV !== "production") return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga4" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_ID}');`}
      </Script>
    </>
  );
}
