"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { getMapsApiKey } from "@/app/actions/get-maps-key"

interface Location {
  name: string
  address: string
  phone: string
  lat: number
  lng: number
  place_id: string
  business_status: string
  types: string[]
  distance?: number
}

interface GoogleMapProps {
  locations: Location[]
  userLocation: { lat: number; lng: number } | null
  selectedLocation: Location | null
  onMarkerClick: (location: Location) => void
}

declare global {
  interface Window {
    google: any
    initMap?: () => void
  }
}

function loadGoogleMapsScript(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Window is undefined"))
      return
    }

    // Check if already loaded
    if (window.google?.maps?.importLibrary) {
      resolve()
      return
    }

    // Check if script is already loading
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      // Wait for it to load
      const checkGoogle = setInterval(() => {
        if (window.google?.maps?.importLibrary) {
          clearInterval(checkGoogle)
          resolve()
        }
      }, 100)

      setTimeout(() => {
        clearInterval(checkGoogle)
        if (window.google?.maps?.importLibrary) {
          resolve()
        } else {
          reject(new Error("Google Maps failed to load"))
        }
      }, 10000)
      return
    }

    // Create and load new script
    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker&v=weekly`
    script.async = true
    script.defer = true

    script.onload = () => {
      // Wait for importLibrary to be available
      const checkGoogle = setInterval(() => {
        if (window.google?.maps?.importLibrary) {
          clearInterval(checkGoogle)
          resolve()
        }
      }, 50)

      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkGoogle)
        if (window.google?.maps?.importLibrary) {
          resolve()
        } else {
          reject(new Error("Google Maps importLibrary not available"))
        }
      }, 5000)
    }

    script.onerror = (error) => {
      reject(new Error("Failed to load Google Maps script"))
    }

    document.head.appendChild(script)
  })
}

export default function GoogleMapComponent({
  locations,
  userLocation,
  selectedLocation,
  onMarkerClick,
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any | null>(null)
  const markersRef = useRef<any[]>([])
  const userMarkerRef = useRef<any | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [markersReady, setMarkersReady] = useState(false)

  const handleMarkerClick = useCallback(
    (location: Location) => {
      onMarkerClick(location)
    },
    [onMarkerClick],
  )

  useEffect(() => {
    const initializeMap = async () => {
      try {
        const apiKey = await getMapsApiKey()

        if (!apiKey) {
          console.error("[v0] Google Maps API key is missing")
          setLoadError("Google Maps API key is not configured")
          return
        }

        console.log("[v0] Starting Google Maps load")

        await loadGoogleMapsScript(apiKey)
        console.log("[v0] Google Maps loaded successfully")
        setIsLoaded(true)
      } catch (error) {
        console.error("[v0] Failed to load Google Maps:", error)
        setLoadError(error instanceof Error ? error.message : "Unknown error")
      }
    }

    initializeMap()
  }, [])

  useEffect(() => {
    if (!mapRef.current || !isLoaded || !window.google?.maps?.importLibrary) {
      console.log("[v0] Map not ready:", {
        hasRef: !!mapRef.current,
        isLoaded,
        hasImportLibrary: !!window.google?.maps?.importLibrary,
      })
      return
    }

    const loadMap = async () => {
      try {
        console.log("[v0] Initializing map")
        const center = userLocation || { lat: 43.2557, lng: -79.8711 }
        const { Map } = (await window.google.maps.importLibrary("maps")) as any

        const map = new Map(mapRef.current!, {
          center,
          zoom: 12,
          mapId: "MEDICAL_PRACTICE_MAP",
        })

        mapInstanceRef.current = map
        console.log("[v0] Map initialized")

        if (userLocation) {
          const { AdvancedMarkerElement, PinElement } = (await window.google.maps.importLibrary("marker")) as any

          const userPin = new PinElement({
            background: "#4F46E5",
            borderColor: "#312E81",
            glyphColor: "#FFFFFF",
            scale: 1.2,
          })

          userMarkerRef.current = new AdvancedMarkerElement({
            map,
            position: userLocation,
            content: userPin.element,
            title: "Your Location",
          })
          console.log("[v0] User marker added")
        }

        const { AdvancedMarkerElement, PinElement } = (await window.google.maps.importLibrary("marker")) as any

        markersRef.current = locations.map((location) => {
          const isOperational = location.business_status === "OPERATIONAL"

          const pin = new PinElement({
            background: isOperational ? "#10B981" : "#6B7280",
            borderColor: isOperational ? "#059669" : "#4B5563",
            glyphColor: "#FFFFFF",
          })

          const marker = new AdvancedMarkerElement({
            map,
            position: { lat: location.lat, lng: location.lng },
            content: pin.element,
            title: location.name,
          })

          marker.addListener("click", () => {
            handleMarkerClick(location)
          })

          return marker
        })
        console.log("[v0] All markers added:", markersRef.current.length)
        setMarkersReady(true)
      } catch (error) {
        console.error("[v0] Error loading map:", error)
        setLoadError("Error initializing map")
      }
    }

    loadMap()

    return () => {
      setMarkersReady(false)
      markersRef.current.forEach((marker) => (marker.map = null))
      if (userMarkerRef.current) userMarkerRef.current.map = null
    }
  }, [locations, userLocation, isLoaded, handleMarkerClick])

  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded || !markersReady || !window.google?.maps?.importLibrary) {
      console.log("[v0] Not ready to update markers")
      return
    }

    const updateMarkers = async () => {
      try {
        if (markersRef.current.length !== locations.length) {
          console.log("[v0] Markers and locations mismatch, skipping update")
          return
        }

        const { PinElement } = (await window.google.maps.importLibrary("marker")) as any

        markersRef.current.forEach((marker, index) => {
          const location = locations[index]

          if (!location) {
            console.warn("[v0] Location at index", index, "is undefined")
            return
          }

          const isSelected = selectedLocation?.place_id === location.place_id
          const isOperational = location.business_status === "OPERATIONAL"

          const pin = new PinElement({
            background: isSelected ? "#8B5CF6" : isOperational ? "#10B981" : "#6B7280",
            borderColor: isSelected ? "#6D28D9" : isOperational ? "#059669" : "#4B5563",
            glyphColor: "#FFFFFF",
            scale: isSelected ? 1.3 : 1,
          })

          marker.content = pin.element
        })

        if (selectedLocation) {
          mapInstanceRef.current?.panTo({
            lat: selectedLocation.lat,
            lng: selectedLocation.lng,
          })
        }

        console.log("[v0] Markers updated, selected:", selectedLocation?.name || "none")
      } catch (error) {
        console.error("Error updating markers:", error)
      }
    }

    updateMarkers()
  }, [selectedLocation, locations, isLoaded, markersReady])

  if (loadError) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Failed to load map</p>
          <p className="text-xs text-muted-foreground mt-1">{loadError}</p>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted">
        <p className="text-sm text-muted-foreground">Loading map...</p>
      </div>
    )
  }

  return <div ref={mapRef} className="h-full w-full" />
}
