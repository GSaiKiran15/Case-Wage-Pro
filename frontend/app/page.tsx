import { DotWave } from "@/components/ui/dot-wave";

export default function Home() {
  return (
    <>
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
      className="w-full h-screen flex items-center justify-center text-cyan-400 bg-[#0a0a0a]"
    >
      <div className="flex flex-col items-center justify-center text-center z-20 pointer-events-none select-none">
        <h1 className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-white text-5xl md:text-7xl lg:text-8xl font-sans font-bold tracking-tighter drop-shadow-xl">
          Case Wage Pro
        </h1>
        <p className="mt-6 text-neutral-300 text-lg md:text-xl lg:text-2xl font-medium tracking-widest uppercase opacity-80 h-10">
          Maximize your H-1B chances
        </p>
        <div className="mt-8 pointer-events-auto">
          <button className="relative px-8 py-3 rounded-full bg-white/5 border border-white/10 text-neutral-200 font-medium tracking-wide hover:bg-white/10 hover:text-white hover:border-white/20 hover:scale-105 transition-all duration-300 backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] active:scale-95">
            Get Started
          </button>
        </div>
      </div>
    </DotWave>

    <section className="relative w-full py-20 bg-[#0a0a0a] text-white overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <h3 className="text-3xl md:text-5xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-500 pb-2">
          Why Case Wage Pro?
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard 
            title="Smart Compensation" 
            description="AI-driven insights to optimize legal salary structures and ensure competitiveness."
          />
          <FeatureCard 
            title="Real-time Analytics" 
            description="Track market trends and wage data instantly with our advanced dashboard."
          />
          <FeatureCard 
            title="Global Compliance" 
            description="Stay ahead of H-1B regulations and labor laws with automated compliance checks."
          />
        </div>
      </div>
    </section>
    </>
  );
}

import { GlowingEffect } from "@/components/ui/glowing-effect";
import { Copy, TrendingUp, ShieldCheck } from "lucide-react";

const FeatureCard = ({ title, description }: { title: string; description: string }) => {
  return (
    <div className="relative h-64 w-full rounded-2xl bg-neutral-900 border border-neutral-800 font-sans">
      <GlowingEffect
        spread={40}
        glow={true}
        disabled={false}
        proximity={64}
        inactiveZone={0.01}
      />
      <div className="relative flex h-full flex-col justify-between p-6 z-20">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 border border-neutral-700">
             {/* Simple icon mapping based on title or generic */}
             {title.includes("Smart") ? <Copy className="h-5 w-5 text-white" /> : 
              title.includes("Real-time") ? <TrendingUp className="h-5 w-5 text-white" /> :
              <ShieldCheck className="h-5 w-5 text-white" />}
          </div>
          <h4 className="text-xl font-semibold text-neutral-200">{title}</h4>
        </div>
        <p className="text-neutral-400 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};
