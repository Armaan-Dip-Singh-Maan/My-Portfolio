import { LocationResponse } from "@/components/LocationData";
import { Redis } from "@upstash/redis";
import { unstable_cache as cache } from "next/cache";
import { Activity } from "react-activity-calendar";

// Create Redis instance only if credentials are available and not during build
const createRedisInstance = () => {
  // Skip Redis during build process to avoid authentication errors
  if (process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV) {
    console.log('Skipping Redis during build process');
    return null;
  }
  
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  
  if (!url || !token) {
    console.warn('Redis credentials not available');
    return null;
  }
  
  try {
    return new Redis({ url, token });
  } catch (error) {
    console.error('Failed to create Redis instance:', error);
    return null;
  }
};

const redis = createRedisInstance();

export const getCachedGithubData = cache(
  async () => {
    if (!redis) {
      console.warn('Redis not available, returning null for github data');
      return null;
    }
    
    try {
      return (await redis.get("github")) as Activity[] | null;
    } catch (error) {
      console.error('Redis error in getCachedGithubData:', error);
      return null;
    }
  },
  ["github-data"],
  { tags: ["github"] },
);

export const getCachedLocationData = cache(
  async () => {
    if (!redis) {
      console.warn('Redis not available, returning null for location data');
      return null;
    }
    
    try {
      return (await redis.get("lastLocation")) as LocationResponse | null;
    } catch (error) {
      console.error('Redis error in getCachedLocationData:', error);
      return null;
    }
  },
  ["location-data"],
  { tags: ["location"] },
);

export default redis;