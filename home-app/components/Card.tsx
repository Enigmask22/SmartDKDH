import { View, StyleSheet, Text, Dimensions, TouchableOpacity } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { Link, RelativePathString } from "expo-router";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

interface SummaryCardProps {
  avail: string | number;
  on: string | number;
  type: "fan" | "light" | string | number;
}

export default function DeviceCard({ avail, on, type }: SummaryCardProps) {
  const router = useRouter();
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.iconContainer}>
          {type == "light" ? (
            <Ionicons name="bulb-outline" size={40} color="black" />
          ) : (
            <MaterialCommunityIcons name="fan" size={40} color="black" />
          )}
        </View>
        <TouchableOpacity onPress={() => {
          type == "light" ? router.push("/(list)/light") : router.push("/(list)/fan")
        }}>
          <Feather name="info" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <View style={styles.row}>
        <View style={styles.titleContainer}>
          <Text style={styles.summaryTitle}>
            {type == "light" ? "Smart Light" : "Smart Fan"}
          </Text>
        </View>
        <View style={styles.online}>
          <Text style={{ color: "#2666de", bottom: 2, fontWeight: 500 }}>
            2
          </Text>
        </View>
      </View>
      <View style={styles.statusContainer}>
        <Text style={styles.totalText}>{avail} devices available</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: width * 0.42,
    height: width * 0.42,
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 16,
    margin: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    justifyContent: "space-evenly",
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  online: {
    borderColor: "#2666de",
    height: 20,
    width: 20,
    borderWidth: 2,
    borderRadius: 2,
    alignItems: "center",
  },
  iconContainer: {
    marginRight: 16,
  },
  titleContainer: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  totalText: {
    color: "#666",
    marginTop: 4,
  },
  statusContainer: {
    alignItems: "flex-end",
  },
  statusText: {
    marginVertical: 2,
  },
  statusOn: {
    color: "#3b82f6",
    fontWeight: "500",
  },
  statusOff: {
    color: "#9ca3af",
    fontWeight: "500",
  },
});
