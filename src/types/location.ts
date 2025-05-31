export interface LocationResponse {
  city: string;
  region: string;
  country: string;
  timestamp?: string;
  ip?: string;
}

export interface LocationState {
  location: LocationResponse | null;
  isLoading: boolean;
  error: string | null;
  hasConsent: boolean;
}

// Export as default as well for compatibility
export default LocationResponse;
