import { useState, useEffect } from "react";
import {
  Image,
  StyleSheet,
  Platform,
  TouchableOpacity,
  ScrollView,
  Alert,
  View,
} from "react-native";
import { Audio } from "expo-av";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useColorScheme } from "@/hooks/useColorScheme";

// API configuration
const API_BASE_URL = `http://${Constants.expoConfig?.extra?.serverIp}:${Constants.expoConfig?.extra?.apiPort}`;

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const [ledDevices, setLedDevices] = useState<string[]>([]);
  const [ledStatuses, setLedStatuses] = useState<Record<string, string>>({});
  const [deviceDescriptions, setDeviceDescriptions] = useState<
    Record<string, string>
  >({});
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [serverIp, setServerIp] = useState(
    API_BASE_URL.replace("http://", "").replace(":8000", "")
  );
  const [recording, setRecording] = useState<Audio.Recording>();
  const [isListening, setIsListening] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const [sensorValues, setSensorValues] = useState<Record<string, string>>({});
  const [userNo, setUserNo] = useState<number | null>(null);

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
        console.log("Received data:", data);
        if (data.led_statuses) {
          setLedStatuses(data.led_statuses);
        }
        if (data.sensor_values) {
          setSensorValues(data.sensor_values);
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

  // Thêm useEffect để theo dõi giá trị ánh sáng và tự động điều khiển LED khi Auto mode được bật
  useEffect(() => {
    if (!autoMode) return;

    // Lấy giá trị ánh sáng từ WebSocket
    const lightSensor = sensorValues["dadn-light"];
    if (!lightSensor) return;

    const lightValue = parseFloat(lightSensor);

    // Điều khiển LED dựa trên giá trị ánh sáng
    if (lightValue >= 0 && lightValue <= 33) {
      // Bật tất cả LED
      ledDevices.forEach((deviceId) => {
        if (ledStatuses[deviceId] !== "1") {
          toggleLED(deviceId, "1");
        }
      });
    } else if (lightValue > 33 && lightValue <= 66) {
      // Bật một nửa số LED
      const halfCount = Math.ceil(ledDevices.length / 2);
      ledDevices.forEach((deviceId, index) => {
        const newStatus = index < halfCount ? "1" : "0";
        if (ledStatuses[deviceId] !== newStatus) {
          toggleLED(deviceId, newStatus);
        }
      });
    } else if (lightValue > 66 && lightValue <= 100) {
      // Tắt tất cả LED
      ledDevices.forEach((deviceId) => {
        if (ledStatuses[deviceId] !== "0") {
          toggleLED(deviceId, "0");
        }
      });
    }
  }, [autoMode, sensorValues, ledDevices]);

  const fetchDevices = async () => {
    try {
      const response = await fetch(`http://${serverIp}:8000/led-devices`);
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

  const toggleLED = async (deviceId: string, newStatus: string) => {
    try {
      const response = await fetch(
        `http://${serverIp}:8000/led/${deviceId}/${newStatus}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        console.log(
          `LED ${deviceId} turned ${newStatus === "1" ? "on" : "off"}`
        );
        setLedStatuses((prev) => ({
          ...prev,
          [deviceId]: newStatus,
        }));

        // Ghi log sau khi thao tác thành công
        const deviceNumber = getDeviceNumber(deviceId);
        const actionText = newStatus === "1" ? "Turn on" : "Turn off";
        await logUserActivity(
          `${actionText} LED${deviceNumber}`,
          "Success",
          deviceId
        );
      }
    } catch (error) {
      console.error("Error toggling LED:", error);
      Alert.alert("Error", "Failed to toggle LED. Check your connection.");

      // Ghi log thất bại nếu cần
      const deviceNumber = getDeviceNumber(deviceId);
      const actionText = newStatus === "1" ? "Turn on" : "Turn off";
      await logUserActivity(
        `${actionText} LED${deviceNumber}`,
        "Failed",
        deviceId
      );
    }
  };

  const findDeviceByDescription = (description: string) => {
    return Object.entries(deviceDescriptions).find(([, desc]) =>
      desc.toLowerCase().includes(description.toLowerCase())
    )?.[0];
  };

  async function startRecording() {
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
        setRecording(undefined);
      }

      setIsListening(true);
      const perm = await Audio.requestPermissionsAsync();
      if (perm.status === "granted") {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const { recording: newRecording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecording(newRecording);
      }
    } catch (err) {
      console.error("Failed to start recording", err);
      setIsListening(false);
    }
  }

  async function stopRecording() {
    try {
      if (!recording) {
        setIsListening(false);
        return;
      }

      setIsListening(false);
      const currentRecording = recording;
      setRecording(undefined);

      try {
        await currentRecording.stopAndUnloadAsync();
        const uri = currentRecording.getURI();

        if (!uri) {
          throw new Error("No URI found for recording");
        }

        // Thêm delay để đảm bảo file được ghi hoàn tất
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Thử lại tối đa 2 lần nếu thất bại
        let retryCount = 0;
        let lastError;

        while (retryCount < 2) {
          try {
            const command = await sendAudioToServer(uri);
            if (command) {
              console.log("Recognized command:", command);
              handleVoiceCommand(command);
              return;
            }
            throw new Error("Empty response from server");
          } catch (error) {
            lastError = error;
            retryCount++;
            if (retryCount < 2) {
              // Đợi trước khi thử lại
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
          }
        }

        throw lastError;
      } catch (error) {
        console.error("Error processing recording:", error);
        Alert.alert(
          "Error",
          "Something went wrong while processing the recording."
        );
      }
    } catch (error) {
      console.error("Error in stopRecording:", error);
    } finally {
      setIsListening(false);
      setRecording(undefined);
    }
  }

  async function sendAudioToServer(uri: string): Promise<string | null> {
    try {
      console.log("Sending file from URI:", uri);

      // Kiểm tra URI
      if (!uri) {
        throw new Error("Invalid URI");
      }

      const formData = new FormData();
      formData.append("audio", {
        uri: Platform.OS === "android" ? `file://${uri}` : uri,
        type: "audio/m4a",
        name: "recording.m4a",
      } as any);

      const url = `http://${serverIp}:8000/speech-to-text`;
      console.log("Sending to URL:", url);

      // Thêm timeout và retry logic
      const timeout = 10000; // 10 seconds
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response error:", errorText);
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      if (!data.text) {
        throw new Error("No text in response");
      }

      return data.text;
    } catch (error) {
      // console.error("Error sending audio to server:", error);
      throw error; // Chuyển tiếp lỗi để xử lý ở stopRecording
    }
  }

  const handleVoiceCommand = (command: string) => {
    console.log("Processing command:", command);

    // Chuẩn hóa chuỗi tiếng Việt
    const normalizedCommand = command
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    console.log("Normalized command:", normalizedCommand);

    const isOff = normalizedCommand.includes("tat");
    const isOn = normalizedCommand.includes("bat");
    console.log("isOff:", isOff);
    console.log("isOn:", isOn);
    let status: string;
    if (isOn) {
      status = "1";
    } else if (isOff) {
      status = "0";
    }
    if (normalizedCommand.includes("het")) {
      ledDevices.forEach((deviceId) => {
        toggleLED(deviceId, status);
      });
      return;
    }

    // Find LED number in the command
    const numbers = normalizedCommand.match(/\d+/g) || [];
    if (numbers.length > 0) {
      numbers.forEach((num) => {
        const deviceId = `dadn-led-${num}`;
        if (ledDevices.includes(deviceId)) {
          toggleLED(deviceId, status);
        }
      });
      return;
    }

    // Find room name in the command
    Object.values(deviceDescriptions).forEach((description) => {
      const roomName = description
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      if (normalizedCommand.includes(roomName)) {
        const deviceId = findDeviceByDescription(description);
        if (deviceId) {
          toggleLED(deviceId, status);
        }
      }
    });
  };

  const getDeviceNumber = (deviceId: string) => {
    const match = deviceId.match(/\d+$/);
    return match ? match[0] : "";
  };

  const logUserActivity = async (
    activity: string,
    status: string,
    deviceName: string
  ) => {
    try {
      // Kiểm tra xem đã có user_no chưa
      if (userNo === null) {
        console.warn("userNo chưa sẵn sàng, không thể gửi log hoạt động");
        return;
      }

      const logData = {
        user_no: userNo,
        activity: activity,
        status: status,
        device_name: deviceName,
        timestamp: new Date().toISOString(),
      };

      console.log("Sending log data:", logData);

      const response = await fetch(`http://${serverIp}:8000/api/logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(logData),
      });

      // Log response status để debug
      console.log(`Log API response status: ${response.status}`);

      // Lấy response body dưới dạng text
      const responseText = await response.text();
      console.log("Response text:", responseText);

      // Kiểm tra xem response có phải JSON không
      let result;
      try {
        // Chỉ parse JSON nếu responseText không rỗng
        if (responseText) {
          result = JSON.parse(responseText);
        } else {
          // Nếu response rỗng nhưng status OK
          if (response.ok) {
            console.log("Activity logged successfully (empty response)");
            return;
          } else {
            throw new Error("Empty response with error status");
          }
        }
      } catch (parseError) {
        console.error("Error parsing response:", parseError);
        // Nếu response OK dù không phải JSON
        if (response.ok) {
          console.log("Activity logged successfully (non-JSON response)");
          return;
        } else {
          throw new Error(`Invalid response format: ${responseText}`);
        }
      }

      // Xử lý result nếu có
      if (result) {
        if (result.success || response.ok) {
          console.log("Activity logged successfully");
        } else {
          console.error(
            "Failed to log activity:",
            result.message || result.detail || "Unknown error"
          );
        }
      }
    } catch (error) {
      console.error("Error logging user activity:", error);
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">LED Control Panel</ThemedText>
        <HelloWave />
      </ThemedView>

      {/* Server IP Configuration */}
      <ThemedView style={styles.serverConfig}>
        <ThemedText type="subtitle">Server Configuration</ThemedText>
        {/* <ThemedView style={styles.ipInputContainer}>
          <ThemedText>Server IP: {serverIp}</ThemedText>
        </ThemedView> */}
        <ThemedText>Connection Status: {connectionStatus}</ThemedText>
      </ThemedView>

      {/* LED Controls */}
      <ThemedView style={styles.ledControlsContainer}>
        {ledDevices.length > 0 ? (
          ledDevices.map((deviceId) => (
            <ThemedView key={deviceId} style={styles.ledItem}>
              <ThemedView
                style={[
                  styles.ledIndicator,
                  ledStatuses[deviceId] === "1" ? styles.ledOn : styles.ledOff,
                ]}
              >
                <ThemedText style={styles.ledStatusText}>
                  {ledStatuses[deviceId] === "1" ? "ON" : "OFF"}
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.ledInfo}>
                <ThemedText type="defaultSemiBold">
                  LED {getDeviceNumber(deviceId)} -{" "}
                  {deviceDescriptions[deviceId]}
                </ThemedText>
                <ThemedText>
                  Status:{" "}
                  {ledStatuses[deviceId] === "1" ? "Turned On" : "Turned Off"}
                </ThemedText>
              </ThemedView>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  autoMode ? styles.disabledButton : null,
                ]}
                onPress={() =>
                  toggleLED(deviceId, ledStatuses[deviceId] === "1" ? "0" : "1")
                }
                disabled={autoMode}
              >
                <ThemedText style={styles.buttonText}>
                  Turn {ledStatuses[deviceId] === "1" ? "OFF" : "ON"}
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          ))
        ) : (
          <ThemedText>No LED devices found. Check your connection.</ThemedText>
        )}
      </ThemedView>

      {/* Voice Control */}
      <ThemedView style={styles.voiceControlContainer}>
        <View style={styles.controlButtonsRow}>
          <TouchableOpacity
            style={[
              styles.micButton,
              isListening ? styles.listeningButton : null,
            ]}
            onPress={recording ? stopRecording : startRecording}
            disabled={autoMode}
          >
            <ThemedText style={styles.micButtonText}>🎤</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.autoButton,
              autoMode ? styles.autoButtonActive : null,
            ]}
            onPress={() => setAutoMode(!autoMode)}
          >
            <ThemedText style={styles.autoButtonText}>🤖</ThemedText>
          </TouchableOpacity>
        </View>

        <ThemedText style={styles.voiceHint}>
          {autoMode
            ? "Chế độ tự động: LED sẽ điều chỉnh theo ánh sáng"
            : 'Thử nói: "Bật đèn phòng khách", "Tắt đèn số 1" hoặc "Tắt tất cả đèn"'}
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
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
