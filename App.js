import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// Importing Screens
import SplashScreen from "./src/screens/SplashScreen";
import Onboarding1 from "./src/screens/Onboarding1";
import Onboarding2 from "./src/screens/Onboarding2";
import Onboarding3 from "./src/screens/Onboarding3";
import SignIn from "./src/screens/signin";
import SignUp from "./src/screens/sign-up";
import ForgotPassword from "./src/screens/forgot-password";
import Home from "./src/screens/home";
import Events from "./src/screens/events";
import Messages from "./src/screens/messages";
import Profile from "./src/screens/profile";
import Explore from "./src/screens/explore";
import EventDetails from "./src/screens/event-details";
import NotificationsScreen from "./src/screens/notificationscreen";
import ChatScreen from "./src/screens/chatscreen";
import FriendsScreen from "./src/screens/friendscreen";
import PostScreen from "./src/screens/postscreen";
import Settings from "./src/screens/settings"; // Ensure this file exists and returns a valid component
import SupportFAQScreen from "./src/screens/supportfaq"; // Added Support & FAQ Screen
<<<<<<< HEAD
import Header from "./src/components/header";
=======

>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
// Import the SocketProvider and ThemeProvider from your providers folder
import { SocketProvider } from "./src/providers/socketprovider";
import { ThemeProvider } from "./src/providers/ThemeContext";

const Stack = createStackNavigator();

export default function App() {
  return (
    <SocketProvider>
      <ThemeProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
            {/* Splash & Onboarding Screens */}
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Onboarding1" component={Onboarding1} />
            <Stack.Screen name="Onboarding2" component={Onboarding2} />
            <Stack.Screen name="Onboarding3" component={Onboarding3} />

            {/* Authentication Screens */}
            <Stack.Screen name="SignIn" component={SignIn} />
            <Stack.Screen name="SignUp" component={SignUp} />
            <Stack.Screen name="ForgotPassword" component={ForgotPassword} />

            {/* Main Home Screens */}
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="Events" component={Events} />
            <Stack.Screen name="Messages" component={Messages} />
            <Stack.Screen name="Profile" component={Profile} />
            <Stack.Screen name="Explore" component={Explore} />
            <Stack.Screen name="EventDetails" component={EventDetails} />
            <Stack.Screen name="NotificationsScreen" component={NotificationsScreen} />
            <Stack.Screen name="ChatScreen" component={ChatScreen} />
            <Stack.Screen name="FriendsScreen" component={FriendsScreen} />
            <Stack.Screen name="PostScreen" component={PostScreen} />
            <Stack.Screen name="Settings" component={Settings} />{/* Added Settings Screen */}
            <Stack.Screen name="SupportFAQ" component={SupportFAQScreen} />{/* Added Support & FAQ Screen */}
<<<<<<< HEAD
            <Stack.Screen name="Header" component={Header} />
=======
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
            {/* MapScreen will be added when the map feature is implemented */}
            {/* <Stack.Screen name="MapScreen" component={MapScreen} /> */}
          </Stack.Navigator>
        </NavigationContainer>
      </ThemeProvider>
    </SocketProvider>
  );
}
