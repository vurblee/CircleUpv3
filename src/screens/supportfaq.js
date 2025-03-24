import React from "react";
<<<<<<< HEAD
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Header from "../components/header";
=======
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b

const SupportFAQScreen = () => {
  const navigation = useNavigation();

  const faqs = [
    { question: "How do I create an event?", answer: "To create an event, navigate to the Events tab and tap the 'Create Event' button. Fill in the required details and submit." },
    { question: "How can I edit my profile?", answer: "Go to your profile page, tap on 'Edit Profile', make your changes, and save them." },
    { question: "How do I RSVP to an event?", answer: "Tap on an event you want to attend and click the 'RSVP' button. You will receive a confirmation notification." },
    { question: "What if I forget my password?", answer: "On the Sign-in screen, tap 'Forgot Password' and follow the steps to reset your password." },
    { question: "How do I contact support?", answer: "Scroll down to the bottom of this page and tap 'Contact Support' to send us a message." },
  ];

  return (
<<<<<<< HEAD
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header
        title="Support & FAQ"
        onBackPress={() => navigation.goBack()}
        titleStyle={styles.headerTitle} // pass your local style here
      />
      <ScrollView style={{ flex: 1, padding: 20, marginTop: 20 }}>
        {faqs.map((faq, index) => (
          <View key={index} style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 18, fontWeight: "600" }}>{faq.question}</Text>
            <Text style={{ fontSize: 16, color: "#666", marginTop: 5 }}>{faq.answer}</Text>
          </View>
        ))}
        <TouchableOpacity
          onPress={() => navigation.navigate("ContactSupport")}
          style={{ marginTop: 20, padding: 15, backgroundColor: "#007AFF", borderRadius: 10, alignItems: "center" }}
        >
          <Text style={{ fontSize: 18, color: "#fff", fontWeight: "bold" }}>Contact Support</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  headerTitle: {
    marginLeft: -35, // Adjust this value to move the title further left
  },
});

=======
    <ScrollView style={{ flex: 1, padding: 20, backgroundColor: "#fff" }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>Support & FAQ</Text>
      
      {faqs.map((faq, index) => (
        <View key={index} style={{ marginBottom: 15 }}>
          <Text style={{ fontSize: 18, fontWeight: "600" }}>{faq.question}</Text>
          <Text style={{ fontSize: 16, color: "#666", marginTop: 5 }}>{faq.answer}</Text>
        </View>
      ))}
      
      <TouchableOpacity
        onPress={() => navigation.navigate("ContactSupport")}
        style={{ marginTop: 20, padding: 15, backgroundColor: "#007AFF", borderRadius: 10, alignItems: "center" }}>
        <Text style={{ fontSize: 18, color: "#fff", fontWeight: "bold" }}>Contact Support</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
export default SupportFAQScreen;
