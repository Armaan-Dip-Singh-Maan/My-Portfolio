// src/components/LocationUpdater.tsx - Fixed TypeScript errors
"use client";

import { useEffect, useState, useCallback } from "react";
import type { LocationResponse } from "../types/location";

interface LocationUpdaterProps {
  onLocationUpdate?: (location: LocationResponse) => void;
  onError?: (error: string) => void;
}

export const LocationUpdater = ({ onLocationUpdate, onError }: LocationUpdaterProps) => {
  const [hasUpdated, setHasUpdated] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);

  const updateLocation = useCallback(async () => {
    try {
      const response = await fetch("/api/location", { 
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onLocationUpdate?.(data.location);
        setRetryCount(0);
      } else if (response.status === 429) {
        console.warn("Rate limited, will retry later");
        onError?.("Rate limited, please try again later");
        return;
      } else if (response.status === 403) {
        console.warn("Bot detected or forbidden");
        onError?.("Access denied");
        return;
      } else {
        throw new Error(data.error || `HTTP ${response.status}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update location";
      console.error("Failed to update location:", error);
      onError?.(errorMessage);
      
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000;
        setTimeout(() => {
          setRetryCount((prev: number) => prev + 1);
          updateLocation();
        }, delay);
      }
    }
  }, [onLocationUpdate, onError, retryCount]);

  useEffect(() => {
    if (!hasUpdated) {
      setHasUpdated(true);
      updateLocation();
    }
  }, [hasUpdated, updateLocation]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && hasUpdated) {
        setTimeout(updateLocation, 1000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [updateLocation, hasUpdated]);

  return null;
};