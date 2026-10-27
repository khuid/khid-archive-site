import Script from "next/script";

/**
 * 방문자 기록 — Google Analytics 4 ("아카이빙" 스트림). 보고서는 analytics.google.com (졸준위 구글 계정)에서
 * 월·주·일·시간대별 방문자, 페이지별 조회, 기기, 유입 경로 확인. 2026 졸전 사이트와 같은 속성, 스트림만 다름.
 * 배포 사이트(Vercel production)에서만 기록 — 로컬·미리보기 배포에서 들어간 건 세지 않음.
 * 운영자 본인 방문 빼기: 주소 끝에 ?notrack=1 로 한 번 들어가면 그 브라우저는 이후 기록 안 됨(?notrack=0 으로 해제).
 * 브라우저마다 따로 저장됨(크롬·사파리·카톡 안 브라우저 각각), 방문 기록 지우거나 시크릿 창이면 다시 기록됨
 */
const GA_ID = "G-BLVJYDCWPQ";

export default function Analytics() {
  if (!GA_ID || process.env.VERCEL_ENV !== "production") return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga4" strategy="afterInteractive">
        {`try{var n=new URLSearchParams(location.search).get('notrack');if(n==='1')localStorage.setItem('khid-notrack','1');if(n==='0')localStorage.removeItem('khid-notrack');if(localStorage.getItem('khid-notrack'))window['ga-disable-${GA_ID}']=true}catch(e){}window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_ID}');`}
      </Script>
    </>
  );
}
