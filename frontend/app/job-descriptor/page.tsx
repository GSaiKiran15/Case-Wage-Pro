'use client'

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useJob } from "@/contexts/JobContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import FocusButton  from "@/components/focus-button";
import { DotWave } from "@/components/ui/dot-wave";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin } from "lucide-react";
import { optimizeJobDescription } from "./action";
import Geography from '@/data/geography.json';

const US_STATES = Object.keys(Geography).sort();

export default function JobDescriptorPage() {
    const [wageInfo, setWageInfo] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter();
    const { jobData } = useJob();
    const {jobCode, area, state, occupation, jobDescription, isRemote, pay} = jobData    
    const [selectedState, setSelectedState] = useState<string>('');
    const [isOptimizing, setIsOptimizing] = useState(false);

    // Initialize selectedState when jobData.state is available
    useEffect(() => {
        if (state) {
            setSelectedState(state);
        }
    }, [state]);
    useEffect(() => {
        async function fetchWageData() {
            setLoading(true)

            try{
                const response = await fetch(
                      `/api/best-areas?jobCode=${jobCode}&countyValue=${area}&stateValue=${state}&comparisonState=${selectedState}`
                )
                const data = await response.json()
                if (data.success) {
                    setWageInfo(data)
                    setLoading(false)
                    console.log(data.stateAreas, data.usaAreas);
                }
                else{
                    setError(data.error)
                }
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred')
            } finally{
                setLoading(false)}
        }

        if (jobCode && area && state) {
            fetchWageData()
        }
    }, [jobCode, area, state, selectedState])
    
    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <p className="text-neutral-400">Loading wage data...</p>
            </div>
        )
    }

    // Show error state
    if (error) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <p className="text-red-400">Error: {error}</p>
            </div>
        )
    }

    // Check if data exists
    if (!wageInfo) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <p className="text-neutral-400">No wage data found</p>
            </div>
        )
    }

    // Now it's safe to access the data
    const jobInfo = wageInfo.jobInfo;
    const wageData = [
        { level: "Level 1", wage: jobInfo.level1, description: "Entry-level positions" },
        { level: "Level 2", wage: jobInfo.level2, description: "Some experience required" },
        { level: "Level 3", wage: jobInfo.level3, description: "Median wage" },
        { level: "Level 4", wage: jobInfo.level4, description: "Highly experienced" },
        { level: "Average", wage: jobInfo.average, description: "Mean wage across all levels" },
    ];

    const handleOptimizeJD = async () => {
        setIsOptimizing(true);
        try {
            const result = await optimizeJobDescription(
                jobDescription || "No job description provided",
                occupation,
                {
                    location: `${area}, ${state}`,
                    isRemote: isRemote,
                    pay: pay,
                    state: state,
                    area: area,
                }
            );

            if (result.success) {
                // Store optimized JD in localStorage
                localStorage.setItem('optimizedJD', result.optimizedJD);
                localStorage.setItem('targetRole', result.targetRole);
                
                // Navigate to viewer page
                router.push('/updated-jd-viewer');
            }
        } catch (error) {
            console.error("Optimization failed:", error);
            alert("Failed to optimize job description. Please try again.");
        } finally {
            setIsOptimizing(false);
        }
    };

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
            className="min-h-screen w-full bg-[#0a0a0a] flex items-center justify-center p-4 md:p-6"
        >
            <div className="w-full max-w-5xl z-10 space-y-4 md:space-y-6">
                {/* Header Card */}
                <Card className="bg-neutral-900/50 backdrop-blur-xl border-neutral-800 shadow-2xl">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <CardTitle className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-400">
                                    {jobInfo.title}
                                </CardTitle>
                                <div className="space-y-2">
                                    <div className="text-base font-bold text-white">
                                        {occupation}
                                    </div>
                                    <div className="text-xs text-neutral-500 font-mono">
                                        {jobCode}
                                    </div>
                                    <div className="text-sm font-semibold text-neutral-300 flex items-center gap-1">
                                        <MapPin className="h-3.5 w-3.5 animate-bounce" />
                                        {area}, {state}
                                    </div>
                                </div>
                            </div>
                            <FocusButton
                                onClick={handleOptimizeJD}
                                disabled={isOptimizing}
                                className="self-center bg-transparent text-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                dashColor="#06b6d4"
                            >
                                {isOptimizing ? "Optimizing..." : "Optimize JD for this role"}
                            </FocusButton>
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
                        <CardTitle className="text-xl md:text-2xl font-semibold text-white">
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
                                        <th className="text-left px-3 py-2 md:px-6 md:py-4 text-xs md:text-sm font-semibold text-neutral-300 uppercase tracking-wider">
                                            Level
                                        </th>
                                        <th className="text-left px-3 py-2 md:px-6 md:py-4 text-xs md:text-sm font-semibold text-neutral-300 uppercase tracking-wider hidden md:table-cell">
                                            Description
                                        </th>
                                        <th className="text-right px-3 py-2 md:px-6 md:py-4 text-xs md:text-sm font-semibold text-neutral-300 uppercase tracking-wider">
                                            Hourly
                                        </th>
                                        <th className="text-right px-3 py-2 md:px-6 md:py-4 text-xs md:text-sm font-semibold text-neutral-300 uppercase tracking-wider">
                                            Annual
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {wageData.map((item, index) => (
                                        <tr 
                                            key={index}
                                            className="border-b border-neutral-800/50 transition-colors hover:bg-neutral-800/30"
                                        >
                                            <td className="px-3 py-2 md:px-6 md:py-4">
                                                <span className="font-medium text-white text-sm md:text-base">
                                                    {item.level}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 md:px-6 md:py-4 text-neutral-400 text-xs md:text-sm hidden md:table-cell">
                                                {item.description}
                                            </td>
                                            <td className="px-3 py-2 md:px-6 md:py-4 text-right">
                                                <span className="text-base md:text-lg font-semibold text-white">
                                                    ${parseFloat(item.wage).toFixed(2)}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 md:px-6 md:py-4 text-right text-neutral-400 text-xs md:text-sm">
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

                {/* State Areas Comparison */}
                {wageInfo.stateAreas && wageInfo.stateAreas.length > 0 && (
                    <Card className="bg-neutral-900/50 backdrop-blur-xl border-neutral-800 shadow-2xl overflow-hidden">
                        <CardHeader>
                            <CardTitle className="text-xl md:text-2xl font-semibold text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-4">
                                <span>Top Areas in {selectedState || state}</span>
                                <div className="z-50 w-full md:w-[200px]">
                                    <Select 
                                        value={selectedState} 
                                        onValueChange={(value) => setSelectedState(value)}
                                    >
                                        <SelectTrigger className="bg-neutral-800/50 border-neutral-700 text-neutral-200">
                                            <SelectValue placeholder="Select state" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-neutral-900 border-neutral-800 text-neutral-200 h-[300px]">
                                            {US_STATES.map((s) => (
                                                <SelectItem key={s} value={s} className="hover:bg-neutral-800 focus:bg-neutral-800 cursor-pointer">
                                                    {s}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardTitle>
                            <CardDescription className="text-neutral-400">
                                Areas with lowest prevailing wages in {selectedState || state} (Cost Saving)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-neutral-800 bg-neutral-950/50">
                                            <th className="text-left px-3 py-2 md:px-6 md:py-4 text-xs md:text-sm font-semibold text-neutral-300 uppercase tracking-wider">Area</th>
                                            <th className="text-right px-3 py-2 md:px-6 md:py-4 text-xs md:text-sm font-semibold text-neutral-300 uppercase tracking-wider">L1</th>
                                            <th className="text-right px-3 py-2 md:px-6 md:py-4 text-xs md:text-sm font-semibold text-neutral-300 uppercase tracking-wider">L2</th>
                                            <th className="text-right px-3 py-2 md:px-6 md:py-4 text-xs md:text-sm font-semibold text-neutral-300 uppercase tracking-wider">L3</th>
                                            <th className="text-right px-3 py-2 md:px-6 md:py-4 text-xs md:text-sm font-semibold text-neutral-300 uppercase tracking-wider">L4</th>
                                            <th className="text-right px-3 py-2 md:px-6 md:py-4 text-xs md:text-sm font-semibold text-neutral-300 uppercase tracking-wider">Mean</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {wageInfo.stateAreas.map((area: any, index: number) => (
                                            <tr key={index} className="border-b border-neutral-800/50 hover:bg-neutral-800/30 transition-colors">
                                                <td className="px-3 py-2 md:px-6 md:py-4 text-white font-medium text-xs md:text-sm">{area.areaName}</td>
                                                <td className="px-3 py-2 md:px-6 md:py-4 text-right text-neutral-300 text-xs md:text-sm">${parseFloat(area.level1).toFixed(2)}</td>
                                                <td className="px-3 py-2 md:px-6 md:py-4 text-right text-neutral-300 text-xs md:text-sm">${parseFloat(area.level2).toFixed(2)}</td>
                                                <td className="px-3 py-2 md:px-6 md:py-4 text-right text-neutral-300 text-xs md:text-sm">${parseFloat(area.level3).toFixed(2)}</td>
                                                <td className="px-3 py-2 md:px-6 md:py-4 text-right text-neutral-300 text-xs md:text-sm">${parseFloat(area.level4).toFixed(2)}</td>
                                                <td className="px-3 py-2 md:px-6 md:py-4 text-right text-neutral-400 text-xs md:text-sm">${parseFloat(area.average).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* USA Areas Comparison */}
                {wageInfo.usaAreas && wageInfo.usaAreas.length > 0 && (
                    <Card className="bg-neutral-900/50 backdrop-blur-xl border-neutral-800 shadow-2xl overflow-hidden">
                        <CardHeader>
                            <CardTitle className="text-xl md:text-2xl font-semibold text-white">
                                Top Areas in USA
                            </CardTitle>
                            <CardDescription className="text-neutral-400">
                                Nationwide areas with lowest prevailing wages (Cost Saving)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-neutral-800 bg-neutral-950/50">
                                            <th className="text-left px-3 py-2 md:px-6 md:py-4 text-xs md:text-sm font-semibold text-neutral-300 uppercase tracking-wider">Area</th>
                                            <th className="text-right px-3 py-2 md:px-6 md:py-4 text-xs md:text-sm font-semibold text-neutral-300 uppercase tracking-wider">L1</th>
                                            <th className="text-right px-3 py-2 md:px-6 md:py-4 text-xs md:text-sm font-semibold text-neutral-300 uppercase tracking-wider">L2</th>
                                            <th className="text-right px-3 py-2 md:px-6 md:py-4 text-xs md:text-sm font-semibold text-neutral-300 uppercase tracking-wider">L3</th>
                                            <th className="text-right px-3 py-2 md:px-6 md:py-4 text-xs md:text-sm font-semibold text-neutral-300 uppercase tracking-wider">L4</th>
                                            <th className="text-right px-3 py-2 md:px-6 md:py-4 text-xs md:text-sm font-semibold text-neutral-300 uppercase tracking-wider">Mean</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {wageInfo.usaAreas.map((area: any, index: number) => (
                                            <tr key={index} className="border-b border-neutral-800/50 hover:bg-neutral-800/30 transition-colors">
                                                <td className="px-3 py-2 md:px-6 md:py-4 text-white font-medium text-xs md:text-sm">{area.areaName}</td>
                                                <td className="px-3 py-2 md:px-6 md:py-4 text-right text-neutral-300 text-xs md:text-sm">${parseFloat(area.level1).toFixed(2)}</td>
                                                <td className="px-3 py-2 md:px-6 md:py-4 text-right text-neutral-300 text-xs md:text-sm">${parseFloat(area.level2).toFixed(2)}</td>
                                                <td className="px-3 py-2 md:px-6 md:py-4 text-right text-neutral-300 text-xs md:text-sm">${parseFloat(area.level3).toFixed(2)}</td>
                                                <td className="px-3 py-2 md:px-6 md:py-4 text-right text-neutral-300 text-xs md:text-sm">${parseFloat(area.level4).toFixed(2)}</td>
                                                <td className="px-3 py-2 md:px-6 md:py-4 text-right text-neutral-400 text-xs md:text-sm">${parseFloat(area.average).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}

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