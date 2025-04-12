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
import Settings from "./src/screens/settings";
import SupportFAQScreen from "./src/screens/supportfaq";
import Header from "./src/components/header";
import apiClient from "./src/api/apiClient";
import Map from "./src/screens/map"; // Placeholder for the map screen
import DailyInspirationScreen from "./src/screens/dailyinspirationscreen";
import CommunitiesScreen from "./src/screens/CommunitiesScreen";

import { SocketProvider } from "./src/providers/socketprovider";
import { ThemeProvider } from "./src/providers/ThemeContext";
import { NotificationProvider } from "./src/contexts/NotificationContext"; 
import NotificationBanner from "./src/components/NotificationBanner"; 

import { SOCKET_SERVER_URL } from "./src/utils/apiConfig";

const Stack = createStackNavigator();

export default function App() {
  const [isAppReady, setIsAppReady] = React.useState(false);

  React.useEffect(() => {
    // Simulate app initialization (e.g., loading fonts, fetching data)
    const initializeApp = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate a delay
      setIsAppReady(true);
    };

    initializeApp();
  }, []);

  if (!isAppReady) {
    return null; // Render nothing or a splash screen while initializing
  }

  return (
    <SocketProvider socketUrl={SOCKET_SERVER_URL}>
      <ThemeProvider>
        <NotificationProvider>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
              {/* Screens */}
              <Stack.Screen name="Splash" component={SplashScreen} />
              <Stack.Screen name="Onboarding1" component={Onboarding1} />
              <Stack.Screen name="Onboarding2" component={Onboarding2} />
              <Stack.Screen name="Onboarding3" component={Onboarding3} />
              <Stack.Screen name="SignIn" component={SignIn} />
              <Stack.Screen name="SignUp" component={SignUp} />
              <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
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
              <Stack.Screen name="Settings" component={Settings} />
              <Stack.Screen name="SupportFAQ" component={SupportFAQScreen} />
              <Stack.Screen name="DailyInspirationScreen" component={DailyInspirationScreen} />
              <Stack.Screen name="Map" component={Map} />
              <Stack.Screen name="CommunitiesScreen" component={CommunitiesScreen} />
            </Stack.Navigator>
          </NavigationContainer>
          <NotificationBanner />
        </NotificationProvider>
      </ThemeProvider>
    </SocketProvider>
  );
}