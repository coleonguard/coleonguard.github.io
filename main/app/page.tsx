import { HomeExperience } from "@/components/hero/HomeExperience";
import { SelectedWork } from "@/components/sections/HomeSections";
import { ResearchPreview } from "@/components/sections/ResearchPreview";

export default function HomePage() {
  return (
    <>
      <main id="main">
        <HomeExperience />
        <SelectedWork />
        <ResearchPreview />
      </main>
    </>
  );
}
