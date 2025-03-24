import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

// Set your Mapbox token
MapboxGL.setAccessToken('pk.eyJ1IjoidnVyYmxlZSIsImEiOiJjbTczbHY3bWgwMHFtMmlxMWFpaGhmOGQ5In0.E3W2XOOkTqA6Eqimpd7UUA');
MapboxGL.setTelemetryEnabled(false);

const MapScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <MapboxGL.MapView style={styles.map}>
        <MapboxGL.Camera zoomLevel={3} centerCoordinate={[-98.5795, 39.8283]} />
        {/* Add additional markers here if needed */}
      </MapboxGL.MapView>
      
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: '#668CFF',
    padding: 10,
    borderRadius: 20,
  },
});

export default MapScreen;
