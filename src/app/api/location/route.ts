import redis, { getCachedLocationData } from "@/lib/redis";
import { geolocation } from "@vercel/functions";
import { userAgent } from "next/server";
import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const geo = geolocation(req);
    const country = geo?.country;
    const city = geo?.city;
    const region = geo?.countryRegion;
    const { isBot } = userAgent(req);

    if (!country || !city || !region || isBot) {
      return new Response("Missing location data or bot detected", { status: 400 });
    }

    const locationData = {
      country,
      city,
      region,
    };

    if (redis) {
      try {
        await redis.set("lastLocation", JSON.stringify(locationData));
        revalidateTag("location");
        await getCachedLocationData();
      } catch (redisError) {
        console.error("Redis operation failed:", redisError);
        // Continue execution even if Redis fails
      }
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error tracking location:", error);
    return new Response("Error tracking location", { status: 500 });
  }
}

// Add GET method if you need it
export async function GET() {
  try {
    const locationData = await getCachedLocationData();
    return Response.json({ lastLocation: locationData });
  } catch (error) {
    console.error("Error getting location:", error);
    return Response.json({ lastLocation: null });
  }
}