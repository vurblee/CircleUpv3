import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  Text,
  Animated,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import apiClient from '../api/apiClient';

const { width, height } = Dimensions.get('window');
const EVENT_LIST_HEIGHT = height * 0.4; // Fixed height for the event list

const MapScreen: React.FC = () => {
  const navigation = useNavigation();
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [region, setRegion] = useState({
    latitude: 39.8283, // Center of the US
    longitude: -98.5795,
    latitudeDelta: 30,
    longitudeDelta: 30 * (width / height),
  });
  const [loading, setLoading] = useState(true);
  const [translateY] = useState(new Animated.Value(0)); // Controls sliding position

  // Fetch events from the backend
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/posts?type=event');
      console.log('Fetched Events:', response.data); // Debug log
      const eventsWithCoords = response.data.filter(
        (event: any) => event.latitude && event.longitude
      );
      setEvents(eventsWithCoords);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchEvents();
  }, []);

  // Refetch events when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchEvents();
    }, [])
  );

  // Handle event selection
  const handleEventPress = (event: any) => {
    setSelectedEvent(event);
    setRegion({
      latitude: event.latitude,
      longitude: event.longitude,
      latitudeDelta: 0.0922, // Zoom in closer
      longitudeDelta: 0.0421,
    });
  };

  // Gesture handler for sliding the event list
  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationY } = event.nativeEvent;
      const minTranslateY = 0; // Fully visible
      const maxTranslateY = EVENT_LIST_HEIGHT - 50; // Mostly hidden, leaving a handle

      let newTranslateY = translationY;
      if (newTranslateY < minTranslateY) newTranslateY = minTranslateY;
      if (newTranslateY > maxTranslateY) newTranslateY = maxTranslateY;

      Animated.spring(translateY, {
        toValue: newTranslateY,
        useNativeDriver: true,
      }).start();
    }
  };

  // Render each event in the list
  const renderEventItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity
        style={styles.eventItem}
        onPress={() => handleEventPress(item)}
      >
        <Text style={styles.eventTitle}>{item.title}</Text>
        <Text style={styles.eventDate}>
          {item.event_date ? new Date(item.event_date).toLocaleDateString() : 'Date TBD'}
        </Text>
        <Text style={styles.eventLocation}>
          Location: {item.address || item.location || "Not set"}
        </Text>
        {item.latitude && item.longitude && (
          <Text style={styles.coordinates}>
            {`Lat: ${item.latitude}, Lng: ${item.longitude}`}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
      >
        {events.map((event) => (
          <Marker
            key={event.id}
            coordinate={{
              latitude: event.latitude,
              longitude: event.longitude,
            }}
            title={event.title}
            description={event.location || 'Not set'}
            pinColor={selectedEvent?.id === event.id ? 'red' : 'blue'}
          />
        ))}
      </MapView>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Draggable Event List */}
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
      >
        <Animated.View
          style={[
            styles.eventListContainer,
            {
              transform: [{ translateY: translateY }],
            },
          ]}
        >
          <View style={styles.dragHandle} />
          {loading ? (
            <Text style={styles.loadingText}>Loading events...</Text>
          ) : (
            <FlatList
              data={events}
              renderItem={renderEventItem}
              keyExtractor={(item) => item.id.toString()}
              style={styles.eventList}
              ListEmptyComponent={<Text style={styles.noEventsText}>No events found.</Text>}
            />
          )}
        </Animated.View>
      </PanGestureHandler>
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
  eventListContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: EVENT_LIST_HEIGHT, // Fixed height
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 10,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginVertical: 5,
  },
  eventList: {
    flex: 1,
  },
  eventItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  eventDate: {
    fontSize: 12,
    color: '#666',
  },
  eventLocation: {
    fontSize: 14,
    color: '#333',
  },
  coordinates: {
    fontSize: 12,
    color: '#666961',
    marginTop: 5,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    padding: 20,
  },
  noEventsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    padding: 20,
  },
});

export default MapScreen;