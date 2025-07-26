import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';

interface SimpleMapViewProps {
  latitude: number;
  longitude: number;
  title: string;
}

const SimpleMapView: React.FC<SimpleMapViewProps> = ({ latitude, longitude, title }) => {
  const { width } = Dimensions.get('window');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { margin: 0; padding: 0; }
        #map { width: 100%; height: 200px; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        const map = L.map('map').setView([${latitude}, ${longitude}], 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        
        L.marker([${latitude}, ${longitude}])
          .addTo(map)
          .bindPopup('${title}')
          .openPopup();
      </script>
    </body>
    </html>
  `;

  return (
    <View style={[styles.container, { width }]}>
      <WebView
        source={{ html: htmlContent }}
        style={styles.map}
        scrollEnabled={false}
        zoomEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 8,
  },
  map: {
    flex: 1,
  },
});

export default SimpleMapView; 