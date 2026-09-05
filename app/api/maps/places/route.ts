// Source: Google Maps Platform Code Assist
import { NextRequest, NextResponse } from 'next/server';

function getMapsApiKey(): string {
  return process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GEMINI_API_KEY || '';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { query, locationBias, includedType, maxResultCount = 8 } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'A query string is required' }, { status: 400 });
    }

    const apiKey = getMapsApiKey();
    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'Google Maps API key is not configured. Please set GOOGLE_MAPS_API_KEY in your environment.',
        },
        { status: 500 }
      );
    }

    // Use Places API (New) Text Search endpoint
    const url = 'https://places.googleapis.com/v1/places:searchText';
    const payload: Record<string, any> = {
      textQuery: query,
      maxResultCount: Math.min(maxResultCount, 20),
      languageCode: 'en',
    };

    if (includedType) {
      payload.includedType = includedType;
    }

    if (locationBias && locationBias.latitude && locationBias.longitude) {
      payload.locationBias = {
        circle: {
          center: {
            latitude: locationBias.latitude,
            longitude: locationBias.longitude,
          },
          radius: locationBias.radiusMeters || 5000.0,
        },
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask':
          'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.googleMapsUri,places.websiteUri,places.primaryType,places.primaryTypeDisplayName,places.editorialSummary,places.regularOpeningHours',
        'X-Goog-Client-Id': 'gmp_mcp_codeassist_v1_aistudio',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Places API error:', response.status, errorText);
      return NextResponse.json(
        { error: `Google Places API returned status ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    const places = (data.places || []).map((place: any) => ({
      id: place.id,
      name: place.displayName?.text || 'Unnamed Location',
      address: place.formattedAddress || 'Address unavailable',
      location: place.location ? { lat: place.location.latitude, lng: place.location.longitude } : null,
      rating: place.rating || null,
      userRatingCount: place.userRatingCount || 0,
      googleMapsUri: place.googleMapsUri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.displayName?.text || query)}`,
      websiteUri: place.websiteUri || null,
      type: place.primaryTypeDisplayName?.text || place.primaryType || 'Place',
      summary: place.editorialSummary?.text || null,
      isOpenNow: place.regularOpeningHours?.openNow ?? null,
      weekdayDescriptions: place.regularOpeningHours?.weekdayDescriptions || [],
    }));

    return NextResponse.json({ places });
  } catch (error: any) {
    console.error('Places API Handler Error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to search places' }, { status: 500 });
  }
}
