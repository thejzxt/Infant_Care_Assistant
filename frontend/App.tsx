import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  Platform,
  PermissionsAndroid,
  Modal,
  View,
  Text,
  TouchableOpacity,
  Vibration,
} from "react-native";

import notifee, {
  AndroidImportance,
  EventType,
  TriggerType,
} from "@notifee/react-native";

import SplashScreen from './src/screens/SplashScreen';
import SignupScreen from './src/screens/SignupScreen';
import LoginScreen from './src/screens/LoginScreen';
import AddInfantScreen from './src/screens/AddInfantScreen';
import HomeDashboard from './src/screens/HomeDashboard';
import ProfileScreen from './src/screens/ProfileScreen';
import EmergencySupportScreen from './src/screens/EmergencySupportScreen';

import NearbyHospitalsScreen from './src/screens/NearbyHospitalsScreen';
import RecordingScreen from './src/screens/RecordingScreen';

import cryLoadingScreen from './src/screens/cryLoadingScreen';
import CryResultScreen from './src/screens/CryResultScreen';
import CryQuestionnaireScreen from './src/screens/questionareScreen';
import FinalResultScreen from './src/screens/FinalResultScreen';
import CryHistoryScreen from './src/screens/CryHistoryScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import ChatbotScreen from "./src/screens/ChatbotScreen";
import FeedingDashboardScreen from "./src/screens/FeedingDashboardScreen";

import EmergencyContactsScreen from "./src/screens/EmergencyContactsScreen";

const Stack = createNativeStackNavigator();

export default function App() {

  const [alarmVisible, setAlarmVisible] = useState(false);
  const [alarmTitle, setAlarmTitle] = useState("");

  useEffect(() => {

    async function setup() {

      if (Platform.OS === "android") {
        if (Platform.Version >= 33) {
          await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
          );
        }
      }

      await notifee.createChannel({
        id: "feeding-alarm",
        name: "Feeding Alarm",
        importance: AndroidImportance.HIGH,
        sound: "default",
        vibration: true,
      });

      console.log("Alarm channel ready");
    }

    setup();

    const unsubscribe = notifee.onForegroundEvent(
      ({ type, detail }) => {

        if (type === EventType.DELIVERED) {

          const title = detail.notification?.title || "";

          if (title.includes("Feeding Time")) {

            setAlarmTitle(detail.notification?.body || "Feeding Time");
            setAlarmVisible(true);

            Vibration.vibrate([500, 500], true);
          }
        }
      }
    );

    notifee.onBackgroundEvent(async ({ type, detail }) => {

      if (type === EventType.PRESS) {

        const title = detail.notification?.title || "";

        if (title.includes("Feeding Time")) {

          setAlarmTitle(detail.notification?.body || "Feeding Time");
          setAlarmVisible(true);

          Vibration.vibrate([500, 500], true);
        }
      }
    });

    return unsubscribe;

  }, []);

  const stopAlarm = () => {
    Vibration.cancel();
    setAlarmVisible(false);
  };

  const snoozeAlarm = async () => {

    Vibration.cancel();
    setAlarmVisible(false);

    const snoozeTime = Date.now() + 5 * 60 * 1000;

    await notifee.createTriggerNotification(
      {
        id: "snooze-alarm",
        title: "Feeding Time ⏰",
        body: alarmTitle,
        android: {
          channelId: "feeding-alarm",
          importance: AndroidImportance.HIGH,
        },
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: snoozeTime,
        alarmManager: { allowWhileIdle: true },
      }
    );
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false }}
      >

        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="AddInfant" component={AddInfantScreen} />

        <Stack.Screen name="HomeDashboard" component={HomeDashboard} />

        <Stack.Screen name="Profile" component={ProfileScreen} />

        <Stack.Screen name="EmergencySupport" component={EmergencySupportScreen} />

        <Stack.Screen name="NearbyHospitals" component={NearbyHospitalsScreen} />
        <Stack.Screen name="RecordingScreen" component={RecordingScreen} />
        <Stack.Screen name="CryLoading" component={cryLoadingScreen} />
        <Stack.Screen name="CryResult" component={CryResultScreen} />
        <Stack.Screen name="questionareScreen" component={CryQuestionnaireScreen} />
        <Stack.Screen name="FinalResult" component={FinalResultScreen} />
        <Stack.Screen name="CryHistory" component={CryHistoryScreen}/>
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen}/>
        <Stack.Screen name="Chatbot" component={ChatbotScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="EmergencyContacts" component={EmergencyContactsScreen} />
        <Stack.Screen name="FeedingDashboardScreen" component={FeedingDashboardScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}