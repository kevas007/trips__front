import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Trip } from '../../types/trip';
import OpenStreetMap from './OpenStreetMap';

interface TripMapProps {
  trip: Trip;
  onLocationPress?: (location: string) => void;
}

const TripMap: React.FC<TripMapProps> = ({ trip, onLocationPress }) => {
  // Coordonnées par défaut (Paris)
  const defaultCoords = {
    latitude: 48.8566,
    longitude: 2.3522,
  };

  const handlePress = () => {
    if (onLocationPress) {
      onLocationPress(trip.location);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <OpenStreetMap
        latitude={defaultCoords.latitude}
        longitude={defaultCoords.longitude}
        zoom={13}
        title={trip.location}
        description={trip.description}
      />
    </TouchableOpacity>
  );
};

export default TripMap; 