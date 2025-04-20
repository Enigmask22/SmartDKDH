import { useState, useEffect } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  View,
  Dimensions,
  Text
} from "react-native";
import Constants from "expo-constants";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useColorScheme } from "@/hooks/useColorScheme";
import { LineChart } from "react-native-chart-kit";
import { ActivityLogScreen } from "@/components/ActivityLog";
import ToggleDropdown from "@/components/Dropdown";
import { StatusBar } from "expo-status-bar";
import { Sensor } from "@/components/Sensor";
import { MaterialIcons, Octicons } from "@expo/vector-icons";
const { width, height } = Dimensions.get("window");

// API configuration
// const API_BASE_URL = `http://${Constants.expoConfig?.extra?.serverIp}:${Constants.expoConfig?.extra?.apiPort}`;
const API_BASE_URL = `https://smartdkdh.onrender.com`;

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
  const [dropdown, setDropDown] = useState<boolean[]>([true, false])

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
        //console.log("Received sensor data:", data);
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
      // const response = await fetch(`http://${serverIp}:8000/sensor-devices`);
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

  const getSensorIcon = (sensorId: string) => {
    if (sensorId === "dadn-temp") return "🌡️";
    if (sensorId === "dadn-light") return "💡";
    if (sensorId === "dadn-humi") return "💧";
    return "📊";
  };

  const chartTriggerComponent = (
    <View style={styles.triggerContent}>
      <Text style={styles.triggerText}>Sensor Data Chart</Text>
      <Text style={styles.triggerIcon}>{!dropdown[0] ? <MaterialIcons name="navigate-next" size={24} color="black" /> : <MaterialIcons name="keyboard-arrow-down" size={24} color="black" />}</Text>
    </View>
  );
  
  const logTriggerComponent = (
    <View style={styles.triggerContent}>
      <Text style={styles.triggerText}>Activity Log</Text>
      <Text style={styles.triggerIcon}>{!dropdown[1] ? <MaterialIcons name="navigate-next" size={24} color="black" /> : <MaterialIcons name="keyboard-arrow-down" size={24} color="black" />}</Text>
    </View>
  );

  const DataChart = (
    <ThemedView style={styles.dataChart}>
      <Sensor/>
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
  )

  return (
    <>
      <StatusBar backgroundColor="#f2f6fc"/>
      <View style={{flexDirection:"column", paddingTop:height*0.06, height:height*0.86, backgroundColor:'#f2f6fc'}}>
      <View style={styles.titleContainer}>
        <View style={styles.title}>
          <Octicons name="gear" size={30} color="black" />
          <ThemedText type="title" style={{fontSize:25}}> Data Overview</ThemedText>
        </View>
      </View>
        <View style={{height:height*0.7}}>
        <ToggleDropdown 
          id="chart"
          state={dropdown[0]}
          stateChange={setDropDown}
          triggerComponent={chartTriggerComponent}
          dropdownContent={DataChart}
        />
        <ToggleDropdown 
          id="activity"
          state={dropdown[1]}
          stateChange={setDropDown}
          triggerComponent={logTriggerComponent}
          dropdownContent={<ActivityLogScreen/>}
        />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    height: height * 0.06,
    alignItems: "center",
    gap: 50
  },
  title: {
    flexDirection: 'row',
  },
  dataChart: {
    backgroundColor: '#f2f6fc',
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
    width: "90%",
    overflow: "hidden",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
    alignSelf: "center",
    marginRight: 10,
  },
  triggerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
  },
  triggerText: {
    fontSize: 20,
    fontFamily:'Poppins-Bold',
    color: '#2666de',
  },
  untriggerIcon: {
    fontSize: 30,
    color: '#6c757d',
  },
  triggerIcon: {
    fontSize: 30,
    color: '#6c757d',
  },
  dropdownsContainer: {

  },
});