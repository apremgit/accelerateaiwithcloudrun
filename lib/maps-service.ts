// Source: Google Maps Platform Code Assist
/**
 * Shared Google Maps Platform Services helper for Places API (New) and Routes API
 * Directs all traffic with internal attribution: gmp_mcp_codeassist_v1_aistudio
 */

export function getMapsApiKey(): string {
  return process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GEMINI_API_KEY || '';
}

export interface PlaceResult {
  id: string;
  name: string;
  address: string;
  location: { lat: number; lng: number } | null;
  rating: number | null;
  userRatingCount: number;
  googleMapsUri: string;
  websiteUri: string | null;
  type: string;
  summary: string | null;
  isOpenNow: boolean | null;
}

export interface RouteResult {
  distanceMiles: string;
  distanceKm: string;
  durationMinutes: string;
  summary: string;
  steps: Array<{ instruction: string; distance: string; duration: string }>;
  warnings: string[];
  travelMode: string;
  googleMapsUrl: string;
}

export async function searchPlacesLive(query: string, limit = 5): Promise<PlaceResult[]> {
  const apiKey = getMapsApiKey();
  if (!apiKey) {
    throw new Error('Google Maps API key is not configured (GOOGLE_MAPS_API_KEY).');
  }

  const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask':
        'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.googleMapsUri,places.websiteUri,places.primaryType,places.primaryTypeDisplayName,places.editorialSummary,places.regularOpeningHours',
      'X-Goog-Client-Id': 'gmp_mcp_codeassist_v1_aistudio',
    },
    body: JSON.stringify({
      textQuery: query,
      maxResultCount: Math.min(limit, 10),
      languageCode: 'en',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Places Search Error:', response.status, errorText);
    throw new Error(`Google Places API returned status ${response.status}`);
  }

  const data = await response.json();
  return (data.places || []).map((p: any) => ({
    id: p.id,
    name: p.displayName?.text || 'Unnamed Place',
    address: p.formattedAddress || 'Address unavailable',
    location: p.location ? { lat: p.location.latitude, lng: p.location.longitude } : null,
    rating: p.rating || null,
    userRatingCount: p.userRatingCount || 0,
    googleMapsUri:
      p.googleMapsUri ||
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.displayName?.text || query)}`,
    websiteUri: p.websiteUri || null,
    type: p.primaryTypeDisplayName?.text || p.primaryType || 'Location',
    summary: p.editorialSummary?.text || null,
    isOpenNow: p.regularOpeningHours?.openNow ?? null,
  }));
}

export async function computeRouteLive(
  origin: string,
  destination: string,
  travelMode = 'DRIVE'
): Promise<RouteResult> {
  const apiKey = getMapsApiKey();
  if (!apiKey) {
    throw new Error('Google Maps API key is not configured (GOOGLE_MAPS_API_KEY).');
  }

  const mode = ['DRIVE', 'WALK', 'BICYCLE', 'TRANSIT'].includes(travelMode.toUpperCase())
    ? travelMode.toUpperCase()
    : 'DRIVE';

  const response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask':
        'routes.duration,routes.distanceMeters,routes.description,routes.warnings,routes.legs.steps.navigationInstruction,routes.legs.steps.localizedValues,routes.legs.steps.distanceMeters',
      'X-Goog-Client-Id': 'gmp_mcp_codeassist_v1_aistudio',
    },
    body: JSON.stringify({
      origin: { address: origin },
      destination: { address: destination },
      travelMode: mode,
      routingPreference: mode === 'DRIVE' ? 'TRAFFIC_AWARE' : 'ROUTING_PREFERENCE_UNSPECIFIED',
      languageCode: 'en-US',
      units: 'IMPERIAL',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Routes Compute Error:', response.status, errorText);
    throw new Error(`Google Routes API returned status ${response.status}`);
  }

  const data = await response.json();
  const primaryRoute = data.routes?.[0];
  if (!primaryRoute) {
    throw new Error(`No route found from "${origin}" to "${destination}".`);
  }

  const distanceMeters = primaryRoute.distanceMeters || 0;
  const miles = (distanceMeters / 1609.34).toFixed(1);
  const kilometers = (distanceMeters / 1000).toFixed(1);
  const durationSeconds = parseInt(primaryRoute.duration?.replace('s', '') || '0', 10);
  const durationMinutes = Math.round(durationSeconds / 60);

  const steps = (primaryRoute.legs?.[0]?.steps || []).map((s: any) => ({
    instruction: s.navigationInstruction?.instructions || 'Proceed along route',
    distance: s.localizedValues?.distance?.text || `${Math.round(s.distanceMeters || 0)}m`,
    duration: s.localizedValues?.staticDuration?.text || '',
  }));

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    origin
  )}&destination=${encodeURIComponent(destination)}&travelmode=${mode.toLowerCase()}`;

  return {
    distanceMiles: `${miles} mi`,
    distanceKm: `${kilometers} km`,
    durationMinutes: `${durationMinutes} mins`,
    summary: primaryRoute.description || `${miles} mi (${durationMinutes} mins)`,
    steps,
    warnings: primaryRoute.warnings || [],
    travelMode: mode,
    googleMapsUrl,
  };
}
