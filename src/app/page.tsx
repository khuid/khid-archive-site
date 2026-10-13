import Header from "@/components/Header";
import Phase1Hero from "@/components/Phase1Hero";
import Phase2Timeline from "@/components/Phase2Timeline";
import Phase3Grid from "@/components/Phase3Grid";
import { getExhibitions } from "@/lib/exhibitions";

export default function Home() {
  const exhibitions = getExhibitions();

  return (
    <>
      <Header />
      <main>
        <Phase1Hero exhibitions={exhibitions} />
        <Phase2Timeline exhibitions={exhibitions} />
        <Phase3Grid exhibitions={exhibitions} />
      </main>
    </>
  );
}
