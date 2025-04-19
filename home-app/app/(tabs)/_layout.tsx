import { Tabs } from "expo-router";
import React, { useEffect } from "react";
import { Dimensions, Platform, View } from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {Octicons} from "@expo/vector-icons";
const { width, height } = Dimensions.get("window");
import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import * as NavigationBar from 'expo-navigation-bar';
import Feather from '@expo/vector-icons/Feather';
import { StatusBar } from "react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  useEffect(() => {
    const configureNavBar = async () => {
      // Set the behavior to 'immersiveSticky' so it disappears but can reappear with a swipe
      await NavigationBar.setBehaviorAsync('overlay-swipe');

      // Set a semi-transparent background (50% opacity)
      await NavigationBar.setBackgroundColorAsync('rgba(0, 0, 0, 0.5)');

      // Hide the navigation bar initially
      await NavigationBar.setVisibilityAsync('hidden');
    };

    configureNavBar();
  }, []);
  return (
    <>
    <StatusBar backgroundColor={colors.background} />
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
          },
          default: {height:height*0.08},
        }),
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
      }}
    >
      <Tabs.Screen
        name="monitor"
        options={{
          title: "Manual",
          tabBarIcon: ({ color}) => (
            <Feather name="book-open" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color}) => (
            <Feather name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="setting"
        options={{
          title: "Setting",
          tabBarIcon: ({ color}) => (
            <Octicons name="gear" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
    </>
  );
}
