import { HomeExperience } from "@/components/hero/HomeExperience";
import { Closing, SiteFooter } from "@/components/sections/Closing";
import { SelectedWork } from "@/components/sections/HomeSections";
import { ResearchPreview } from "@/components/sections/ResearchPreview";

export default function HomePage() {
  return (
    <>
      <main id="main">
        <HomeExperience />
        <SelectedWork />
        <ResearchPreview />
        <Closing />
      </main>
      <SiteFooter />
    </>
  );
}
