import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Header from "../components/header";

const SupportFAQScreen = () => {
  const navigation = useNavigation();
  const [expandedIndex, setExpandedIndex] = useState(null);

  // FAQ data based on provided screens
  const faqs = [
    {
      question: "How do I sign up for an account?",
      answer:
        "To sign up, go to the Sign Up screen from the app’s welcome page. Enter your username, name, email, and password, then tap 'Sign Up'. You’ll be redirected to the Sign In page after successful registration.",
    },
    {
      question: "What should I do if I forget my password?",
      answer:
        "On the Sign In screen, tap 'Forgot Password?'. Enter your email on the Forgot Password screen and tap 'Send Reset Link'. Check your email for a password reset link to regain access to your account.",
    },
    {
      question: "How do I create an event?",
      answer:
        "Navigate to the Events tab (not shown but assumed from EventDetails). Tap the 'Create Event' button, fill in details like title, date, content, and location, then submit. You can later edit or delete it from the Event Details screen.",
    },
    {
      question: "How can I RSVP to an event?",
      answer:
        "Open an event from the Events or Explore screen, then go to its Event Details page. Tap the 'RSVP' button to request attendance. The event organizer will approve or deny your request, and you’ll see your status under 'RSVP'.",
    },
    {
      question: "How do I manage attendees for my event?",
      answer:
        "On the Event Details screen for an event you created, scroll to the 'Attendees' section. For pending RSVPs, tap 'Approve' or 'Deny'. For approved attendees, tap 'Remove' to revoke their attendance.",
    },
    {
      question: "Can I add photos to an event?",
      answer:
        "Yes, if you’re the event creator, go to the Event Details screen, scroll to 'Event Photos', and tap 'Add Photo'. Select an image from your library, add an optional caption, and upload it. You can also set a photo as the banner or delete it.",
    },
    {
      question: "How do I edit or delete an event?",
      answer:
        "For your events, go to the Event Details screen. Tap the title or content to edit them inline, then save or cancel your changes. To delete, tap 'Delete Event' at the bottom of the details section and confirm.",
    },
    {
      question: "How do I search for events, profiles, or posts?",
      answer:
        "Go to the Explore screen, type your query in the search bar (e.g., event name, username), and press enter. Results will show users, events, or posts. Tap one to view its details—Profile for users, Event Details for events, or Post Screen for posts.",
    },
    {
      question: "How do I edit my profile?",
      answer:
        "Visit your Profile screen, tap 'Edit Profile', and update your name, email, username, bio, interests, or profile picture. Tap 'Save' to apply changes or 'Cancel' to discard them.",
    },
    {
      question: "How can I add friends?",
      answer:
        "On the Friends screen, tap 'Add Friends', enter a username in the search field, and tap 'Send Request'. The user will see your request in their 'Requests' tab.",
    },
    {
      question: "How do I accept or deny friend requests?",
      answer:
        "Go to the Friends screen and switch to the 'Requests' tab. Tap a request to open options, then choose 'Accept' to add them as a friend or 'Deny' to reject the request.",
    },
    {
      question: "Can I share a friend’s profile with someone else?",
      answer:
        "On the Friends screen, tap a friend in the 'Current' tab, select 'Share Profile' from the options, and choose another friend to share with. A link will be generated for them to view the profile.",
    },
    {
      question: "How do I remove a friend?",
      answer:
        "From the Friends screen’s 'Current' tab, tap a friend, then select 'Remove Friend' from the options. Confirm the action to remove them from your friends list.",
    },
    {
      question: "How do I start a chat with a friend?",
      answer:
        "Go to the Messages screen and tap 'Start a Chat'. Search for a friend, tap their name, and you’ll be taken to a Chat Screen to send messages. Alternatively, from the Friends screen, tap a friend and select 'Send Message'.",
    },
    {
      question: "Can I delete or recover conversations?",
      answer:
        "On the Messages screen, tap 'Edit', select conversations, and tap 'Delete' to move them to the 'Deleted' tab. From 'Deleted', select them and tap 'Recover' to restore or 'Delete' again to permanently remove them.",
    },
    {
      question: "How do I view events I’ve visited?",
      answer:
        "On your Profile screen, scroll to the 'Events Visited' section. Past events you’ve attended are listed there and are clickable to view their Event Details.",
    },
    {
      question: "How do I upload photos to my profile?",
      answer:
        "On your Profile screen, scroll to the 'Photos' section and tap 'Add Photo'. Choose an image, add an optional caption, and upload it. You can delete your photos later if needed.",
    },
    {
      question: "What happens if I delete a post?",
      answer:
        "From the Edit Post screen (accessible via your posts), tap 'Delete Post' and confirm. The post or event will be permanently removed, and you’ll return to the previous screen.",
    },
    {
      question: "How do I like or comment on an event?",
      answer:
        "On the Event Details screen, tap the heart icon to like/unlike the event (count updates accordingly). Scroll to 'Add Comment', type your message, and tap 'Post'. You can delete your comments if needed.",
    },
    {
      question: "How do I contact support?",
      answer:
        "Tap the 'Contact Support' button at the top of this FAQ page. It’ll take you to a form (assumed screen) where you can send us a message. We’ll respond via email or in-app notification.",
    },
  ];

  // Toggle FAQ expansion
  const toggleFAQ = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  // Animation for expanding/collapsing
  const fadeAnim = useState(new Animated.Value(0))[0];

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header
        title="Support & FAQ"
        onBackPress={() => navigation.goBack()}
        titleStyle={styles.headerTitle}
      />

      {/* Contact Support Button at Top */}
      <TouchableOpacity
        style={styles.contactButton}
        onPress={() => navigation.navigate("ContactSupport")} // Assumes a ContactSupport screen exists
      >
        <Ionicons name="mail-outline" size={20} color="#fff" />
        <Text style={styles.contactButtonText}>Contact Support</Text>
      </TouchableOpacity>

      {/* FAQ Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {faqs.map((faq, index) => {
            const isExpanded = expandedIndex === index;
            return (
              <View key={index} style={styles.faqItem}>
                <TouchableOpacity
                  style={styles.questionContainer}
                  onPress={() => toggleFAQ(index)}
                >
                  <Text style={styles.question}>{faq.question}</Text>
                  <Ionicons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#0A58CA"
                  />
                </TouchableOpacity>
                {isExpanded && (
                  <Animated.View
                    style={[
                      styles.answerContainer,
                      {
                        height: isExpanded ? "auto" : 0,
                        opacity: isExpanded ? 1 : 0,
                      },
                    ]}
                  >
                    <Text style={styles.answer}>{faq.answer}</Text>
                  </Animated.View>
                )}
              </View>
            );
          })}
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerTitle: {
    marginLeft: -35, // Matches your original adjustment
    fontSize: 22,
    fontFamily: "AirbnbCereal_Md",
    color: "#333",
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0A58CA",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 15,
  },
  contactButtonText: {
    fontSize: 18,
    color: "#fff",
    fontFamily: "AirbnbCereal_Md",
    marginLeft: 10,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  faqItem: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  questionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
  },
  question: {
    fontSize: 18,
    fontFamily: "AirbnbCereal_Md",
    color: "#333",
    flex: 1,
  },
  answerContainer: {
    paddingBottom: 15,
  },
  answer: {
    fontSize: 16,
    fontFamily: "AirbnbCereal_Lt",
    color: "#666",
    lineHeight: 22,
  },
});

export default SupportFAQScreen;