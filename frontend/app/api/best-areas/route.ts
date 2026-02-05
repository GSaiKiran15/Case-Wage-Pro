import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// Cache for loaded data to avoid re-reading files on every request
let wageDataCache: Record<string, any> | null = null;
let geoInfoCache: Record<string, any> | null = null;

async function loadWageData(): Promise<Record<string, any>> {
    if (wageDataCache) return wageDataCache;
    const filePath = path.join(process.cwd(), 'data', 'wage_data.json');
    const data = await fs.readFile(filePath, 'utf-8');
    wageDataCache = JSON.parse(data);
    return wageDataCache!;
}

async function loadGeoInfo(): Promise<Record<string, any>> {
    if (geoInfoCache) return geoInfoCache;
    const filePath = path.join(process.cwd(), 'data', 'county_to_area_code.json');
    const data = await fs.readFile(filePath, 'utf-8');
    geoInfoCache = JSON.parse(data);
    return geoInfoCache!;
}

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

    try {
        const [WageData, GeoInfo] = await Promise.all([
            loadWageData(),
            loadGeoInfo()
        ]);

        const comparisonState = request.nextUrl.searchParams.get('comparisonState')

        const geoEntry = GeoInfo[`${countyName}, ${stateName}`];
        if (!geoEntry) {
            return NextResponse.json({
                success: false,
                error: `Location not found: ${countyName}, ${stateName}`
            }, { status: 404 })
        }
        const areaCode = geoEntry.areaCode;

        const jobData = WageData[jobCode];
        if (!jobData) {
            return NextResponse.json({
                success: false,
                error: `Job code not found: ${jobCode}`
            }, { status: 404 })
        }

        const jobs = jobData.areas;
        const jobInfo = jobs.find((job: any) => job.areaCode === areaCode)
        const allAreas = jobData.areas;
        
        // Use comparisonState if provided, otherwise default to stateName
        const filterState = comparisonState || stateName;

        const stateAreas = allAreas
            .filter((a: any) => a.state === filterState)
            .sort((a: any, b: any) => parseFloat(a.level3) - parseFloat(b.level3))
            .slice(0, 5);
      
        const usaAreas = [...allAreas]
            .sort((a: any, b: any) => parseFloat(a.level3) - parseFloat(b.level3))
            .slice(0, 10);
        
        return NextResponse.json({
            success: true,
            areaCode: areaCode,
            jobInfo: jobInfo,
            stateAreas: stateAreas,
            usaAreas: usaAreas
        })
    } catch (error) {
        console.error('Error loading data:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to load wage data'
        }, { status: 500 })
    }
}
