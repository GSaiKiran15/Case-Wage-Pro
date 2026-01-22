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

const occupations = occupationsData as { value: string; label: string; title: string; description: string }[]
const geography = geographyData as Record<string, string[]>

const states = Object.keys(geography).map(state => ({
  value: state,
  label: state
})).sort((a,b) => a.label.localeCompare(b.label))

const areas = [
  { value: "sf-bay", label: "San Francisco Bay Area" },
  { value: "nyc-metro", label: "New York City Metro" },
  { value: "austin", label: "Austin-Round Rock" },
  { value: "seattle", label: "Seattle-Tacoma-Bellevue" },
]

export function SearchForm({ className }: { className?: string }) {
  const [isHovered, setIsHovered] = useState(false);
  const [occupationOpen, setOccupationOpen] = useState(false)
  const [occupationValue, setOccupationValue] = useState("")
  const [stateOpen, setStateOpen] = useState(false)
  const [stateValue, setStateValue] = useState("")
  const [areaOpen, setAreaOpen] = useState(false)
  const [areaValue, setAreaValue] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredOccupations = occupations
    .filter((occupation) =>
      occupation.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      occupation.value.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, 50)

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
                      <Command className="bg-neutral-900 text-white">
                        <CommandInput placeholder="Search state..." className="text-white" />
                        <CommandList>
                          <CommandEmpty>No state found.</CommandEmpty>
                          <CommandGroup>
                            {states.map((state) => (
                              <CommandItem
                                key={state.value}
                                value={state.value}
                                onSelect={(currentValue) => {
                                  // cmdk lowercases values, so we find the original from our list
                                  const originalState = states.find(s => s.value.toLowerCase() === currentValue.toLowerCase())
                                  setStateValue(originalState?.value === stateValue ? "" : originalState?.value || "")
                                  setStateOpen(false)
                                }}
                                 className="text-neutral-200 aria-selected:bg-neutral-800 aria-selected:text-white"
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
                        className="w-full justify-between h-11 text-sm bg-neutral-950/50 border-neutral-800 text-white hover:bg-neutral-900 hover:text-white"
                      >
                        {areaValue
                          ? areas.find((framework) => framework.value === areaValue)?.label
                          : "Select area..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0 bg-neutral-900 border-neutral-800 text-white">
                      <Command className="bg-neutral-900 text-white">
                        <CommandInput placeholder="Search area..." className="text-white" />
                        <CommandList>
                          <CommandEmpty>No area found.</CommandEmpty>
                          <CommandGroup>
                            {areas.map((area) => (
                              <CommandItem
                                key={area.value}
                                value={area.value}
                                onSelect={(currentValue) => {
                                  setAreaValue(currentValue === areaValue ? "" : currentValue)
                                  setAreaOpen(false)
                                }}
                                 className="text-neutral-200 aria-selected:bg-neutral-800 aria-selected:text-white"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    areaValue === area.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {area.label}
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
               />
            </div>

          </div>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-4 pt-6">
        <Button 
          className="w-full bg-transparent border border-neutral-800 text-neutral-400 hover:text-white hover:bg-white/5 hover:border-neutral-700 text-base font-medium py-6 rounded-xl transition-all h-auto gap-2"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          Analyze Eligibility <SparkleIcon size={18} isHovered forceHover={isHovered} className={`text-current transition-transform duration-300 ${isHovered ? "scale-125 text-yellow-400" : ""}`} />
        </Button>
        <Button variant="ghost" className="text-neutral-500 hover:text-neutral-300 hover:bg-transparent text-sm">
          Clear form
        </Button>
      </CardFooter>
    </Card>
  )
}
