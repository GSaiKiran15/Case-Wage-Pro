import { DotWave } from "@/components/ui/dot-wave";
import { SearchForm } from "@/components/search-form";

export default function SearchPage() {
  return (
    <DotWave
      dotGap={20}
      dotRadiusMax={3}
      expansionSpeed={250}
      lightIntensity={0.02}
      fadeIntensity={0.08}
      dotColor="white"
      bgColor="#0a0a0a"
      rippleCount={2}
      rippleSpeed={80}
      rippleWidth={80}
      rippleIntensity={0.7}
      staticCenter={true}
      className="w-full min-h-screen flex items-center justify-center text-cyan-400 bg-[#0a0a0a] py-10"
    >
      <div className="z-20 w-full max-w-5xl px-4 animate-in fade-in zoom-in duration-500">
        <SearchForm className="w-full bg-neutral-900/50 backdrop-blur-xl border-neutral-800 shadow-2xl" />
      </div>
    </DotWave>
  );
}
