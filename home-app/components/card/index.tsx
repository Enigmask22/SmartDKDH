import { View, Text, StyleSheet, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { ReactNode } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Define interfaces for different device types
interface Bulb {
  type: "bulb";
  id: string;
  description: string;
  status: string;
}

interface Fan {
  type: "fan";
  id: string;
  description: string;
  value: number;
}

type Device = Bulb | Fan;

interface CardProps {
  device: Device;
  children?: ReactNode;
}

export default function DeviceCard({ device, children }: CardProps) {
  // Determine if the device is a fan or bulb
  const isFan = device.type === "fan";

  return (
    <View key={device.id} style={styles.deviceCard}>
      <View style={styles.deviceIconContainer}>
        {
          isFan ? (
            <MaterialCommunityIcons
              name="fan"
              size={24}
              color={device.value > 0 ? "#3b82f6" : "#000"}
              style={device.value > 0 ? styles.spinningFan : undefined}
            />) :
            (
              <Ionicons
                // @ts-ignore
                name={isFan ? "fan-outline" : "bulb-outline"}
                size={24}
                color="black"
              />
            )
        }
        {children}
      </View>
      <Text style={styles.deviceName}>{device.id}</Text>
      <Text style={styles.roomName}>{device.description}</Text>
      <View style={styles.statusRow}>
        <Text style={styles.connectionStatus}>Connected</Text>
        {
          isFan ? (
            device.value > 0 ? (
              <Text>{device.value}%</Text>
            ) : (
              <View
                style={[
                  styles.statusIndicator,
                  device.value > 0
                    ? styles.statusIndicatorOn
                    : styles.statusIndicatorOff
                ]}
              />
            )
          ) : (
            <View
              style={[
                styles.statusIndicator,
                device.status === "1"
                  ? styles.statusIndicatorOn
                  : styles.statusIndicatorOff,
              ]}
            />
          )
        }
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  deviceCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    width: "48%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  deviceIconContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  deviceName: {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 4,
  },
  roomName: {
    color: "#666",
    fontSize: 12,
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  connectionStatus: {
    color: "#3b82f6",
    fontSize: 12,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 8,
  },
  statusIndicatorOn: {
    backgroundColor: "#3b82f6",
  },
  statusIndicatorOff: {
    backgroundColor: "#F1EFEC",
  },
  spinningFan: {
    transform: [{ rotate: '0deg' }],
    // Note: In a real app, you would use Animated API to create a rotation animation
  }
});