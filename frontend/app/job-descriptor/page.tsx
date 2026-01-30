'use client'

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useJob } from "@/contexts/JobContext";
import levelsData from "@/data/wage_data.json";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DotWave } from "@/components/ui/dot-wave";

export default function JobDescriptorPage() {
    const router = useRouter();
    const { jobData } = useJob();
    const { occupation, state, area, jobDescription, jobCode, areaCode } = jobData;
    
    // Redirect if no job data
    useEffect(() => {
        if (!jobCode || !area) {
            console.warn('No job data found, redirecting to /search');
            router.push('/search');
        }
    }, [jobCode, area, router]);

    // Type assertion to match wage_data.json structure
    const jobInfo = (levelsData as Record<string, { title: string; description: string; areas: any[] }>)[jobCode];
    
    // Check if jobInfo exists
    if (!jobInfo) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <p className="text-neutral-400">Job data not found. Redirecting...</p>
            </div>
        );
    }
    
    const areas = jobInfo.areas;
    const areaData = areas?.find(areaObj => areaObj.areaCode === areaCode);
    
    if (!areaData) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <p className="text-neutral-400">Area data not found for {area}. Redirecting...</p>
            </div>
        );
    }

    const wageData = [
        { level: "Level 1 (Entry)", wage: areaData.level1, description: "Entry-level positions" },
        { level: "Level 2 (Intermediate)", wage: areaData.level2, description: "Some experience required" },
        { level: "Level 3 (Median)", wage: areaData.level3, description: "Median wage", highlight: true },
        { level: "Level 4 (Experienced)", wage: areaData.level4, description: "Highly experienced" },
        { level: "Average", wage: areaData.average, description: "Mean wage across all levels", highlight: true },
    ];

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
            className="min-h-screen w-full bg-[#0a0a0a] flex items-center justify-center p-6"
        >
            <div className="w-full max-w-5xl z-10 space-y-6">
                {/* Header Card */}
                <Card className="bg-neutral-900/50 backdrop-blur-xl border-neutral-800 shadow-2xl">
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-400">
                                    {jobInfo.title}
                                </CardTitle>
                                <CardDescription className="text-neutral-400 text-sm">
                                    SOC Code: {jobCode} • Location: {area}, {state}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-neutral-300 leading-relaxed">
                            {jobInfo.description}
                        </p>
                    </CardContent>
                </Card>

                {/* Wage Data Table Card */}
                <Card className="bg-neutral-900/50 backdrop-blur-xl border-neutral-800 shadow-2xl overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-2xl font-semibold text-white">
                            Prevailing Wage Data
                        </CardTitle>
                        <CardDescription className="text-neutral-400">
                            Hourly wage rates for {area}, {state}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-neutral-800 bg-neutral-950/50">
                                        <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-300 uppercase tracking-wider">
                                            Wage Level
                                        </th>
                                        <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-300 uppercase tracking-wider">
                                            Description
                                        </th>
                                        <th className="text-right px-6 py-4 text-sm font-semibold text-neutral-300 uppercase tracking-wider">
                                            Hourly Rate
                                        </th>
                                        <th className="text-right px-6 py-4 text-sm font-semibold text-neutral-300 uppercase tracking-wider">
                                            Annual (est.)
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {wageData.map((item, index) => (
                                        <tr 
                                            key={index}
                                            className={`border-b border-neutral-800/50 transition-colors hover:bg-neutral-800/30 ${
                                                item.highlight ? 'bg-cyan-950/10' : ''
                                            }`}
                                        >
                                            <td className="px-6 py-4">
                                                <span className={`font-medium ${
                                                    item.highlight ? 'text-cyan-400' : 'text-white'
                                                }`}>
                                                    {item.level}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-neutral-400 text-sm">
                                                {item.description}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`text-lg font-semibold ${
                                                    item.highlight ? 'text-cyan-400' : 'text-white'
                                                }`}>
                                                    ${parseFloat(item.wage).toFixed(2)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-neutral-400">
                                                ${(parseFloat(item.wage) * 2080).toLocaleString('en-US', { 
                                                    minimumFractionDigits: 0,
                                                    maximumFractionDigits: 0 
                                                })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Back Button */}
                <div className="flex justify-center pt-4">
                    <button
                        onClick={() => router.push('/results')}
                        className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-neutral-200 font-medium tracking-wide hover:bg-white/10 hover:text-white hover:border-white/20 hover:scale-105 transition-all duration-300 backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] active:scale-95"
                    >
                        ← Back to Results
                    </button>
                </div>
            </div>
        </DotWave>
    );
}