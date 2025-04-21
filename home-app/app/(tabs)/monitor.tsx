import { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  View,
  Dimensions,
  Text,
  Animated,
  ActivityIndicator
} from "react-native";
import Constants from "expo-constants";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useColorScheme } from "@/hooks/useColorScheme";
import { LineChart } from "react-native-chart-kit";
import { ActivityLogScreen } from "@/components/ActivityLog";
import { StatusBar } from "expo-status-bar";
import { Sensor } from "@/components/Sensor";
import { MaterialIcons, Octicons } from "@expo/vector-icons";
const { width, height } = Dimensions.get("window");

// API configuration
const API_BASE_URL = `https://smartdkdh.onrender.com`;

const screenWidth = Dimensions.get("window").width;

export default function MonitorScreen() {
  const colorScheme = useColorScheme();
  const [sensorDevices, setSensorDevices] = useState<string[]>([]);
  const [sensorValues, setSensorValues] = useState<Record<string, string>>({});
  const [deviceDescriptions, setDeviceDescriptions] = useState<Record<string, string>>({});
  const [deviceUnits, setDeviceUnits] = useState<Record<string, string>>({});
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [serverIp, setServerIp] = useState(API_BASE_URL.replace("http://", "").replace(":8000", ""));

  // Replace dropdown state with activeTab state
  const [activeTab, setActiveTab] = useState(0); // 0 = Chart, 1 = Activity Log
  const [isLoading, setIsLoading] = useState(false);

  // Animated values for the tab indicator
  const tabIndicatorAnim = useRef(new Animated.Value(0)).current;

  // Lưu trữ dữ liệu lịch sử cho biểu đồ
  const [historyData, setHistoryData] = useState<Record<string, number[]>>({
    "dadn-temp": Array(12).fill(0),
    "dadn-light": Array(12).fill(0),
    "dadn-humi": Array(12).fill(0),
  });

  // Fetch Sensor devices
  useEffect(() => {
    fetchDevices();
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
        if (data.sensor_values) {
          setSensorValues(data.sensor_values);

          // Cập nhật dữ liệu lịch sử cho biểu đồ
          setHistoryData((prevData) => {
            const newData = { ...prevData };

            Object.entries(data.sensor_values).forEach(([id, value]) => {
              if (newData[id]) {
                // Thêm giá trị mới và giữ 12 giá trị gần nhất (1 giờ)
                newData[id] = [
                  ...newData[id].slice(1),
                  parseFloat(value as string) || 0,
                ];
              }
            });

            return newData;
          });
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

  const fetchDevices = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sensor-devices`);
      const data = await response.json();
      const devices = data.devices;

      setSensorDevices(devices.map((d: { id: string }) => d.id));

      // Save descriptions and values for each device
      const descriptions: Record<string, string> = {};
      const units: Record<string, string> = {};
      const initialValues: Record<string, string> = {};

      devices.forEach(
        (device: {
          id: string;
          description: string;
          value: number;
          unit: string;
        }) => {
          descriptions[device.id] = device.description;
          units[device.id] = device.unit;
          initialValues[device.id] = device.value.toString();
        }
      );

      setDeviceDescriptions(descriptions);
      setDeviceUnits(units);
      setSensorValues(initialValues);
    } catch (error) {
      console.error("Error fetching Sensor devices:", error);
      Alert.alert(
        "Error",
        "Could not connect to the server. Please check your connection."
      );
    }
  };

  const getSensorColor = (sensorId: string) => {
    const colors: Record<string, string> = {
      "dadn-temp": "#FF5733", // Đỏ cho nhiệt độ
      "dadn-light": "#FFC300", // Vàng cho ánh sáng
      "dadn-humi": "#33A1FF", // Xanh dương cho độ ẩm
    };
    return colors[sensorId] || "#4CAF50";
  };

  // Tab switching function with loading state
  const switchTab = (index: number) => {
    if (index === activeTab) return;

    setIsLoading(true);

    // Animate the tab indicator
    Animated.timing(tabIndicatorAnim, {
      toValue: index,
      duration: 250,
      useNativeDriver: false,
    }).start();

    // Simulate data loading with a small delay
    setTimeout(() => {
      setActiveTab(index);
      setIsLoading(false);
    }, 300);
  };

  // Calculate indicator position based on active tab
  const indicatorPosition = tabIndicatorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width / 2]
  });

  // Sensor Data Chart Component
  const DataChartComponent = (
    <ScrollView style={styles.contentContainer}>
      <ThemedView style={styles.dataChart}>
        <Sensor />
        {sensorDevices.map((deviceId) => (
          <ThemedView key={`chart-${deviceId}`} style={styles.chartContainer}>
            <ThemedText type="defaultSemiBold">
              {deviceDescriptions[deviceId]}
            </ThemedText>
            <LineChart
              data={{
                labels: [
                  "60p", "55p", "50p", "45p", "40p", "35p",
                  "30p", "25p", "20p", "15p", "10p", "5p",
                ],
                datasets: [
                  {
                    data: historyData[deviceId] || Array(12).fill(0),
                    color: () => getSensorColor(deviceId),
                    strokeWidth: 2,
                  },
                ],
              }}
              width={screenWidth - 55}
              height={200}
              yAxisLabel=""
              yAxisSuffix={deviceUnits[deviceId] || ""}
              yAxisInterval={1}
              chartConfig={{
                backgroundColor: getSensorColor(deviceId),
                backgroundGradientFrom:
                  colorScheme === "dark" ? "#2c2c2c" : "#ffffff",
                backgroundGradientTo:
                  colorScheme === "dark" ? "#1c1c1c" : "#f8f8f8",
                decimalPlaces: 1,
                color: () => getSensorColor(deviceId),
                labelColor: () =>
                  colorScheme === "dark" ? "#ffffff" : "#333333",
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: "4",
                  strokeWidth: "1",
                  stroke: getSensorColor(deviceId),
                },
                propsForLabels: {
                  fontSize: 10,
                },
              }}
              fromZero={false}
              segments={4}
              formatYLabel={(value) => `${parseFloat(value).toFixed(1)}`}
              bezier
              style={{
                ...styles.chart,
                marginLeft: 10,
              }}
              withInnerLines={false}
              withOuterLines={false}
              withVerticalLines={false}
              withHorizontalLines={true}
              withVerticalLabels={true}
              withHorizontalLabels={true}
              withShadow={false}
            />
          </ThemedView>
        ))}
      </ThemedView>
    </ScrollView>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f2f6fc" }}>
      <StatusBar backgroundColor="#f2f6fc" />
      <View style={{ flexDirection: "column", paddingTop: height * 0.06, height: height, backgroundColor: '#f2f6fc' }}>
        <View style={styles.titleContainer}>
          <View style={styles.title}>
            <Octicons name="gear" size={30} color="black" />
            <ThemedText type="title" style={{ fontSize: 25 }}> Data Overview</ThemedText>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => switchTab(0)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.tabButtonText,
              activeTab === 0 && styles.activeTabText
            ]}>
              Sensor Charts
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => switchTab(1)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.tabButtonText,
              activeTab === 1 && styles.activeTabText
            ]}>
              Activity Log
            </Text>
          </TouchableOpacity>

          {/* Animated Tab Indicator */}
          <Animated.View
            style={[
              styles.tabIndicator,
              { transform: [{ translateX: indicatorPosition }] }
            ]}
          />
        </View>

        {/* Content Area */}
        <View style={styles.contentWrapper}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2666de" />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : (
            activeTab === 0 ? DataChartComponent : <ActivityLogScreen />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    height: height * 0.06,
    alignItems: "center",
    gap: 50,
    marginBottom: 10,
  },
  title: {
    flexDirection: 'row',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
    backgroundColor: '#f2f6fc',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabButtonText: {
    fontSize: 16,
    color: '#6c757d',
  },
  activeTabText: {
    color: '#2666de',
    fontWeight: 'bold',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: width / 2,
    height: 4,
    backgroundColor: '#2666de',
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: '#f2f6fc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6c757d',
  },
  contentContainer: {
    flex: 1,
  },
  dataChart: {
    backgroundColor: '#f2f6fc',
  },
  chartContainer: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    alignSelf: "center",
    width: "90%",
    overflow: "hidden",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
    alignSelf: "center",
    marginRight: 10,
  },
});