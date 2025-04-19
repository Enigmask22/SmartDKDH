import { Feather, Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Text, View, StyleSheet, Dimensions, useColorScheme, Alert } from "react-native";

const { width, height } = Dimensions.get("window");
const API_BASE_URL = `https://smartdkdh.onrender.com`;

export function Sensor() {
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
        if (sensorId === "dadn-temp") return <Ionicons name="thermometer-outline" size={24} color="white" />;
        if (sensorId === "dadn-light") return <Ionicons name="bulb-outline" size={24} color="white" />;
        if (sensorId === "dadn-humi") return <Feather name="droplet" size={24} color="white" />;
        return "📊";
      };

      type Props = {
        id: string
    }
    const SensorDisplay = (props : Props) => {
        return(
          <View style={styles.display}>
            {getSensorIcon(props.id)}
            <View style={styles.displayText}>
                <Text style={styles.text}>
                    {parseFloat(sensorValues[props.id] || "0").toFixed(1)}
                    {deviceUnits[props.id]}
                </Text>
                <Text style={styles.text}>
                {deviceDescriptions[props.id]}
                </Text>
            </View>
        </View>
        )
      };
    
    return(
        <View style={styles.container}>
            {sensorDevices.map((deviceId) => <SensorDisplay key={deviceId} id={deviceId}/>)}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection:'row',
        justifyContent:'space-evenly',
        alignItems:'center',
        margin: 20,
        width: width*0.9,
        height: height*0.145,
        borderRadius: 30,
        borderCurve:'continuous',
        backgroundColor:'#2666de',
        elevation: 5
    },
    display: {
        flexDirection:'row',
        gap:10,
        alignItems:'center',
    },
    displayText: {
        flexDirection:'column',
        justifyContent:'flex-start',
        alignItems:'flex-start',
    },
    text: {
        fontSize:12,
        fontWeight:500,
        color:'white'
    }
});
