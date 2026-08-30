/**
 * FarmLink Direct — High-Accuracy Geolocation & Reverse Geocoding Utility
 */

export interface AccurateLocation {
  lat: number;
  lng: number;
  accuracyMeters?: number;
  address: string;
  villageOrCity?: string;
  source: "gps" | "ip" | "preset";
}

/**
 * Fetch human-readable address from coordinates using OpenStreetMap Nominatim
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
      {
        headers: {
          "Accept-Language": "en,hi",
          "User-Agent": "FarmLinkDirect-AgriPlatform/1.0",
        },
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.display_name) {
        const addr = data.address || {};
        const parts = [
          addr.suburb || addr.neighbourhood || addr.village || addr.hamlet || addr.town || addr.road,
          addr.county || addr.city_district || addr.district || addr.city || "Lucknow",
          addr.state || "Uttar Pradesh",
        ].filter(Boolean);

        return parts.length > 0 ? parts.join(", ") : data.display_name.split(",").slice(0, 3).join(", ");
      }
    }
  } catch (err) {
    console.warn("Reverse geocoding network error", err);
  }

  // Fallback if network fails
  return `Location [${lat.toFixed(4)}, ${lng.toFixed(4)}], Lucknow Region`;
}

/**
 * Search locations/villages across Lucknow and Uttar Pradesh
 */
export async function searchAddress(query: string): Promise<Array<{ display_name: string; lat: number; lon: number }>> {
  if (!query || query.trim().length < 2) return [];
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const fullQuery = query.toLowerCase().includes("lucknow") || query.toLowerCase().includes("up")
      ? query
      : `${query}, Lucknow, Uttar Pradesh`;

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullQuery)}&countrycodes=in&limit=5`,
      {
        headers: {
          "Accept-Language": "en,hi",
          "User-Agent": "FarmLinkDirect-AgriPlatform/1.0",
        },
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return (data || []).map((item: any) => ({
        display_name: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
      }));
    }
  } catch (err) {
    console.warn("Address search error", err);
  }
  return [];
}

/**
 * Capture seamless, high-accuracy live location
 * 1. Tries HTML5 Geolocation (High Accuracy)
 * 2. Tries HTML5 Geolocation (Standard Accuracy)
 * 3. Falls back to IP Geolocation if permissions are blocked or desktop lacks GPS hardware
 */
export async function getLiveAccurateLocation(): Promise<AccurateLocation> {
  // Step 1: Try HTML5 Browser Geolocation
  if (typeof window !== "undefined" && navigator.geolocation) {
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        });
      });

      const lat = Number(pos.coords.latitude.toFixed(5));
      const lng = Number(pos.coords.longitude.toFixed(5));
      const address = await reverseGeocode(lat, lng);

      return {
        lat,
        lng,
        accuracyMeters: pos.coords.accuracy,
        address,
        source: "gps",
      };
    } catch (gpsError: any) {
      console.warn("High accuracy GPS failed, attempting IP-based live fallback...", gpsError);
    }
  }

  // Step 2: Fallback to IP-based Geolocation for instant live city/region
  try {
    const ipRes = await fetch("https://freeipapi.com/api/json");
    if (ipRes.ok) {
      const ipData = await ipRes.json();
      if (ipData && ipData.latitude && ipData.longitude) {
        const lat = Number(parseFloat(ipData.latitude).toFixed(5));
        const lng = Number(parseFloat(ipData.longitude).toFixed(5));
        const address = await reverseGeocode(lat, lng);

        return {
          lat,
          lng,
          address: `${ipData.cityName || "Lucknow"}, ${ipData.regionName || "Uttar Pradesh"} (via IP)`,
          source: "ip",
        };
      }
    }
  } catch (ipErr) {
    console.warn("IP geolocation fallback failed", ipErr);
  }

  // Default Lucknow center if completely offline
  return {
    lat: 26.8467,
    lng: 80.9462,
    address: "Hazratganj Central Receiving, Lucknow, Uttar Pradesh",
    source: "preset",
  };
}
