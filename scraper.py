import googlemaps
import time
import json
from dotenv import load_dotenv
import os
from datetime import datetime

load_dotenv()

gmaps = googlemaps.Client(key=os.getenv("GOOGLEMAPS_API_KEY"))

MAX_RADIUS_METERS = 50_000  # Google Places hard limit


def get_physicians_near_address(address, radius_km=8):
    radius_m = min(int(radius_km * 1000), MAX_RADIUS_METERS)

    geocode = gmaps.geocode(address)
    if not geocode:
        raise ValueError("Could not geocode address")

    loc = geocode[0]["geometry"]["location"]

    collected = []
    response = gmaps.places_nearby(
        location=(loc["lat"], loc["lng"]),
        radius=radius_m,
        type="doctor"
    )

    while True:
        for place in response.get("results", []):
            place_id = place["place_id"]
            place_types = place.get("types", [])

            details = gmaps.place(
                place_id=place_id,
                fields=[
                    "name",
                    "formatted_address",
                    "formatted_phone_number",
                    "geometry",
                    "business_status"
                ]
            )

            result = details.get("result", {})

            collected.append({
                "name": result.get("name"),
                "address": result.get("formatted_address"),
                "phone": result.get("formatted_phone_number"),
                "lat": result["geometry"]["location"]["lat"],
                "lng": result["geometry"]["location"]["lng"],
                "place_id": place_id,
                "business_status": result.get("business_status"),
                "types": place_types
            })

            time.sleep(0.1)

        if "next_page_token" not in response:
            break

        time.sleep(2)
        response = gmaps.places_nearby(
            page_token=response["next_page_token"]
        )

    return collected


def write_to_json(data, address, radius_km, filename="physicians.json"):
    payload = {
        "query": {
            "address": address,
            "radius_km": radius_km,
            "timestamp_utc": datetime.utcnow().isoformat() + "Z"
        },
        "count": len(data),
        "physicians": data
    }

    with open(filename, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)

    print(f"✅ Wrote {len(data)} records to {filename}")


if __name__ == "__main__":
    address = "1280 Main Street West, Hamilton, Ontario L8S 4L8"
    radius_km = 30

    physicians = get_physicians_near_address(
        address=address,
        radius_km=radius_km
    )

    write_to_json(
        data=physicians,
        address=address,
        radius_km=radius_km,
        filename="hamilton_physicians.json"
    )
