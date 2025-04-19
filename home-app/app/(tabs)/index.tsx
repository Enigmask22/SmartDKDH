import { useState, useEffect } from "react";
import {
  Text,
  Image,
  StyleSheet,
  Platform,
  TouchableOpacity,
  ScrollView,
  Alert,
  View,
  Button,
} from "react-native";
import { Audio } from "expo-av";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useColorScheme } from "@/hooks/useColorScheme";

import { Dimensions } from "react-native";
import { Feather, Octicons } from "@expo/vector-icons";
import { Info } from "@/components/Info";
import { Sensor } from "@/components/Sensor";
import { Devices } from "@/components/Devices";

import { router } from "expo-router";

const { width, height } = Dimensions.get("window");
// API configuration
// const API_BASE_URL = `http://${Constants.expoConfig?.extra?.serverIp}:${Constants.expoConfig?.extra?.apiPort}`;
const API_BASE_URL = `https://smartdkdh.onrender.com`;
export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const [ledDevices, setLedDevices] = useState<string[]>([]);
  const [ledStatuses, setLedStatuses] = useState<Record<string, string>>({});
  const [fanDevices, setFanDevices] = useState<string[]>([]);
  const [fanStatuses, setFanStatuses] = useState<Record<string, string>>({});
  const [fanValues, setFanValues] = useState<Record<string, number>>({});
  const [deviceDescriptions, setDeviceDescriptions] = useState<
    Record<string, string>
  >({});
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [serverIp, setServerIp] = useState(
    API_BASE_URL.replace("http://", "").replace(":8000", "")
  );
  const [userNo, setUserNo] = useState<number | null>(null);

  const logOut = async () => {
    try {
      await AsyncStorage.multiRemove([
        "user_no",
        "user_email",
        "user_password",
      ]);
      router.replace("/login");
    } catch (e) {
      console.error("Lỗi khi đăng xuất:", e);
    }
  };
  // Lấy user_no từ AsyncStorage
  useEffect(() => {
    const getUserNo = async () => {
      try {
        const storedUserNo = await AsyncStorage.getItem("user_no");
        if (storedUserNo) {
          setUserNo(parseInt(storedUserNo));
          console.log("Đã lấy user_no:", storedUserNo);
        } else {
          console.warn("Không tìm thấy user_no trong AsyncStorage");
        }
      } catch (error) {
        console.error("Lỗi khi lấy user_no từ AsyncStorage:", error);
      }
    };

    getUserNo();
  }, []);

  // Fetch LED devices
  useEffect(() => {
    fetchLeds();
  }, [serverIp]);

  // Fetch LED devices
  useEffect(() => {
    fetchFans();
  }, [serverIp]);

  // WebSocket connection
  useEffect(() => {
    // const wsUrl = `ws://${serverIp}:8000/ws`;
    const wsUrl = `wss://smartdkdh.onrender.com/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket Connected");
      setConnectionStatus("Connected");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        //console.log("Received data:", data);
        if (data.led_statuses) {
          setLedStatuses(data.led_statuses);
        }
        if (data.fan_statuses) {
          setFanStatuses(data.fan_statuses);
        }
      } catch (error) {
        console.error("Error parsing WebSocket data:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket Error:", error);
      setConnectionStatus("Error");
    };

    ws.onclose = () => {
      console.log("WebSocket Disconnected");
      setConnectionStatus("Disconnected");
    };

    return () => {
      ws.close();
    };
  }, [serverIp]);

  const fetchLeds = async () => {
    try {
      // const response = await fetch(`http://${serverIp}:8000/led-devices`);
      const response = await fetch(`${API_BASE_URL}/led-devices`);
      const data = await response.json();
      const devices = data.devices;

      setLedDevices(devices.map((d: { id: string }) => d.id));

      // Save descriptions and status for each device
      const descriptions: Record<string, string> = {};
      const initialStatuses: Record<string, string> = {};
      devices.forEach(
        (device: { id: string; description: string; status: string }) => {
          descriptions[device.id] = device.description;
          initialStatuses[device.id] = device.status;
        }
      );

      setDeviceDescriptions(descriptions);
      setLedStatuses(initialStatuses);
    } catch (error) {
      console.error("Error fetching LED devices:", error);
      Alert.alert(
        "Connection Error",
        "Could not connect to the server. Please check your server IP address."
      );
    }
  };

  const fetchFans = async () => {
    try {
      // const response = await fetch(`http://${serverIp}:8000/fan-devices`);
      const response = await fetch(`${API_BASE_URL}/fan-devices`);
      const data = await response.json();
      const devices = data.devices;

      setFanDevices(devices.map((d: { id: string }) => d.id));

      // Save descriptions and values for each device
      const descriptions: Record<string, string> = {};
      const initialValues: Record<string, number> = {};
      devices.forEach(
        (device: { id: string; description: string; value: number }) => {
          descriptions[device.id] = device.description;
          initialValues[device.id] = device.value;
        }
      );

      setDeviceDescriptions(descriptions);
      setFanValues(initialValues);
    } catch (error) {
      console.error("Error fetching Fan devices:", error);
      Alert.alert(
        "Error",
        "Could not connect to the server. Please check your connection."
      );
    }
  };

  const getRunningDeviceNumber = () => {
    let running = 0;
    return getRunningFanNumber() + getRunningLedNumber();
  };

  const getRunningLedNumber = () => {
    let running = 0;
    for (let key in ledStatuses) {
      if (ledStatuses[key] != "0") running++;
    }
    return running;
  };

  const getRunningFanNumber = () => {
    let running = 0;
    for (let key in fanStatuses) {
      if (fanStatuses[key] != "0") running++;
    }
    return running;
  };

  return (
    <View
      style={{
        backgroundColor: "#f2f6fc",
        height: height,
        alignItems: "center",
      }}
    >
      <View style={styles.titleContainer}>
        <View style={styles.title}>
          <Feather name="home" size={30} color="black" />
          <Text style={{ fontSize: 25, fontFamily: "Poppins-SemiBold" }}>
            {" "}
            Home
          </Text>
        </View>
      </View>
      <Info device={getRunningDeviceNumber()} online={userNo != null} />
      <Sensor />
      <Devices
        runningFan={getRunningFanNumber()}
        availFan={fanDevices.length}
        runningLed={getRunningLedNumber()}
        availLed={ledDevices.length}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    backgroundColor: "#f2f6fc",
    height: height * 0.12,
    flexDirection: "column",
    paddingTop: 30,
    alignItems: "center",
    gap: 50,
    marginBottom: 5,
  },
  title: {
    flexDirection: "row",
  },
  titleBox: {
    flexDirection: "row",
    gap: width / 1.5,
  },
  serverConfig: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  ipInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  ledControlsContainer: {
    marginBottom: 16,
  },
  ledItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  ledIndicator: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  ledOn: {
    backgroundColor: "#4CAF50",
  },
  ledOff: {
    backgroundColor: "#666",
  },
  ledStatusText: {
    color: "#fff",
    fontWeight: "bold",
  },
  ledInfo: {
    flex: 1,
  },
  toggleButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  buttonText: {
    color: "#fff",
  },
  voiceControlContainer: {
    alignItems: "center",
    marginVertical: 16,
  },
  micButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  listeningButton: {
    backgroundColor: "#ff4444",
  },
  micButtonText: {
    fontSize: 24,
  },
  voiceHint: {
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 8,
  },
  controlButtonsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  autoButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#2196F3",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  autoButtonActive: {
    backgroundColor: "#FF9800",
  },
  autoButtonText: {
    fontSize: 24,
  },
  disabledButton: {
    backgroundColor: "#cccccc",
    opacity: 0.7,
  },
});
