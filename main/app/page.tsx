import { Suspense } from "react";
import { HomeExperience } from "@/components/hero/HomeExperience";
import { HeroFallback } from "@/components/hero/Intro";
import { ResearchPreview, SelectedWork } from "@/components/sections/HomeSections";

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
