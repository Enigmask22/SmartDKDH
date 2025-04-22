import { Stack } from "expo-router";
import React, { useState, useEffect } from "react";
import { StatusBar, View, Text, Dimensions, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  subtitleText: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Poppins-Regular",
    marginTop: -5,
  },
});

// Component riêng cho FanDetailsHeader
function FanDetailsHeader() {
  const [fanId, setFanId] = useState<string | null>(null);

  // Lắng nghe sự thay đổi từ AsyncStorage
  useEffect(() => {
    const checkFanInfo = async () => {
      try {
        const id = await AsyncStorage.getItem('current_fan_id');
        if (id) {
          setFanId(id);
        }
      } catch (error) {
        console.error('Error reading fan info from AsyncStorage:', error);
      }
    };

    // Kiểm tra ngay khi component mount
    checkFanInfo();

    // Thiết lập interval để cập nhật header nếu có thay đổi
    const interval = setInterval(checkFanInfo, 500);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <View style={styles.titleContainer}>
      <View style={styles.titleRow}>
        <Text style={styles.titleText}>Fan Details</Text>
      </View>
      {fanId && (
        <Text style={styles.subtitleText}>ID: {fanId}</Text>
      )}
    </View>
  );
}

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
            title: "Fan Details",
            headerTitle: () => <FanDetailsHeader />,
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
