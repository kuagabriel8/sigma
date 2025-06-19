import { StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';


export default function MapScreen() {
  const markers = [
    {
      id: 1,
      title: 'NUS Central Library',
      description: 'Main library of NUS',
      latitude: 1.2966,
      longitude: 103.7764,
    },
    {
      id: 2,
      title: 'UTown',
      description: 'University Town of NUS',
      latitude: 1.3051,
      longitude: 103.7707,
    },
    {
      id: 3,
      title: 'COM1',
      description: 'School of Computing',
      latitude: 1.2946,
      longitude: 103.7739,
    },
  ];

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}  // you can also explicitly set it here
        initialRegion={{
          latitude: 1.2976,
          longitude: 103.7767,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            title={marker.title}
            description={marker.description}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});
