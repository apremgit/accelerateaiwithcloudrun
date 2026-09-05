// Source: Google Maps Platform Code Assist
import { NextRequest, NextResponse } from 'next/server';

function getMapsApiKey(): string {
  return process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GEMINI_API_KEY || '';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { origin, destination, travelMode = 'DRIVE', avoidTolls = false, avoidHighways = false } = body;

    if (!origin || !destination) {
      return NextResponse.json({ error: 'Both origin and destination are required' }, { status: 400 });
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

    // Format origin and destination
    const formatWaypoint = (point: any) => {
      if (typeof point === 'string') {
        return { address: point };
      }
      if (point.lat && point.lng) {
        return {
          location: {
            latLng: {
              latitude: point.lat,
              longitude: point.lng,
            },
          },
        };
      }
      return { address: String(point) };
    };

    const validModes = ['DRIVE', 'WALK', 'BICYCLE', 'TRANSIT', 'TWO_WHEELER'];
    const mode = validModes.includes(travelMode.toUpperCase()) ? travelMode.toUpperCase() : 'DRIVE';

    const url = 'https://routes.googleapis.com/directions/v2:computeRoutes';
    const payload: Record<string, any> = {
      origin: formatWaypoint(origin),
      destination: formatWaypoint(destination),
      travelMode: mode,
      routingPreference: mode === 'DRIVE' ? 'TRAFFIC_AWARE' : 'ROUTING_PREFERENCE_UNSPECIFIED',
      computeAlternativeRoutes: false,
      routeModifiers: {
        avoidTolls,
        avoidHighways,
        avoidFerries: false,
      },
      languageCode: 'en-US',
      units: 'IMPERIAL',
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask':
          'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.description,routes.warnings,routes.legs.duration,routes.legs.distanceMeters,routes.legs.startLocation,routes.legs.endLocation,routes.legs.steps.navigationInstruction,routes.legs.steps.localizedValues,routes.legs.steps.travelMode,routes.legs.steps.distanceMeters,routes.legs.steps.staticDuration',
        'X-Goog-Client-Id': 'gmp_mcp_codeassist_v1_aistudio',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Routes API error:', response.status, errorText);
      return NextResponse.json(
        { error: `Google Routes API returned status ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    const primaryRoute = data.routes?.[0];

    if (!primaryRoute) {
      return NextResponse.json({ error: 'No route found between the specified locations.' }, { status: 404 });
    }

    // Format human-readable distance and duration
    const distanceMeters = primaryRoute.distanceMeters || 0;
    const miles = (distanceMeters / 1609.34).toFixed(1);
    const kilometers = (distanceMeters / 1000).toFixed(1);
    const durationSeconds = parseInt(primaryRoute.duration?.replace('s', '') || '0', 10);
    const durationMinutes = Math.round(durationSeconds / 60);

    const steps = (primaryRoute.legs?.[0]?.steps || []).map((step: any) => ({
      instruction: step.navigationInstruction?.instructions || 'Proceed along the route',
      distance: step.localizedValues?.distance?.text || `${Math.round(step.distanceMeters || 0)}m`,
      duration: step.localizedValues?.staticDuration?.text || '',
    }));

    return NextResponse.json({
      route: {
        distanceMeters,
        distanceMiles: `${miles} mi`,
        distanceKm: `${kilometers} km`,
        durationSeconds,
        durationMinutes: `${durationMinutes} mins`,
        summary: primaryRoute.description || `${miles} miles, approximately ${durationMinutes} minutes`,
        polyline: primaryRoute.polyline?.encodedPolyline || null,
        warnings: primaryRoute.warnings || [],
        steps,
        originQuery: typeof origin === 'string' ? origin : 'Origin',
        destinationQuery: typeof destination === 'string' ? destination : 'Destination',
        travelMode: mode,
      },
    });
  } catch (error: any) {
    console.error('Routes API Handler Error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to compute route' }, { status: 500 });
  }
}
