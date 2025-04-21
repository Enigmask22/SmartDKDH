import { Stack } from "expo-router";
import React from "react";
import { StatusBar, View, Text, Dimensions, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  headerStyle: {
    backgroundColor: "#ffffff",
    height: height * 0.1,
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    width: width * 0.7,
    marginLeft: -16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  titleText: {
    fontSize: 25,
    fontFamily: "Poppins-SemiBold",
  },
});

export default function ListLayout() {
  return (
    <>
      <StatusBar backgroundColor={"#ffff"} translucent={true} />
      <Stack
        screenOptions={{
          headerShown: true,
        }}
      >
        <Stack.Screen
          name="fanDetails"
          options={{
            title: "Smart Details",
            headerTitle: () => (
              <View style={styles.titleContainer}>
                <View style={styles.titleRow}>
                  <Text style={styles.titleText}> Smart Details</Text>
                </View>
              </View>
            ),
            headerStyle: styles.headerStyle,
          }}
        />
        <Stack.Screen
          name="fan"
          options={{
            title: "Smart Fan",
            headerTitle: () => (
              <View style={styles.titleContainer}>
                <View style={styles.titleRow}>
                  <Text style={styles.titleText}> Smart Fan</Text>
                </View>
              </View>
            ),
            headerStyle: styles.headerStyle,
          }}
        />
        <Stack.Screen
          name="light"
          options={{
            title: "Smart Light",
            headerTitle: () => (
              <View style={styles.titleContainer}>
                <View style={styles.titleRow}>
                  <Text style={styles.titleText}> Smart Light</Text>
                </View>
              </View>
            ),
            headerStyle: styles.headerStyle,
          }}
        />
      </Stack>
    </>
  );
}
