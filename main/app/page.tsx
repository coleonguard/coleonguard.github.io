import { Suspense } from "react";
import { HomeExperience } from "@/components/hero/HomeExperience";
import { HeroFallback } from "@/components/hero/Intro";
import { SelectedWork } from "@/components/sections/HomeSections";
import { ResearchPreview } from "@/components/sections/ResearchPreview";

export default function HomePage() {
  return (
    <>
      <main id="main">
        <Suspense fallback={<HeroFallback />}>
          <HomeExperience />
        </Suspense>
        <SelectedWork />
        <ResearchPreview />
      </main>
    </>
  );
}
