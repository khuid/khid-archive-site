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
        <hr className="border-t border-foreground/20" />
        <Phase2Timeline exhibitions={exhibitions} />
        <hr className="border-t border-foreground/20" />
        <Phase3Grid exhibitions={exhibitions} />
      </main>
    </>
  );
}
