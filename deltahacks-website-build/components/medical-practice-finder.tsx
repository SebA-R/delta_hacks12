"use client"

import { useState, useMemo, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { MapPin, Phone, Search, SlidersHorizontal, X } from "lucide-react"
import Link from "next/link"
import GoogleMapComponent from "@/components/google-map"
import physicianData from "@/data/ham_physicians.json"

interface Physician {
  name: string
  address: string
  phone: string
  lat: number
  lng: number
  place_id: string
  business_status: string
  types: string[]
}

export default function MedicalPracticeFinder() {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [distanceFilter, setDistanceFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<Physician | null>(null)

  const physicians = physicianData.physicians

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        () => {
          setUserLocation({ lat: 43.2557, lng: -79.8711 })
        },
      )
    } else {
      setUserLocation({ lat: 43.2557, lng: -79.8711 })
    }
  }, [])

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371 // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const primaryTypes = useMemo(() => {
    const typeSet = new Set<string>()
    physicians.forEach((physician) => {
      if (physician.types && physician.types.length > 0) {
        typeSet.add(physician.types[0])
      }
    })
    return Array.from(typeSet).sort()
  }, [physicians])

  const filteredPhysicians = useMemo(() => {
    let filtered = [...physicians]

    if (searchQuery) {
      filtered = filtered.filter(
        (physician) =>
          physician.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          physician.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          physician.types.some((type) => type.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((physician) => physician.types.includes(typeFilter))
    }

    if (statusFilter === "operational") {
      filtered = filtered.filter((physician) => physician.business_status === "OPERATIONAL")
    }

    const withDistance = filtered.map((physician) => ({
      ...physician,
      distance: userLocation ? calculateDistance(userLocation.lat, userLocation.lng, physician.lat, physician.lng) : 0,
    }))

    let result = withDistance
    if (distanceFilter !== "all" && userLocation) {
      const maxDistance = Number.parseInt(distanceFilter)
      result = withDistance.filter((physician) => physician.distance <= maxDistance)
    }

    return result.sort((a, b) => a.distance - b.distance)
  }, [searchQuery, typeFilter, distanceFilter, statusFilter, userLocation, physicians])

  const handlePhysicianClick = (physician: Physician) => {
    if (selectedLocation?.place_id === physician.place_id) {
      setSelectedLocation(null)
    } else {
      setSelectedLocation(physician)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-primary shadow-sm relative z-20">
        <div className="px-12 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary-foreground">
              Find M<span className="text-xl text-primary-foreground/60">y</span> D
              <span className="text-xl text-primary-foreground/60">octor</span>
            </h1>
            <Link
              href="/about"
              className="text-lg text-primary-foreground/90 hover:text-primary-foreground transition-colors"
            >
              About
            </Link>
          </div>
        </div>
      </header>

      <div className="relative w-full h-[calc(100vh-80px)]">
        {/* Background Map */}
        <div className="absolute inset-0 w-full h-full">
          <GoogleMapComponent
            locations={filteredPhysicians}
            userLocation={userLocation}
            selectedLocation={selectedLocation}
            onMarkerClick={handlePhysicianClick}
          />
        </div>

        <div className="absolute left-3 top-15 bottom-4 w-[400px] z-10 flex flex-col gap-4">
          {/* Search Bar */}
          <Card className="p-4 bg-white/95 backdrop-blur-sm shadow-lg">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, type, or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white"
                />
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" className="flex-shrink-0 bg-transparent">
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm text-primary">Filters</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-primary/60 mb-1.5 block">Distance</label>
                        <Select value={distanceFilter} onValueChange={setDistanceFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Distance" className="text-primary/60" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Distances</SelectItem>
                            <SelectItem value="5">Within 5 km</SelectItem>
                            <SelectItem value="10">Within 10 km</SelectItem>
                            <SelectItem value="20">Within 20 km</SelectItem>
                            <SelectItem value="30">Within 30 km</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-primary/60 mb-1.5 block">Type</label>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Type" className="text-primary/60" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            {primaryTypes.map((type) =>
                              type === "point_of_interest" ? null : (
                                <SelectItem key={type} value={type}>
                                  {type.replace(/_/g, " ").charAt(0).toUpperCase() + type.replace(/_/g, " ").slice(1)}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-primary/60 mb-1.5 block">Status</label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Status" className="text-primary/60" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="operational">Operational Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex items-center justify-between mt-3">
              <h2 className="text-lg font-semibold text-primary">Medical Practices</h2>
              <Badge variant="secondary">{filteredPhysicians.length} found</Badge>
            </div>
          </Card>

          <Card className="flex-1 overflow-hidden bg-white/95 backdrop-blur-sm shadow-lg">
            <div className="h-full overflow-y-auto p-4 space-y-3">
              <TooltipProvider>
                {filteredPhysicians.map((physician) => (
                  <Card
                    key={physician.place_id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedLocation?.place_id === physician.place_id
                        ? "bg-accent text-white border-accent shadow-lg"
                        : "bg-white hover:border-accent/50"
                    }`}
                    onClick={() => handlePhysicianClick(physician)}
                  >
                    <div className="px-3 py-2">
                      <div className="flex items-center justify-between gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <h3
                              className={`font-semibold truncate flex-1 ${
                                selectedLocation?.place_id === physician.place_id
                                  ? "text-white"
                                  : "text-card-foreground"
                              }`}
                            >
                              {physician.name}
                            </h3>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{physician.name}</p>
                          </TooltipContent>
                        </Tooltip>
                        {userLocation && (
                          <span
                            className={`text-sm whitespace-nowrap ${
                              selectedLocation?.place_id === physician.place_id
                                ? "text-white/80"
                                : "text-muted-foreground"
                            }`}
                          >
                            {physician.distance.toFixed(1)} km
                          </span>
                        )}
                        {physician.business_status === "OPERATIONAL" ? (
                          <Badge
                            variant={selectedLocation?.place_id === physician.place_id ? "secondary" : "default"}
                            className="text-xs flex-shrink-0"
                          >
                            Open
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs flex-shrink-0">
                            Closed
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </TooltipProvider>
            </div>
          </Card>
        </div>

        {selectedLocation && (
          <div className="absolute right-4 top-4 bottom-4 w-[400px] z-10">
            <Card className="h-full bg-white/95 backdrop-blur-sm shadow-lg overflow-hidden flex flex-col">
              <div className="flex items-start justify-between p-4 border-b">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-primary mb-1">{selectedLocation.name}</h2>
                  {userLocation && (
                    <p className="text-sm text-muted-foreground">{selectedLocation.distance.toFixed(1)} km away</p>
                  )}
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedLocation(null)} className="flex-shrink-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div>
                  <h4 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">Status</h4>
                  {selectedLocation.business_status === "OPERATIONAL" ? (
                    <Badge variant="default" className="text-sm">
                      Open
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-sm">
                      Closed
                    </Badge>
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">Type</h4>
                  <p className="text-sm capitalize">{selectedLocation.types[0]?.replace(/_/g, " ")}</p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Address
                  </h4>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedLocation.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-accent text-action-primary hover:text-action-hover hover:underline"
                  >
                    {selectedLocation.address}
                  </a>
                </div>

                <div>
                  <h4 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    Phone
                  </h4>
                  <a
                    href={`tel:${selectedLocation.phone}`}
                    className="text-sm text-action-primary hover:text-action-hover hover:underline"
                  >
                    {selectedLocation.phone}
                  </a>
                </div>

                {selectedLocation.types.length > 1 && (
                  <div>
                    <h4 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
                      Additional Categories
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedLocation.types.slice(1).map((type, index) =>
                        type === "point_of_interest" ? null : (
                          <Badge key={index} variant="outline" className="capitalize text-xs">
                            {type.replace(/_/g, " ")}
                          </Badge>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
