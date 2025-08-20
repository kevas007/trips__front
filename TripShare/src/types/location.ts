export interface Location {
  name: string;
  address: string;
  city: string;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  googlePlaceId?: string;
  foursquareId?: string;
  timezone?: string;
  photos?: string[];
} 