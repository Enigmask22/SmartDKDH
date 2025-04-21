import { Tabs } from "expo-router";
import React, { useEffect } from "react";
import { Dimensions, Platform, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Octicons } from "@expo/vector-icons";
const { width, height } = Dimensions.get("window");
import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import * as NavigationBar from "expo-navigation-bar";
import Feather from "@expo/vector-icons/Feather";
import { StatusBar } from "react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  useEffect(() => {
    const configureNavBar = async () => {
      // Set the behavior to 'immersiveSticky' so it disappears but can reappear with a swipe
      await NavigationBar.setBehaviorAsync("overlay-swipe");

      // Set a semi-transparent background (50% opacity)
      await NavigationBar.setBackgroundColorAsync("rgba(0, 0, 0, 0.5)");

      // Hide the navigation bar initially
      await NavigationBar.setVisibilityAsync("hidden");
    };

    configureNavBar();
  }, []);
  return (
    <>
      <StatusBar backgroundColor={"#ffff"} translucent={true} />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.tint,
          headerShown: true,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: {
              // Use a transparent background on iOS to show the blur effect
              position: "absolute",
            },
            default: { height: height * 0.08 },
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
            title: "Monitor",
            headerTitle: () => (
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  width: width,
                  marginLeft: -16,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Feather name="book-open" size={30} color="black" />
                  <Text
                    style={{ fontSize: 25, fontFamily: "Poppins-SemiBold" }}
                  >
                    {" "}
                    Data Overview
                  </Text>
                </View>
              </View>
            ),
            headerStyle: {
              backgroundColor: "#ffffff",
              borderBottomLeftRadius: 30,
              borderBottomRightRadius: 30,
              height: height * 0.1,
            },
            tabBarIcon: ({ color }) => (
              <Feather name="book-open" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            headerTitle: () => (
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  width: width,
                  marginLeft: -16,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                  }}
                >
                  <Feather name="home" size={30} color="black" />
                  <Text
                    style={{ fontSize: 25, fontFamily: "Poppins-SemiBold" }}
                  >
                    {" "}
                    Home
                  </Text>
                </View>
              </View>
            ),
            headerStyle: {
              backgroundColor: "#ffffff",
              borderBottomLeftRadius: 30,
              borderBottomRightRadius: 30,
              height: height * 0.1,
            },
            tabBarIcon: ({ color }) => (
              <Feather name="home" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="setting"
          options={{
            title: "Setting",
            headerTitle: () => (
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  width: width,
                  marginLeft: -16,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Feather name="settings" size={30} color="black" />
                  <Text
                    style={{ fontSize: 25, fontFamily: "Poppins-SemiBold" }}
                  >
                    {" "}
                    Setting
                  </Text>
                </View>
              </View>
            ),
            headerStyle: {
              backgroundColor: "#ffffff",
              height: height * 0.1,
            },
            tabBarIcon: ({ color }) => (
              <Feather name="settings" size={24} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
