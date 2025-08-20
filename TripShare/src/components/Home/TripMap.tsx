import React from 'react';
import { View, StyleSheet } from 'react-native';
import SimpleMapView from '../places/SimpleMapView';

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
      <SimpleMapView
        latitude={latitude}
        longitude={longitude}
        title={title}
      />
    </TouchableOpacity>
  );
};

export default TripMap; 