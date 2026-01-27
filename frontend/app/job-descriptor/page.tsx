'use client'

import { useState, useEffect, useContext } from "react";
import { useJob } from "@/contexts/JobContext";
import levelsData from "@/data/levels.json";

export default function jobFinder(){
    const {jobData, setJobData} = useJob()
    const {occupation, state, area, jobDescription} = jobData
    
    // Type assertion to allow string indexing
    const jobInfo = (levelsData as Record<string, any[]>)[occupation]
    
    // Use .find() instead of .map() to get the specific area
    const areaData = jobInfo?.find(job => job.area === area)
    
    if (areaData) {
        console.log("Found data:", areaData)
        console.log("Median wage:", areaData.pay[2])
        return areaData
    } else {
        console.log("Area not found")
        return null
    }
}