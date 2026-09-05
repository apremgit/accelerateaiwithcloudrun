// Source: Google Maps Platform Code Assist
import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { searchPlacesLive, computeRouteLive, PlaceResult, RouteResult } from '@/lib/maps-service';

const MODEL_FALLBACK_LADDER = [
  'gemini-3.6-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-3.7-flash',
];

interface ToolCallResult {
  toolName: string;
  args: any;
  result: any;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { prompt, history = [], userLocation } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'A prompt is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured on the server.' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    // Define function declarations for Google Maps Grounding tools
    const tools = [
      {
        functionDeclarations: [
          {
            name: 'search_places',
            description:
              'Search for real places, venues, parks, cafes, bookstores, mindfulness spots, or businesses using Google Maps Places API (New).',
            parameters: {
              type: 'OBJECT',
              properties: {
                query: {
                  type: 'STRING',
                  description: 'The location search query (e.g. "quiet parks in Seattle", "coffee shops near Central Park")',
                },
                limit: {
                  type: 'INTEGER',
                  description: 'Max number of places to return (default 5)',
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'compute_routes_and_directions',
            description:
              'Compute real-time routes, distances, travel durations, and turn-by-turn directions between an origin and a destination using Google Routes API.',
            parameters: {
              type: 'OBJECT',
              properties: {
                origin: {
                  type: 'STRING',
                  description: 'The starting address or location name (e.g. "Times Square, NYC" or "Kyoto Station")',
                },
                destination: {
                  type: 'STRING',
                  description: 'The target destination address or location name',
                },
                travelMode: {
                  type: 'STRING',
                  description: 'Mode of travel: DRIVE, WALK, BICYCLE, or TRANSIT (default DRIVE)',
                },
              },
              required: ['origin', 'destination'],
            },
          },
        ],
      },
    ];

    const systemInstruction = `You are the Google Maps & Journey Intelligence Agent for ReflectAI.
Your purpose is to provide real-time, grounded geospatial insights, discover serene & inspiring places (nature walks, cafes, parks, meditation spots, libraries), and calculate travel routes and directions for users.

RULES:
1. ALWAYS use the provided Google Maps tools ('search_places', 'compute_routes_and_directions') whenever the user asks about real places, recommendations, directions, or routes.
2. Never invent fake place addresses, coordinates, or ratings. Ground all recommendations on the tool responses.
3. When presenting places:
   - Provide the place name, rating (with stars), category, concise highlights, and verified address.
   - Include direct Google Maps links from the tool output.
4. When presenting routes or directions:
   - Provide the total distance, estimated travel duration, and key turn-by-turn steps.
   - Emphasize mindful travel tips or scenic highlights if appropriate.
5. Format your output in clean Markdown with clear headings and bullet points.`;

    // Build conversation contents
    const contents: any[] = [];
    for (const msg of history) {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      });
    }

    let userPromptWithLocation = prompt;
    if (userLocation && userLocation.city) {
      userPromptWithLocation += `\n[User's approximate location: ${userLocation.city}, ${userLocation.country}]`;
    }

    contents.push({
      role: 'user',
      parts: [{ text: userPromptWithLocation }],
    });

    // Multi-turn tool execution loop
    let toolResultsCollected: ToolCallResult[] = [];
    let finalAnswerText = '';
    let placesData: PlaceResult[] = [];
    let routeData: RouteResult | null = null;

    let modelIndex = 0;
    let modelSuccess = false;

    while (modelIndex < MODEL_FALLBACK_LADDER.length && !modelSuccess) {
      const currentModel = MODEL_FALLBACK_LADDER[modelIndex];

      try {
        // Step 1: Initial call to Gemini to see if it triggers a tool call
        const response = await ai.models.generateContent({
          model: currentModel,
          contents,
          config: {
            systemInstruction,
            tools: tools as any,
          },
        });

        const candidate = response.candidates?.[0];
        const functionCalls = response.functionCalls || [];

        if (functionCalls && functionCalls.length > 0) {
          // Execute function calls
          const functionResponsesParts: any[] = [];

          for (const call of functionCalls) {
            const toolName = call.name || 'unknown_function';
            const args: any = call.args || {};

            let toolOutput: any = null;

            if (toolName === 'search_places') {
              try {
                const results = await searchPlacesLive(args.query, args.limit || 5);
                toolOutput = { places: results };
                placesData.push(...results);
              } catch (err: any) {
                toolOutput = { error: err?.message || 'Failed to fetch places.' };
              }
            } else if (toolName === 'compute_routes_and_directions') {
              try {
                const route = await computeRouteLive(args.origin, args.destination, args.travelMode || 'DRIVE');
                toolOutput = { route };
                routeData = route;
              } catch (err: any) {
                toolOutput = { error: err?.message || 'Failed to compute route.' };
              }
            } else {
              toolOutput = { error: `Unknown function: ${toolName}` };
            }

            toolResultsCollected.push({
              toolName,
              args,
              result: toolOutput,
            });

            functionResponsesParts.push({
              functionResponse: {
                name: toolName,
                response: toolOutput,
              },
            });
          }

          // Step 2: Send function execution results back to Gemini for grounded answer
          const followUpContents = [
            ...contents,
            {
              role: 'model',
              parts: candidate?.content?.parts || [{ text: '' }],
            },
            {
              role: 'user',
              parts: functionResponsesParts,
            },
          ];

          const groundedResponse = await ai.models.generateContent({
            model: currentModel,
            contents: followUpContents,
            config: {
              systemInstruction,
            },
          });

          finalAnswerText = groundedResponse.text || 'Information retrieved successfully.';
          modelSuccess = true;
        } else {
          finalAnswerText = response.text || 'No response generated.';
          modelSuccess = true;
        }
      } catch (err: any) {
        console.warn(`Model ${currentModel} failed in maps agent:`, err?.message);
        modelIndex++;
        if (modelIndex >= MODEL_FALLBACK_LADDER.length) {
          throw err;
        }
      }
    }

    return NextResponse.json({
      text: finalAnswerText,
      toolResults: toolResultsCollected,
      places: placesData,
      route: routeData,
      attribution: {
        source: 'Google Maps Platform',
        notice: 'Real-time location, place, and route information provided by Google Maps Platform APIs.',
        url: 'https://cloud.google.com/maps-platform/terms?utm_campaign=gmp_mcp_codeassist_v1_aistudio',
        attributionId: 'gmp_mcp_codeassist_v1_aistudio',
      },
    });
  } catch (error: any) {
    console.error('Maps Agent Endpoint Error:', error);
    return NextResponse.json(
      {
        error: error?.message || 'Failed to process request with Google Maps Agent',
      },
      { status: 500 }
    );
  }
}
