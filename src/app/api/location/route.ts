import redis, { getCachedLocationData, setLocationData } from "@/lib/redis";
import { LocationResponse } from "@/types/location";
import { geolocation } from "@vercel/functions";
import { userAgent } from "next/server";
import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;

// Simple in-memory rate limiting (use Redis for production if needed)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);

  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (limit.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  limit.count++;
  return true;
}

function validateLocationData(data: Partial<LocationResponse>): data is LocationResponse {
  return !!(
    data &&
    typeof data.country === 'string' &&
    typeof data.city === 'string' &&
    typeof data.region === 'string' &&
    data.country.length === 2 && // ISO country code
    data.city.length > 0 &&
    data.region.length > 0
  );
}

function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  return realIP || req.ip || 'unknown';
}

export async function POST(req: NextRequest) {
  try {
    const clientIP = getClientIP(req);
    
    // Rate limiting
    if (!checkRateLimit(clientIP)) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), 
        { 
          status: 429,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const geo = geolocation(req);
    const country = geo?.country;
    const city = geo?.city;
    const region = geo?.countryRegion;
    const { isBot } = userAgent(req);

    if (isBot) {
      return new Response(
        JSON.stringify({ error: "Bot traffic not allowed" }), 
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (!country || !city || !region) {
      return new Response(
        JSON.stringify({ error: "Location data not available" }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const locationData: LocationResponse = {
      country,
      city,
      region,
      timestamp: new Date().toISOString(),
      ip: clientIP.substring(0, 8) + '***' // Partial IP for privacy
    };

    // Validate the data
    if (!validateLocationData(locationData)) {
      return new Response(
        JSON.stringify({ error: "Invalid location data" }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Save to Redis
    const success = await setLocationData(locationData);
    
    if (success) {
      // Revalidate cache
      revalidateTag("location");
    }

    // Remove sensitive data from response
    const { ip, ...publicLocationData } = locationData;

    return new Response(
      JSON.stringify({ 
        success: true, 
        location: publicLocationData 
      }), 
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error("Error tracking location:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export async function GET() {
  try {
    const locationData = await getCachedLocationData();
    
    // Remove sensitive data before sending to client
    if (locationData) {
      const { ip, ...publicData } = locationData;
      return Response.json({ 
        success: true,
        lastLocation: publicData 
      });
    }
    
    return Response.json({ 
      success: true,
      lastLocation: null 
    });
  } catch (error) {
    console.error("Error getting location:", error);
    return Response.json({ 
      success: false,
      lastLocation: null,
      error: "Failed to retrieve location data"
    });
  }
}