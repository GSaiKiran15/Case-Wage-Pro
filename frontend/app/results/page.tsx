'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DotWave } from "@/components/ui/dot-wave";
import { Card } from "@/components/ui/card";
import TextGradient from "@/components/text-gradient";
import { Meteors } from "@/components/ui/meteors";
import { useJob } from "@/contexts/JobContext";
import levelsData from "@/data/levels.json";

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
    const router = useRouter();
    const {jobData, setJobData} = useJob()
    const [results, setResults] = useState<AnalysisResult | null>(null);
    const [jobs, setJobs] = useState<JobResult[]>([]);
    const [popUp, setPopUp] = useState(false);
    const [selectedJob, setSelectedJob] = useState<JobResult | null>(null);

    const handleJobClick = (job: JobResult) => {
        setSelectedJob(job);
        setPopUp(true);
    };

    const handleClosePopup = () => {
        setPopUp(false);
        setSelectedJob(null);
    };

    // Redirect to /search if no jobData
    useEffect(() => {
        if (!jobData.occupation || !jobData.area) {
            console.warn('No jobData found, redirecting to /search');
            router.push('/search');
        }
    }, [jobData, router]);

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
                        <JobCard 
                            key={job._id} 
                            job={job} 
                            index={index} 
                            onClick={() => handleJobClick(job)}
                        />
                    ))}
                </div>

                {jobs.length === 0 && (
                    <div className="text-center text-neutral-400 mt-12">
                        <p className="text-xl">No matching occupations found</p>
                        <p className="mt-2">Try adjusting your job description</p>
                    </div>
                )}
            </div>

            {/* Popup Modal */}
            {popUp && selectedJob && (
                <PopUpCard 
                    job={selectedJob} 
                    onClose={handleClosePopup}
                />
            )}
        </DotWave>
    );
}

function JobCard({ job, index, onClick }: { job: JobResult; index: number; onClick: () => void }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Card 
            className="relative bg-neutral-900/50 backdrop-blur-xl border-neutral-800 shadow-2xl p-6 hover:border-neutral-700 transition-all duration-300 overflow-hidden group cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
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

            {/* Animated meteors */}
            <Meteors number={5} />

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

function PopUpCard({ job, onClose }: { job: JobResult; onClose: () => void }) {
    const router = useRouter();
    const [isRemote, setIsRemote] = useState<boolean>(false);
    const [salary, setSalary] = useState<number>(0);
    const { jobData, setJobData } = useJob();  // Get data and setter from context

    const handleSubmit = () => {
        console.log('🚀 handleSubmit called!');
        console.log('jobData:', jobData);
        console.log('Selected job:', job.fields);
        console.log('📤 Submission data:', { 
            job: job.fields.title, 
            socCode: job.fields.value,
            isRemote, 
            salary,
        });
        
        // Update jobData with the selected job's SOC code
        setJobData({
            ...jobData,
            jobCode: job.fields.value,  // Store SOC code for job-descriptor page
            occupation: job.fields.title
        });
        
        // Close modal first
        onClose();
        
        // Navigate to job descriptor page
        router.push('/job-descriptor');
    };

    return (
        <>
            {/* Dark overlay */}
            <div 
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
                onClick={onClose}
            />
            
            {/* Modal Card */}
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <Card 
                    className="relative bg-neutral-900/90 backdrop-blur-xl border-neutral-700 shadow-2xl p-8 max-w-md w-full overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Gradient accent line */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500" />
                    
                    {/* Close button */}
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors text-2xl"
                    >
                        ×
                    </button>

                    {/* Job Title */}
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-white mb-1">
                            {job.fields.title}
                        </h2>
                        <p className="text-sm text-neutral-500 font-mono">
                            Code: {job.fields.value}
                        </p>
                    </div>

                    {/* Remote Question */}
                    <div className="mb-6">
                        <label className="block text-neutral-300 font-medium mb-3">
                            Is this position remote?
                        </label>
                        <div className="flex gap-6">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input 
                                    type="radio" 
                                    name="remote"
                                    checked={isRemote === true}
                                    onChange={() => setIsRemote(true)}
                                    className="w-4 h-4 accent-cyan-400"
                                />
                                <span className="text-neutral-400 group-hover:text-white transition-colors">Yes</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input 
                                    type="radio" 
                                    name="remote"
                                    checked={isRemote === false}
                                    onChange={() => setIsRemote(false)}
                                    className="w-4 h-4 accent-cyan-400"
                                />
                                <span className="text-neutral-400 group-hover:text-white transition-colors">No</span>
                            </label>
                        </div>
                    </div>

                    {/* Salary Input */}
                    <div className="mb-8">
                        <label className="block text-neutral-300 font-medium mb-3">
                            Annual Salary ($)
                        </label>
                        <input 
                            type="number"
                            value={salary || ''}
                            onChange={(e) => setSalary(Number(e.target.value))}
                            placeholder="Enter your salary"
                            className="w-full bg-neutral-800/50 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-lg border border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:from-cyan-400 hover:to-blue-400 transition-all"
                        >
                            Continue
                        </button>
                    </div>
                </Card>
            </div>
        </>
    );
}