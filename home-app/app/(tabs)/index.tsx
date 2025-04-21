import { useState, useEffect, useRef } from "react";
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
  StatusBar,
  ActivityIndicator,
  Animated,
  Easing,
  SafeAreaView,

} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useColorScheme } from "@/hooks/useColorScheme";

import { Dimensions } from "react-native";
import { Feather, Octicons, MaterialIcons } from "@expo/vector-icons";
import { Info } from "@/components/Info";
import { Sensor } from "@/components/Sensor";
import { Devices } from "@/components/Devices";

import { router } from "expo-router";

const { width, height } = Dimensions.get("window");
// API configuration
const API_BASE_URL = `https://smartdkdh.onrender.com`;

// Loading component with skeleton effect
const LoadingSkeleton = () => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, []);

  return (
    <View style={styles.loadingContainer}>
      <Animated.View style={[styles.loadingInfo, { opacity }]} />
      <Animated.View style={[styles.loadingSensor, { opacity }]} />
      <Animated.View style={[styles.loadingDevices, { opacity }]} />
    </View>
  );
};

// Error component with retry button
const ErrorView = ({ onRetry }: {
  onRetry: () => void;
}) => {
  return (
    <View style={styles.errorContainer}>
      <MaterialIcons name="error-outline" size={70} color="#f44336" />
      <Text style={styles.errorTitle}>Connection Error</Text>
      <Text style={styles.errorMessage}>
        Unable to connect to the server. Please check your internet connection and try again.
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const [ledDevices, setLedDevices] = useState<string[]>([]);
  const [ledStatuses, setLedStatuses] = useState<Record<string, string>>({});
  const [fanDevices, setFanDevices] = useState<string[]>([]);
  const [fanStatuses, setFanStatuses] = useState<Record<string, string>>({});
  const [fanValues, setFanValues] = useState<Record<string, number>>({});
  const [deviceDescriptions, setDeviceDescriptions] = useState<Record<string, string>>({});
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [serverIp, setServerIp] = useState(
    API_BASE_URL.replace("http://", "").replace(":8000", "")
  );
  const [userNo, setUserNo] = useState<number | null>(null);

  // Add loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Fetch all devices
  useEffect(() => {
    const fetchAllDevices = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch data in parallel
        await Promise.all([fetchLeds(), fetchFans()]);
      } catch (err: any) {
        setError(err.message || "Failed to fetch devices");
        console.error("Error fetching devices:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllDevices();
  }, [serverIp]);

  // WebSocket connection
  useEffect(() => {
    const wsUrl = `wss://smartdkdh.onrender.com/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket Connected");
      setConnectionStatus("Connected");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
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
      const response = await fetch(`${API_BASE_URL}/led-devices`);

      if (!response.ok) {
        throw new Error(`LED API error: ${response.status}`);
      }

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

      setDeviceDescriptions((prev) => ({ ...prev, ...descriptions }));
      setLedStatuses(initialStatuses);
    } catch (error) {
      console.error("Error fetching LED devices:", error);
      throw error;
    }
  };

  const fetchFans = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/fan-devices`);

      if (!response.ok) {
        throw new Error(`Fan API error: ${response.status}`);
      }

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

      setDeviceDescriptions((prev) => ({ ...prev, ...descriptions }));
      setFanValues(initialValues);
    } catch (error) {
      console.error("Error fetching Fan devices:", error);
      throw error;
    }
  };

  const handleRetry = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await Promise.all([fetchLeds(), fetchFans()]);
    } catch (err: any) {
      setError(err.message || "Failed to fetch devices");
    } finally {
      setIsLoading(false);
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

  const renderContent = () => {
    if (isLoading) {
      return <LoadingSkeleton />;
    }

    if (error) {
      return <ErrorView onRetry={handleRetry} />;
    }

    return (
      <>
        <Info device={getRunningDeviceNumber()} online={userNo != null} />
        <Sensor />
        <Devices
          runningFan={getRunningFanNumber()}
          availFan={fanDevices.length}
          runningLed={getRunningLedNumber()}
          availLed={ledDevices.length}
        />
      </>
    );
  };

  return (
    <>
      <StatusBar backgroundColor={'#f2f6fc'} />
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#f2f6fc", paddingTop: 50 }}
    >
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

        {renderContent()}
      </View>
    </>
        <Info device={getRunningDeviceNumber()} online={userNo != null} />
        <Sensor />
        <Devices
          runningFan={getRunningFanNumber()}
          availFan={fanDevices.length}
          runningLed={getRunningLedNumber()}
          availLed={ledDevices.length}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Existing styles...
  titleContainer: {
    backgroundColor: "#f2f6fc",
    height: height * 0.12,
    flexDirection: "column",
    alignItems: "center",
    gap: 50,
    marginBottom: 5,
  },
  title: {
    flexDirection: "row",
    backgroundColor: "#ffff",
    width: width,
    height: height * 0.1,
    // alignItems: "center",
    justifyContent: "center",
    paddingTop: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  titleBox: {
    flexDirection: "row",
    gap: width / 1.5,
  },

  // Loading skeleton styles
  loadingContainer: {
    width: '90%',
    alignItems: "center",
    justifyContent: "center",
  },
  loadingInfo: {
    width: '100%',
    height: 100,
    backgroundColor: '#E0E0E0',
    borderRadius: 15,
    marginBottom: 20,
  },
  loadingSensor: {
    width: '100%',
    height: 150,
    backgroundColor: '#E0E0E0',
    borderRadius: 15,
    marginBottom: 20,
  },
  loadingDevices: {
    width: '100%',
    height: 180,
    backgroundColor: '#E0E0E0',
    borderRadius: 15,
  },

  // Error styles
  errorContainer: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    marginTop: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorTitle: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    color: '#f44336',
    marginTop: 15,
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
  },
  retryButton: {
    backgroundColor: '#3674B5',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
  },

  // Other existing styles...
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
  // ...remaining existing styles
});
