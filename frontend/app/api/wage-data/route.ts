import { NextRequest, NextResponse } from "next/server";
import WageData from '@/data/wage_data.json'
import GeoInfo from '@/data/county_to_area_code.json'

export async function GET(request: NextRequest) {
    
    const jobCode = request.nextUrl.searchParams.get('jobCode')
    const countyName = request.nextUrl.searchParams.get('countyValue')
    const stateName = request.nextUrl.searchParams.get('stateValue')

    if (!jobCode || !countyName || !stateName) {
        return NextResponse.json({
            success: false,
            error: 'Missing required parameters: jobCode, countyValue, and stateValue'
        }, { status: 400 })
    }

    const areaCode = (GeoInfo as Record<string, any>)[`${countyName}, ${stateName}`].areaCode;
    const jobs = (WageData as Record<string, any>)[jobCode].areas
    const jobInfo = jobs.find((job:any) => job.areaCode === areaCode)
    return NextResponse.json({
        success: true,
        areaCode: areaCode,
        jobInfo: jobInfo
    })
}