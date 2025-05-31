"use client";

import { useEffect, useState } from "react";
import { MotionChild, MotionParent } from "./Motion";
import { LocationUpdater } from "./LocationUpdater";
import { AlertCircle, MapPin, Clock, RefreshCw } from "lucide-react";

// Import types with proper path for src structure
import type { LocationResponse, LocationState } from "../types/location";

const getCountryFlag = (countryCode: string): string => {
  try {
    return countryCode
      .toUpperCase()
      .split("")
      .map((char) => String.fromCodePoint(char.charCodeAt(0) + 127397))
      .join("");
  } catch {
    return "🌍";
  }
};

const formatTimestamp = (timestamp?: string): string => {
  if (!timestamp) return "";
  
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  } catch {
    return "";
  }
};

interface LocationSectionProps {
  initialLocation?: LocationResponse | null;
}

export const LocationSection = ({ initialLocation }: LocationSectionProps) => {
  const [state, setState] = useState<LocationState>({
    location: initialLocation || {
      city: "Amritsar",
      region: "PB",
      country: "IN",
    },
    isLoading: false,
    error: null,
    hasConsent: false
  });

  useEffect(() => {
    const consent = localStorage.getItem('location-consent');
    setState((prev: LocationState) => ({ 
      ...prev, 
      hasConsent: consent === 'true' 
    }));
  }, []);

  const handleConsentAccept = () => {
    localStorage.setItem('location-consent', 'true');
    setState((prev: LocationState) => ({ ...prev, hasConsent: true }));
  };

  const handleConsentDeny = () => {
    localStorage.setItem('location-consent', 'false');
    setState((prev: LocationState) => ({ ...prev, hasConsent: false }));
  };

  const refreshLocation = async () => {
    if (!state.hasConsent) return;
    
    setState((prev: LocationState) => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch("/api/location", { 
        method: "GET",
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setState((prev: LocationState) => ({ 
            ...prev, 
            location: data.lastLocation || prev.location,
            isLoading: false 
          }));
        } else {
          throw new Error(data.error || 'Failed to fetch location');
        }
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      setState((prev: LocationState) => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to update location',
        isLoading: false 
      }));
    }
  };

  const handleLocationUpdate = (newLocation: LocationResponse) => {
    setState((prev: LocationState) => ({ 
      ...prev, 
      location: newLocation,
      error: null 
    }));
  };

  const flag = state.location ? getCountryFlag(state.location.country) : "🌍";
  const timestamp = formatTimestamp(state.location?.timestamp);

  return (
    <>
      <MotionParent>
        <MotionChild>
          <div className="font-mono text-sm text-muted-foreground space-y-2">
            {!state.hasConsent && localStorage.getItem('location-consent') !== 'false' && (
              <div className="mb-4 p-3 border rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-xs font-medium">Location Tracking</span>
                </div>
                <p className="text-xs mb-3 opacity-80">
                  Allow location tracking to show your current location on my portfolio?
                </p>
                <div className="flex gap-2">
                  <button 
                    onClick={handleConsentAccept}
                    className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                  >
                    Allow
                  </button>
                  <button 
                    onClick={handleConsentDeny}
                    className="px-3 py-1 text-xs border rounded hover:bg-muted transition-colors"
                  >
                    Deny
                  </button>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <div className="flex-1">
                {state.isLoading ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Updating location...</span>
                  </div>
                ) : state.error ? (
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs">{state.error}</span>
                  </div>
                ) : (
                  <div>
                    <div>
                      Last Visit: {state.location?.city}, {state.location?.country} {flag}
                    </div>
                    {timestamp && (
                      <div className="flex items-center gap-1 mt-1 text-xs opacity-70">
                        <Clock className="w-3 h-3" />
                        <span>{timestamp}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {state.hasConsent && (
                <button
                  onClick={refreshLocation}
                  disabled={state.isLoading}
                  className="ml-auto px-2 py-1 text-xs border rounded hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Refresh location"
                >
                  <RefreshCw className={`w-3 h-3 ${state.isLoading ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>
          </div>
        </MotionChild>
      </MotionParent>
      
      {state.hasConsent && (
        <LocationUpdater 
          onLocationUpdate={handleLocationUpdate}
          onError={(error: string) => setState((prev: LocationState) => ({ ...prev, error }))}
        />
      )}
    </>
  );
};
