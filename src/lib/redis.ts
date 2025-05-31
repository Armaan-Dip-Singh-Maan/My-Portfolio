import { LocationResponse } from "@/types/location";
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
    return new Redis({ 
      url, 
      token,
      retry: {
        retries: 3,
        retryDelayOnFailure: 300,
      }
    });
  } catch (error) {
    console.error('Failed to create Redis instance:', error);
    return null;
  }
};

const redis = createRedisInstance();

// Helper function to safely parse JSON
const safeJsonParse = <T>(data: any, fallback: T): T => {
  if (!data) return fallback;
  
  try {
    return typeof data === 'string' ? JSON.parse(data) : data;
  } catch (error) {
    console.error('JSON parse error:', error);
    return fallback;
  }
};

export const getCachedGithubData = cache(
  async (): Promise<Activity[] | null> => {
    if (!redis) {
      console.warn('Redis not available, returning null for github data');
      return null;
    }
    
    try {
      const data = await redis.get("github");
      return safeJsonParse<Activity[] | null>(data, null);
    } catch (error) {
      console.error('Redis error in getCachedGithubData:', error);
      return null;
    }
  },
  ["github-data"],
  { tags: ["github"], revalidate: 3600 }, // 1 hour cache
);

export const getCachedLocationData = cache(
  async (): Promise<LocationResponse | null> => {
    if (!redis) {
      console.warn('Redis not available, returning null for location data');
      return null;
    }
    
    try {
      const data = await redis.get("lastLocation");
      return safeJsonParse<LocationResponse | null>(data, null);
    } catch (error) {
      console.error('Redis error in getCachedLocationData:', error);
      return null;
    }
  },
  ["location-data"],
  { tags: ["location"], revalidate: 60 }, // 1 minute cache
);

// Additional helper functions
export const getLocationHistory = cache(
  async (): Promise<LocationResponse[]> => {
    if (!redis) {
      console.warn('Redis not available, returning empty array for location history');
      return [];
    }
    
    try {
      const history = await redis.lrange("locationHistory", 0, 9); // Last 10 locations
      return history.map(item => safeJsonParse<LocationResponse>(item, {} as LocationResponse))
        .filter(item => item.city && item.country); // Filter out invalid entries
    } catch (error) {
      console.error('Redis error in getLocationHistory:', error);
      return [];
    }
  },
  ["location-history"],
  { tags: ["location"], revalidate: 300 }, // 5 minute cache
);

export const setLocationData = async (locationData: LocationResponse): Promise<boolean> => {
  if (!redis) {
    console.warn('Redis not available, cannot set location data');
    return false;
  }
  
  try {
    const dataWithTimestamp = {
      ...locationData,
      timestamp: new Date().toISOString()
    };
    
    // Set current location with 24 hour expiration
    await redis.setex("lastLocation", 86400, JSON.stringify(dataWithTimestamp));
    
    // Add to history (keep last 10)
    await redis.lpush("locationHistory", JSON.stringify(dataWithTimestamp));
    await redis.ltrim("locationHistory", 0, 9);
    
    return true;
  } catch (error) {
    console.error('Redis error in setLocationData:', error);
    return false;
  }
};

export const setGithubData = async (githubData: Activity[]): Promise<boolean> => {
  if (!redis) {
    console.warn('Redis not available, cannot set github data');
    return false;
  }
  
  try {
    await redis.setex("github", 3600, JSON.stringify(githubData)); // 1 hour expiration
    return true;
  } catch (error) {
    console.error('Redis error in setGithubData:', error);
    return false;
  }
};

export default redis;