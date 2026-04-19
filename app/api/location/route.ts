import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  const lang = searchParams.get('lang') || 'en';

  if (!q) {
    return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
  }

  try {
    // Construct Accept-Language based on user preference
    const acceptLang = lang.startsWith('ar') ? 'ar,en;q=0.1' : 'en,ar;q=0.1';

    // Use Nominatim directly for maximum accuracy matching osm.org
    // Added countrycodes=eg to bias for Egypt as seen in previous implementation
    // Added addressdetails=1 for richer data
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=10&countrycodes=eg&viewbox=24.0,31.7,37.0,22.0&bounded=0`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'JoyinApp/1.0 (contact@joyin.online)',
        'Accept-Language': acceptLang
      }
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Nominatim access forbidden - User-Agent or Policy issue');
      }
      throw new Error('Nominatim request failed: ' + response.status);
    }

    const data = await response.json();
    
    // Map Nominatim results to the frontend's expected format
    const formattedData = data.map((item: any) => {
      return {
        place_id: item.place_id,
        // Nominatim's display_name is already a high-quality comma-separated string
        display_name: item.display_name,
        lon: item.lon,
        lat: item.lat
      };
    });

    return NextResponse.json(formattedData);
  } catch (error: any) {
    console.error("Location API proxy error:", error);
    return NextResponse.json({ 
      error: 'Failed to fetch location data', 
      details: error.message 
    }, { status: 500 });
  }
}
