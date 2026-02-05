'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useJob } from "@/contexts/JobContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DotWave } from "@/components/ui/dot-wave";
import { ArrowLeft, Copy, Download } from "lucide-react";

export default function UpdatedJDViewerPage() {
    const router = useRouter();
    const { jobData } = useJob();
    const { occupation, jobDescription } = jobData;
    const [optimizedJD, setOptimizedJD] = useState<string>("");
    const [recommendedLevel, setRecommendedLevel] = useState<string>("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!occupation) {
            router.push('/search');
        }
    }, [occupation, router]);

    useEffect(() => {
        const stored = localStorage.getItem('optimizedJD');
        const level = jobData.level
        
        if (stored) {
            setOptimizedJD(stored);
        } else {
            setOptimizedJD(jobDescription);
        }
        
        setRecommendedLevel(level ? level.toString() : "Not yet determined");
        setLoading(false);
    }, [jobDescription]);

    const handleCopy = () => {
        navigator.clipboard.writeText(optimizedJD);
        alert('Job description copied to clipboard!');
    };

    const handleDownload = () => {
        const element = document.createElement("a");
        const file = new Blob([optimizedJD], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `${occupation.replace(/[^a-z0-9]/gi, '_')}_optimized_jd.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    if (loading) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-[#0a0a0a]">
                <div className="text-neutral-400 text-xl">Loading optimized job description...</div>
            </div>
        );
    }

    return (
        <DotWave
            dotColor="#525252"
            bgColor="#0a0a0a"
            dotRadiusMax={3}
            dotGap={25}
            lightIntensity={0.02}
            fadeIntensity={0.08}
            rippleWidth={80}
            rippleIntensity={0.7}
            staticCenter={true}
            className="min-h-screen w-full bg-[#0a0a0a] flex items-center justify-center p-4 md:p-6"
        >
            <div className="w-full max-w-4xl z-10 space-y-4 md:space-y-6">
                {/* Back Button */}
                <Button
                    onClick={() => router.back()}
                    variant="ghost"
                    className="text-neutral-400 hover:text-white hover:bg-neutral-800/50 mb-4"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>

                {/* Main Card */}
                <Card className="bg-neutral-900/50 backdrop-blur-xl border-neutral-800 shadow-2xl">
                    <CardHeader>
                        <div className="space-y-4">
                            {/* Job Title and Level */}
                            <div>
                                <CardTitle className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-400">
                                    {occupation}
                                </CardTitle>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-sm text-neutral-500">Recommended Wage Level:</span>
                                    <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-full text-sm font-semibold">
                                        Level {recommendedLevel}
                                    </span>
                                </div>
                            </div>


                            <div className="flex gap-3">
                                <Button
                                    onClick={handleCopy}
                                    variant="outline"
                                    className="bg-neutral-800/50 border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white"
                                >
                                    <Copy className="mr-2 h-4 w-4" />
                                    Copy JD
                                </Button>
                                <Button
                                    onClick={handleDownload}
                                    variant="outline"
                                    className="bg-neutral-800/50 border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white"
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Download
                                </Button>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        {/* Optimized Job Description */}
                        <div className="prose prose-invert max-w-none">
                            <div className="bg-neutral-950/50 border border-neutral-800 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">
                                    Optimized Job Description
                                </h3>
                                <div className="text-neutral-300 leading-relaxed whitespace-pre-wrap">
                                    {optimizedJD || "No optimized job description available."}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DotWave>
    );
}
