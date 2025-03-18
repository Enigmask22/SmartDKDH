import { useState, useEffect } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  View,
  Dimensions,
} from "react-native";
import Constants from "expo-constants";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useColorScheme } from "@/hooks/useColorScheme";
import { LineChart } from "react-native-chart-kit";

// API configuration
const API_BASE_URL = `http://${Constants.expoConfig?.extra?.serverIp}:${Constants.expoConfig?.extra?.apiPort}`;
const screenWidth = Dimensions.get("window").width;

export default function MonitorScreen() {
  const colorScheme = useColorScheme();
  const [sensorDevices, setSensorDevices] = useState<string[]>([]);
  const [sensorValues, setSensorValues] = useState<Record<string, string>>({});
  const [deviceDescriptions, setDeviceDescriptions] = useState<
    Record<string, string>
  >({});
  const [deviceUnits, setDeviceUnits] = useState<Record<string, string>>({});
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [serverIp, setServerIp] = useState(
    API_BASE_URL.replace("http://", "").replace(":8000", "")
  );

  // Lưu trữ dữ liệu lịch sử cho biểu đồ - tăng số lượng điểm dữ liệu
  const [historyData, setHistoryData] = useState<Record<string, number[]>>({
    "dadn-temp": Array(12).fill(0), // 12 điểm dữ liệu cho 1 giờ (mỗi 5 phút)
    "dadn-light": Array(12).fill(0),
    "dadn-humi": Array(12).fill(0),
  });

  // Fetch Sensor devices
  useEffect(() => {
    fetchDevices();
  }, [serverIp]);

  // WebSocket connection
  useEffect(() => {
    const wsUrl = `ws://${serverIp}:8000/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket Connected");
      setConnectionStatus("Connected");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received sensor data:", data);
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
      const response = await fetch(`http://${serverIp}:8000/sensor-devices`);
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

  const getSensorIcon = (sensorId: string) => {
    if (sensorId === "dadn-temp") return "🌡️";
    if (sensorId === "dadn-light") return "💡";
    if (sensorId === "dadn-humi") return "💧";
    return "📊";
  };

  return (
    <ParallaxScrollView
      headerImage={
        <IconSymbol
          name="chart.line.uptrend.xyaxis"
          size={200}
          style={styles.headerImage}
          color={colorScheme === "dark" ? "#ffffff" : "#000000"}
        />
      }
      headerBackgroundColor={{ dark: "#1c1c1c", light: "#f8f8f8" }}
    >
      <ThemedView style={styles.container}>
        <ThemedView style={styles.titleContainer}>
          <IconSymbol
            name="chart.line.uptrend.xyaxis"
            size={24}
            color={colorScheme === "dark" ? "#ffffff" : "#000000"}
          />
          <ThemedText type="title">Giám sát môi trường</ThemedText>
        </ThemedView>

        <ThemedView style={styles.connectionStatus}>
          <ThemedText>
            Trạng thái kết nối: {connectionStatus}
            {/* ({serverIp}) */}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.sensorCardsContainer}>
          {sensorDevices.map((deviceId) => (
            <ThemedView
              key={deviceId}
              style={[
                styles.sensorCard,
                { borderColor: getSensorColor(deviceId) },
              ]}
            >
              <ThemedView
                style={[
                  styles.sensorIconContainer,
                  { backgroundColor: getSensorColor(deviceId) },
                ]}
              >
                <ThemedText style={styles.sensorIcon}>
                  {getSensorIcon(deviceId)}
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.sensorInfo}>
                <ThemedText type="defaultSemiBold">
                  {deviceDescriptions[deviceId]}
                </ThemedText>
                <ThemedText style={styles.sensorValue}>
                  {parseFloat(sensorValues[deviceId] || "0").toFixed(1)}
                  {deviceUnits[deviceId]}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          ))}
        </ThemedView>

        <ThemedText type="defaultSemiBold" style={styles.chartTitle}>
          Biểu đồ theo dõi
        </ThemedText>

        {sensorDevices.map((deviceId) => (
          <ThemedView key={`chart-${deviceId}`} style={styles.chartContainer}>
            <ThemedText type="defaultSemiBold">
              {deviceDescriptions[deviceId]}
            </ThemedText>
            <LineChart
              data={{
                labels: [
                  "60p",
                  "55p",
                  "50p",
                  "45p",
                  "40p",
                  "35p",
                  "30p",
                  "25p",
                  "20p",
                  "15p",
                  "10p",
                  "5p",
                ], // Nhãn cho 1 giờ
                datasets: [
                  {
                    data: historyData[deviceId] || Array(12).fill(0),
                    color: () => getSensorColor(deviceId),
                    strokeWidth: 2,
                  },
                ],
              }}
              width={screenWidth - 50}
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
                marginLeft: 20,
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
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerImage: {
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  connectionStatus: {
    marginBottom: 16,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  sensorCardsContainer: {
    flexDirection: "column",
    marginBottom: 20,
  },
  sensorCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sensorIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  sensorIcon: {
    fontSize: 24,
    color: "#fff",
  },
  sensorInfo: {
    flex: 1,
  },
  sensorValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 4,
  },
  chartTitle: {
    marginTop: 16,
    marginBottom: 12,
    fontSize: 18,
  },
  chartContainer: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    alignSelf: "center",
    width: "98%",
    overflow: "hidden",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
    alignSelf: "center",
    marginRight: 10,
  },
});
