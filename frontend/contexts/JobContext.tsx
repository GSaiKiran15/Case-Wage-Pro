'use client';
import { createContext, useContext, useState, ReactNode } from "react";

type JobData = {
    occupation: string;
    state: string;
    area: string;
    jobDescription: string;
    jobCode: string
    areaCode: string
}

type JobContextType = {
    jobData: JobData
    setJobData: (data: JobData) => void;
}

const JobContext = createContext<JobContextType | undefined>(undefined)

export function JobProvider({children}:{children: ReactNode}) {
    const [jobData, setJobData] = useState<JobData>({
        occupation: '',
        state: '',
        area: '',
        jobDescription: '',
        jobCode: '',
        areaCode: ''
    })

    return(
        <JobContext.Provider value={{jobData, setJobData}}>
            {children}
        </JobContext.Provider>
    )

}

export function useJob() {
    const context = useContext(JobContext);
    if (!context){
        throw new Error('useJob must be used within JobProvider')
    }
    return context
}