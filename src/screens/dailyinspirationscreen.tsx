import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import Header from "../components/header"; // Your provided header component

// Sample Bible scriptures (you can expand this list)
const scriptures = [
  {
    id: "1",
    text: "For I know the plans I have for you, declares the Lord... - Jeremiah 29:11",
    fullText:
      "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.",
  },
  {
    id: "2",
    text: "I can do all things through Christ who strengthens me - Philippians 4:13",
    fullText:
      "I can do all things through Christ who strengthens me.",
  },
  {
    id: "3",
    text: "The Lord is my shepherd; I shall not want - Psalm 23:1",
    fullText:
      "The Lord is my shepherd; I shall not want. He makes me lie down in green pastures.",
  },
  // Add more scriptures as needed
];

const DailyInspirationScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("Today");
  const [favorites, setFavorites] = useState([]);
  const [pastScriptures, setPastScriptures] = useState([]);
  const [todayScripture, setTodayScripture] = useState(null);

  // Load saved data and set daily scripture
  useEffect(() => {
    loadSavedData();
    setDailyScripture();
  }, []);

  const loadSavedData = async () => {
    try {
      const savedFavorites = await AsyncStorage.getItem("favorites");
      const savedPast = await AsyncStorage.getItem("pastScriptures");
      if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
      if (savedPast) setPastScriptures(JSON.parse(savedPast));
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const saveData = async (key, data) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data)); // Fixed JSON.stringify
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const setDailyScripture = async () => {
    const today = new Date().toDateString();
    const lastSetDate = await AsyncStorage.getItem("lastSetDate");

    if (lastSetDate !== today) {
      const randomScripture =
        scriptures[Math.floor(Math.random() * scriptures.length)];
      setTodayScripture(randomScripture);
      setPastScriptures((prev) => [
        { ...randomScripture, date: today },
        ...prev,
      ]);
      await AsyncStorage.setItem("lastSetDate", today);
      saveData("pastScriptures", [
        { ...randomScripture, date: today },
        ...pastScriptures,
      ]);
    } else {
      const savedToday = pastScriptures.find((s) => s.date === today);
      setTodayScripture(savedToday || scriptures[0]);
    }
  };

  const toggleFavorite = async (scripture) => {
    let updatedFavorites;
    if (favorites.some((fav) => fav.id === scripture.id)) {
      updatedFavorites = favorites.filter((fav) => fav.id !== scripture.id);
    } else {
      updatedFavorites = [...favorites, { ...scripture, favoritedDate: new Date().toDateString() }];
    }
    setFavorites(updatedFavorites);
    await AsyncStorage.setItem("favorites", JSON.stringify(updatedFavorites));
  };

  const shareScripture = async (scripture) => {
    try {
      await Share.share({
        message: `${scripture.text}\n\nRead more in the Daily Inspiration app!`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const renderScripture = ({ item }) => (
    <View style={styles.scriptureCard}>
      <Text style={styles.scriptureText}>{item.text}</Text>
      <Text style={styles.dateText}>
        {item.date || item.favoritedDate || new Date().toDateString()}
      </Text>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => toggleFavorite(item)}>
          <Ionicons
            name={favorites.some((fav) => fav.id === item.id) ? "heart" : "heart-outline"}
            size={24}
            color={favorites.some((fav) => fav.id === item.id) ? "red" : "black"}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => shareScripture(item)}>
          <Ionicons name="share-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.fullTextButton}
        onPress={() => alert(item.fullText)} // Replace with modal or navigation
      >
        <Text style={styles.fullTextButtonText}>Read Full Scripture</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "Today":
        return todayScripture ? (
          <View style={styles.todayContainer}>
            {renderScripture({ item: todayScripture })}
          </View>
        ) : (
          <Text>Loading...</Text>
        );
      case "Favorites":
        return (
          <FlatList
            data={favorites}
            renderItem={renderScripture}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={<Text>No favorites yet</Text>}
          />
        );
      case "Past":
        return (
          <FlatList
            data={pastScriptures}
            renderItem={renderScripture}
            keyExtractor={(item) => `${item.id}-${item.date}`}
            ListEmptyComponent={<Text>No past scriptures yet</Text>}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Daily Inspiration"
        showBackButton
        onBackPress={() => navigation.goBack()} // Add back button functionality
        titleStyle={{ paddingLeft: 10 }} // Adjust padding as needed
      />
      <View style={styles.tabContainer}>
        {["Today", "Favorites", "Past"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {renderTabContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#007AFF",
  },
  tabText: {
    fontSize: 16,
    color: "#666",
  },
  activeTabText: {
    color: "#007AFF",
    fontWeight: "bold",
  },
  todayContainer: {
    padding: 20,
  },
  scriptureCard: {
    backgroundColor: "#fff",
    padding: 20,
    marginVertical: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scriptureText: {
    fontSize: 18,
    marginBottom: 10,
  },
  dateText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 20,
  },
  fullTextButton: {
    marginTop: 10,
    alignItems: "center",
  },
  fullTextButtonText: {
    color: "#007AFF",
    fontSize: 16,
  },
});

export default DailyInspirationScreen;