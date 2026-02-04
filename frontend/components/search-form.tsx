"use client";

import { useState } from "react"
import { Check, ChevronsUpDown, Sparkles } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import SparkleIcon from "@/components/sparkle-icon"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import occupationsData from "@/data/occupations.json"
import geographyData from "@/data/geography.json";
import { getRecommendation } from "../app/actions";
import TextGradient from "@/components/text-gradient";
import { useRouter } from "next/navigation";
import {useJob} from "@/contexts/JobContext"
import wageData from "@/data/county_to_area_code.json"

const occupations = occupationsData as { value: string; label: string; title: string; description: string }[]
const geography = geographyData as Record<string, string[]>

const states = Object.keys(geography).map(state => ({
  value: state,
  label: state
})).sort((a,b) => a.label.localeCompare(b.label))


export function SearchForm({ className }: { className?: string }) {
  const [isHovered, setIsHovered] = useState(false);
  const [occupationOpen, setOccupationOpen] = useState(false)
  const [occupationValue, setOccupationValue] = useState("")
  const [occupationCode, setOccupationCode] = useState("")
  const [stateOpen, setStateOpen] = useState(false)
  const [stateValue, setStateValue] = useState("")
  const [areaOpen, setAreaOpen] = useState(false)
  const [areaValue, setAreaValue] = useState("")
  const [areaCode, setAreaCode] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [stateSearchQuery, setStateSearchQuery] = useState("")
  const [areaSearchQuery, setAreaSearchQuery] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [pay, setPay] = useState<number>(0)
  const [isRemote, setIsRemote] = useState<boolean>(false)
  const [level, setLevel] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const router = useRouter() 
  const { jobData, setJobData } = useJob()

  const filteredOccupations = occupations
    .filter((occupation) =>
      occupation.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      occupation.value.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, 50)

  const filteredStates = states.filter((state) => 
    state.label.toLowerCase().includes(stateSearchQuery.toLowerCase())
  )

  const filteredAreas = (stateValue && geography[stateValue] ? geography[stateValue] : [])
    .filter((area) => 
      area.toLowerCase().includes(areaSearchQuery.toLowerCase())
    )

  const handleClear = () => {
    setOccupationValue("")
    setStateValue("")
    setAreaValue("")
    setSearchQuery("")
    setStateSearchQuery("")
    setAreaSearchQuery("")
    setAreaSearchQuery("")
    setOccupationCode("")
    setPay(0)
    setIsRemote(false)
    setLevel(0)
  }

  const handleAnalyze = async () => {
    // Validate required fields
    if (!occupationValue) {
      alert('Please select an occupation');
      return;
    }
    if (!stateValue) {
      alert('Please select a state');
      return;
    }
    if (!areaValue) {
      alert('Please select an area');
      return;
    }
    if (!jobDescription.trim()) {
      alert('Please enter a job description');
      return;
    }

    setLoading(true);
     const mappingKey = `${areaValue}, ${stateValue}`;
  const foundMapping = (wageData as Record<string, any>)[mappingKey];
  
  if (foundMapping && foundMapping.areaCode) {
    setAreaCode(foundMapping.areaCode);
    console.log(foundMapping.areaCode)
  } else {
    console.warn(`No area code found for: ${mappingKey}`);
    setAreaCode("");
  }
    try {
      const result = await getRecommendation({
        jobDescription: jobDescription,
        occupation: occupationValue,
        state: stateValue,
        area: areaValue,
        pay: pay
      });

      // Parse the Gemini response to extract defensible_wage_level
      let extractedLevel = 1; // Default to level 1
      try {
        if (result.filteredResults) {
          const geminiResponse = JSON.parse(result.filteredResults);
          extractedLevel = parseInt(geminiResponse.defensible_wage_level) || 1;
        }
      } catch (parseError) {
        console.warn("Could not parse wage level from Gemini response, using default level 1");
      }

      setLevel(extractedLevel); // Update state

      setJobData({
        occupation: occupationValue,
        state: stateValue,
        area: areaValue,
        jobDescription: jobDescription,
        jobCode: occupationCode,
        areaCode: areaCode,
        pay: pay,
        isRemote: isRemote,
        level: extractedLevel // Use the extracted level
      })
      localStorage.setItem('analysisResults', JSON.stringify(result))
      console.log(jobData)
      router.push('/results')
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Card className={cn("bg-neutral-900/50 backdrop-blur-xl border-neutral-800 shadow-2xl h-[500px] w-full flex items-center justify-center", className)}>
        <div className="flex flex-col items-center gap-6">
          <TextGradient 
            className="text-6xl font-black px-80 py-10" 
            highlightColor="#ffffff"
            baseColor="#63eaf1ff"
            duration={3.0}
            spread={75}
          >
            Thinking...
          </TextGradient>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-neutral-900/50 backdrop-blur-xl border-neutral-800 shadow-2xl", className)}>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold tracking-tight text-white text-center">Lets Maximize your chances</CardTitle>
        <CardDescription className="text-center text-neutral-400">
          Find the best JD to maximize your chances.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="flex flex-col gap-6">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Occupation Combobox */}
              <div className="flex flex-col gap-2 h-full">
                <Label className="text-sm font-medium text-neutral-200">
                  Enter in an Occupation (O*NET) Code and Title:
                </Label>
                <div className="mt-auto w-full">
                  <Popover open={occupationOpen} onOpenChange={setOccupationOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={occupationOpen}
                        className="w-full justify-between h-11 text-sm bg-neutral-950/50 border-neutral-800 text-white hover:bg-neutral-900 hover:text-white truncate"
                      >
                        {occupationValue
                          ? occupations.find((framework) => framework.label === occupationValue)?.label
                          : "Type search term here..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0 bg-neutral-900 border-neutral-800 text-white">
                      <Command shouldFilter={false} className="bg-neutral-900 text-white">
                        <CommandInput 
                          placeholder="Search occupation..." 
                          className="text-white" 
                          onValueChange={setSearchQuery}
                        />
                        <CommandList>
                          <CommandEmpty>No occupation found.</CommandEmpty>
                          <CommandGroup>
                            {filteredOccupations.map((occupation) => (
                              <CommandItem
                                key={occupation.value}
                                value={occupation.label}
                                onSelect={(currentValue) => {
                                  setOccupationValue(currentValue === occupationValue ? "" : currentValue)
                                  const selectedOcc = occupations.find(occ => occ.label === currentValue)
                                  setOccupationCode(selectedOcc ? selectedOcc.value : "")
                                  setOccupationOpen(false)
                                }}
                                className="text-neutral-200 aria-selected:bg-neutral-800 aria-selected:text-white"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    occupationValue === occupation.label ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {occupation.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* State Combobox */}
              <div className="flex flex-col gap-2 h-full">
                <Label className="text-sm font-medium text-neutral-200">Select a State/Territory</Label>
                <div className="mt-auto w-full">
                  <Popover open={stateOpen} onOpenChange={setStateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={stateOpen}
                        className="w-full justify-between h-11 text-sm bg-neutral-950/50 border-neutral-800 text-white hover:bg-neutral-900 hover:text-white"
                      >
                        {stateValue
                          ? states.find((framework) => framework.value === stateValue)?.label
                          : "Select state..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0 bg-neutral-900 border-neutral-800 text-white">
                      <Command shouldFilter={false} className="bg-neutral-900 text-white">
                        <CommandInput 
                          placeholder="Search state..." 
                          className="text-white" 
                          onValueChange={setStateSearchQuery}
                        />
                        <CommandList>
                          <CommandEmpty>No state found.</CommandEmpty>
                          <CommandGroup>
                            {filteredStates.map((state) => (
                              <CommandItem
                                key={state.value}
                                value={state.value}
                                onSelect={(currentValue) => {
                                  // Manual filtering means 'value' stays as original casing, no need to lowercase finding
                                  setStateValue(currentValue === stateValue ? "" : currentValue)
                                  setStateOpen(false)
                                }}
                                 className="text-neutral-200 aria-selected:bg-neutral-800 aria-selected:text-white cursor-pointer"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    stateValue === state.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {state.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Area Combobox */}
              <div className="flex flex-col gap-2 h-full">
                 <div className="flex flex-col gap-1">
                  <Label className="text-sm font-medium text-neutral-200">Select an area</Label>
                  <span className="text-[0.8rem] text-muted-foreground text-neutral-400">Use the USPS Zip Code Lookup to identify which County/Township</span>
                </div>
                <div className="mt-auto w-full">
                  <Popover open={areaOpen} onOpenChange={setAreaOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={areaOpen}
                        disabled={!stateValue}
                        className="w-full justify-between h-11 text-sm bg-neutral-950/50 border-neutral-800 text-white hover:bg-neutral-900 hover:text-white disabled:opacity-50"
                      >
                        {areaValue
                          ? areaValue
                          : stateValue ? "Select area..." : "Select state first"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0 bg-neutral-900 border-neutral-800 text-white">
                      <Command shouldFilter={false} className="bg-neutral-900 text-white">
                        <CommandInput 
                          placeholder="Search area..." 
                          className="text-white" 
                          onValueChange={setAreaSearchQuery}
                        />
                        <CommandList>
                          <CommandEmpty>No area found.</CommandEmpty>
                          <CommandGroup>
                            {filteredAreas.map((area, index) => (
                              <CommandItem
                                key={index}
                                value={area} // area is just a string "Sussex County", case logic handled by manual filter
                                onSelect={(currentValue) => {
                                  setAreaValue(currentValue === areaValue ? "" : currentValue)
                                  setAreaOpen(false)
                                }}
                                className="text-neutral-200 aria-selected:bg-neutral-800 aria-selected:text-white cursor-pointer"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    areaValue === area ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {area}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                </div>
              </div>
            </div>

            {/* Job Description Textarea */}
            <div className="space-y-2">
               <Label htmlFor="jd" className="text-sm font-medium text-neutral-200">Job Description</Label>
               <Textarea 
                 id="jd" 
                 placeholder="Paste the full job description here..." 
                 className="min-h-[200px] text-base bg-neutral-950/50 border-neutral-800 text-white placeholder:text-neutral-500 resize-none focus-visible:ring-offset-0" 
                 value={jobDescription}
                 onChange={(e) => setJobDescription(e.target.value)}
                 required
               />
            </div>

            {/* Pay and Remote Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Annual Salary */}
              <div className="space-y-2">
                <Label htmlFor="salary" className="text-sm font-medium text-neutral-200">Annual Salary ($) (optional)</Label>
                <input
                  id="salary"
                  type="number"
                  value={pay || ''}
                  onChange={(e) => setPay(Number(e.target.value))}
                  placeholder="Enter annual salary"
                  className="w-full h-11 px-4 text-base bg-neutral-950/50 border border-neutral-800 rounded-md text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-700 focus:border-transparent"
                />
              </div>

              {/* Remote Position */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-neutral-200">Remote Position?</Label>
                <div className="flex gap-6 h-11 items-center">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="remote"
                      checked={isRemote === true}
                      onChange={() => setIsRemote(true)}
                      className="w-4 h-4 accent-cyan-400"
                      required
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
            </div>

          </div>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-4 pt-6">
        <Button 
          className="w-full bg-transparent border border-neutral-800 text-neutral-400 hover:text-white hover:bg-white/5 hover:border-neutral-700 text-base font-medium py-6 rounded-xl transition-all h-auto gap-2"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={(e) => {
            e.preventDefault(); // prevent form submission refresh
            handleAnalyze();
          }}
        >
          Analyze Salary Requirements <SparkleIcon size={18} isHovered forceHover={isHovered} className={`text-current transition-transform duration-300 ${isHovered ? "scale-125 text-yellow-400" : ""}`} />
        </Button>
        <Button variant="ghost" onClick={handleClear} className="text-neutral-500 hover:text-neutral-300 hover:bg-transparent text-sm">
          Clear form
        </Button>
      </CardFooter>
    </Card>
  )
}