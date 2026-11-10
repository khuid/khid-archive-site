import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Phase1Hero from "@/components/Phase1Hero";
import Phase2Timeline from "@/components/Phase2Timeline";
import Phase3Grid from "@/components/Phase3Grid";
import { cacheLife } from "next/cache";
import { getExhibitionPhase } from "@/lib/exhibitionPhase";
import { getExhibitions } from "@/lib/exhibitions";

// 홈 안내 제목(UPCOMING/ONGOING/LATEST)의 첫 화면 값. 서버에서는 한 시간마다 다시 계산하고,
// 브라우저에서도 방문자 시각으로 한 번 더 확인함(Phase1Hero)
async function getBuildPhase(startDate?: string, endDate?: string) {
  "use cache";
  cacheLife("hours");
  return getExhibitionPhase(startDate, endDate);
}

export default async function Home() {
  const exhibitions = getExhibitions();
  const buildPhase = await getBuildPhase(exhibitions[0]?.startDate, exhibitions[0]?.endDate);

  return (
    <>
      <Header />
      <main>
        <Phase1Hero exhibitions={exhibitions} buildPhase={buildPhase} />
        <Phase2Timeline exhibitions={exhibitions} />
        <Phase3Grid exhibitions={exhibitions} />
      </main>
      <Footer />
    </>
  );
}
