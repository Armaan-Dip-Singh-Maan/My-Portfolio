import { NextRequest, NextResponse, userAgent } from "next/server";
import { geolocation } from "@vercel/functions";
import redis from "./lib/redis";

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === "/") {
    const geo = geolocation(req);

    const country = geo?.country;
    const city = geo?.city;
    const region = geo?.countryRegion;
    const { isBot } = userAgent(req);

    if (country && city && region && !isBot && redis) {
      try {
        await redis.set(
          "currentLocation",
          JSON.stringify({
            country,
            city,
            region,
            isBot,
          }),
        );
      } catch (error) {
        console.error("Redis error in middleware:", error);
      }
    }

    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};