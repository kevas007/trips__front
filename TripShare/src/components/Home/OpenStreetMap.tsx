import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

interface OpenStreetMapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  title?: string;
  description?: string;
  fullScreen?: boolean;
}

const OpenStreetMap: React.FC<OpenStreetMapProps> = ({
  latitude,
  longitude,
  zoom = 13,
  title = '',
  description = '',
  fullScreen = false,
}) => {
  // HTML pour afficher la carte OpenStreetMap
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
        <style>
          body { margin: 0; padding: 0; }
          #map { height: 100vh; width: 100vw; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const map = L.map('map').setView([${latitude}, ${longitude}], ${zoom});
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);
          
          const marker = L.marker([${latitude}, ${longitude}])
            .addTo(map)
            .bindPopup("${title}<br>${description}");
        </script>
      </body>
    </html>
  `;

  return (
    <View style={fullScreen ? styles.fullScreenContainer : styles.container}>
      <WebView
        source={{ html }}
        style={styles.webview}
        scrollEnabled={false}
        bounces={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 200,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 10,
  },
  fullScreenContainer: {
    flex: 1,
    width: '100%',
    borderRadius: 0,
    overflow: 'hidden',
    marginVertical: 0,
  },
  webview: {
    flex: 1,
  },
});

export default OpenStreetMap; 