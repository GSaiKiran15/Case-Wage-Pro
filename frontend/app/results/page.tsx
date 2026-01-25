'use client';
import { useState, useEffect } from "react";
import { DotWave } from "@/components/ui/dot-wave";
import { Card } from "@/components/ui/card";
import TextGradient from "@/components/text-gradient";

type JobResult = {
  _id: string;
  _score: number;
  fields: {
    description: string;
    title: string;
    value: string;
  }
}

type AnalysisResult = {
  success: boolean;
  filteredResults: string;
  data?: {
    result: {
      hits: JobResult[];
    }
  }
}

export default function ResultsPage() {
    const [results, setResults] = useState<AnalysisResult | null>(null);
    const [jobs, setJobs] = useState<JobResult[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem('analysisResults');
        if (stored) {
            const parsed = JSON.parse(stored);
            setResults(parsed);
            
            // Parse the filteredResults if it's a JSON string
            try {
                const filtered = JSON.parse(parsed.filteredResults);
                setJobs(filtered?.result?.hits || []);
            } catch {
                setJobs([]);
            }
        }
    }, []);

    if (!results) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-[#0a0a0a]">
                <TextGradient className="text-4xl font-bold">
                    Loading...
                </TextGradient>
            </div>
        );
    }

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
            className="w-full min-h-screen flex items-center justify-center bg-[#0a0a0a] py-12"
        >
            <div className="container mx-auto px-6 z-20 max-w-6xl">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-white mb-4">
                        Recommended Occupations
                    </h1>
                    <p className="text-neutral-400 text-lg">
                        {jobs.length} matching job{jobs.length !== 1 ? 's' : ''} found
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {jobs.map((job, index) => (
                        <JobCard key={job._id} job={job} index={index} />
                    ))}
                </div>

                {jobs.length === 0 && (
                    <div className="text-center text-neutral-400 mt-12">
                        <p className="text-xl">No matching occupations found</p>
                        <p className="mt-2">Try adjusting your job description</p>
                    </div>
                )}
            </div>
        </DotWave>
    );
}

function JobCard({ job, index }: { job: JobResult; index: number }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Card 
            className="relative bg-neutral-900/50 backdrop-blur-xl border-neutral-800 shadow-2xl p-6 hover:border-neutral-700 transition-all duration-300 overflow-hidden group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                animationDelay: `${index * 100}ms`,
                animation: 'fadeInUp 0.5s ease-out forwards',
                opacity: 0
            }}
        >
            {/* Meteor effect on hover */}
            <div 
                className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-cyan-400 via-blue-500 to-transparent transition-all duration-700"
                style={{
                    width: isHovered ? '100%' : '0',
                    opacity: isHovered ? 0.1 : 0,
                    transform: isHovered ? 'translateX(0)' : 'translateX(100%)'
                }}
            />

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-1">
                            {job.fields.title}
                        </h3>
                        <p className="text-sm text-neutral-500 font-mono">
                            Code: {job.fields.value}
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-neutral-500 mb-1">Match Score</div>
                        <div className="text-2xl font-bold text-cyan-400">
                            {Math.round(job._score * 100)}%
                        </div>
                    </div>
                </div>

                <p className="text-neutral-300 text-sm leading-relaxed line-clamp-4">
                    {job.fields.description}
                </p>
            </div>

            <style jsx>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </Card>
    );
}