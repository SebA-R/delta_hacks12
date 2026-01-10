"use client"

import { useState, useMemo, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { MapPin, Phone, Search, ChevronDown, SlidersHorizontal } from "lucide-react"
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
  const [expandedId, setExpandedId] = useState<string | null>(null)

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-primary shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary-foreground">ConnectMD</h1>
            <div className="flex items-center gap-4">
              <Link
                href="/about"
                className="text-lg text-primary-foreground/90 hover:text-primary-foreground transition-colors"
              >
                About
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Map and All Locations */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
          {/* Left Panel: Search + Locations List */}
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, type, or address..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
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
                      <h3 className="font-semibold text-sm">Filters</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Distance</label>
                          <Select value={distanceFilter} onValueChange={setDistanceFilter}>
                            <SelectTrigger>
                              <SelectValue placeholder="Distance" />
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
                          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Type</label>
                          <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger>
                              <SelectValue placeholder="Type" />
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
                          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Status</label>
                          <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger>
                              <SelectValue placeholder="Status" />
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
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Medical Practices</h2>
                <Badge variant="secondary">{filteredPhysicians.length} found</Badge>
              </div>
            </div>

            {/* Locations List */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {filteredPhysicians.map((physician) => (
                <Card
                  key={physician.place_id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedLocation?.place_id === physician.place_id
                      ? "bg-accent text-accent-foreground border-accent shadow-lg"
                      : "bg-white hover:border-accent/50"
                  }`}
                  onClick={() => setSelectedLocation(physician)}
                >
                  <div className="px-3 py-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <h3
                          className={`font-semibold truncate flex-1 ${
                            selectedLocation?.place_id === physician.place_id
                              ? "text-accent-foreground"
                              : "text-card-foreground"
                          }`}
                        >
                          {physician.name}
                        </h3>
                        {userLocation && (
                          <span
                            className={`text-sm whitespace-nowrap ${
                              selectedLocation?.place_id === physician.place_id
                                ? "text-accent-foreground/80"
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
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-8 w-8 p-0 flex-shrink-0 ${
                          selectedLocation?.place_id === physician.place_id ? "hover:bg-accent-foreground/10" : ""
                        }`}
                        onClick={(e) => {
                          e.stopPropagation()
                          setExpandedId(expandedId === physician.place_id ? null : physician.place_id)
                        }}
                      >
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${
                            expandedId === physician.place_id ? "rotate-180" : ""
                          } ${selectedLocation?.place_id === physician.place_id ? "text-accent-foreground" : ""}`}
                        />
                      </Button>
                    </div>

                    {expandedId === physician.place_id && (
                      <div className="mt-4 pt-4 border-t space-y-3">
                        <div>
                          <h4
                            className={`text-xs font-semibold mb-1 ${
                              selectedLocation?.place_id === physician.place_id
                                ? "text-accent-foreground/80"
                                : "text-muted-foreground"
                            }`}
                          >
                            Type
                          </h4>
                          <p
                            className={`text-sm capitalize ${
                              selectedLocation?.place_id === physician.place_id ? "text-accent-foreground" : ""
                            }`}
                          >
                            {physician.types[0]?.replace(/_/g, " ")}
                          </p>
                        </div>
                        <div>
                          <h4
                            className={`text-xs font-semibold mb-1 flex items-center gap-1 ${
                              selectedLocation?.place_id === physician.place_id
                                ? "text-accent-foreground/80"
                                : "text-muted-foreground"
                            }`}
                          >
                            <MapPin className="h-3 w-3" />
                            Address
                          </h4>
                          <p
                            className={`text-sm ${
                              selectedLocation?.place_id === physician.place_id ? "text-accent-foreground" : ""
                            }`}
                          >
                            {physician.address}
                          </p>
                        </div>
                        <div>
                          <h4
                            className={`text-xs font-semibold mb-1 flex items-center gap-1 ${
                              selectedLocation?.place_id === physician.place_id
                                ? "text-accent-foreground/80"
                                : "text-muted-foreground"
                            }`}
                          >
                            <Phone className="h-3 w-3" />
                            Phone
                          </h4>
                          <a
                            href={`tel:${physician.phone}`}
                            className={`text-sm hover:underline ${
                              selectedLocation?.place_id === physician.place_id
                                ? "text-accent-foreground"
                                : "text-accent"
                            }`}
                          >
                            {physician.phone}
                          </a>
                        </div>
                        {physician.types.length > 1 && (
                          <div>
                            <h4
                              className={`text-xs font-semibold mb-1 ${
                                selectedLocation?.place_id === physician.place_id
                                  ? "text-accent-foreground/80"
                                  : "text-muted-foreground"
                              }`}
                            >
                              Additional Categories
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {physician.types.slice(1).map((type, index) =>
                                type === "point_of_interest" ? null : (
                                  <Badge
                                    key={index}
                                    variant={
                                      selectedLocation?.place_id === physician.place_id ? "secondary" : "outline"
                                    }
                                    className="capitalize text-xs"
                                  >
                                    {type.replace(/_/g, " ")}
                                  </Badge>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Google Map */}
          <Card className="h-[600px] overflow-hidden p-0">
            <GoogleMapComponent
              locations={filteredPhysicians}
              userLocation={userLocation}
              selectedLocation={selectedLocation}
              onMarkerClick={setSelectedLocation}
            />
          </Card>
        </div>
      </div>
    </div>
  )
}
