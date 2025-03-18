import { useState, useEffect } from "react";
import {
  StyleSheet,
  Platform,
  TouchableOpacity,
  ScrollView,
  Alert,
  View,
} from "react-native";
import Slider from "@react-native-community/slider";
import { Audio } from "expo-av";
import Constants from "expo-constants";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useColorScheme } from "@/hooks/useColorScheme";

// API configuration
const API_BASE_URL = `http://${Constants.expoConfig?.extra?.serverIp}:${Constants.expoConfig?.extra?.apiPort}`;

export default function ExploreScreen() {
  const colorScheme = useColorScheme();
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
  const [recording, setRecording] = useState<Audio.Recording>();
  const [isListening, setIsListening] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const [sensorValues, setSensorValues] = useState<Record<string, string>>({});
  const [sliderValues, setSliderValues] = useState<number>();
  // Fetch Fan devices
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
        if (data.fan_statuses) {
          setFanStatuses(data.fan_statuses);

          // Cập nhật giá trị quạt
          const values: Record<string, number> = {};
          Object.entries(data.fan_statuses).forEach(([id, status]) => {
            values[id] = parseInt(status as string) || 0;
          });
          console.log("Fan values:", values);
          setFanValues(values);
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

  // Thêm useEffect để theo dõi giá trị nhiệt độ và tự động điều khiển Fan khi Auto mode được bật
  useEffect(() => {
    if (!autoMode) return;

    // Lấy giá trị nhiệt độ từ WebSocket
    const tempSensor = sensorValues["dadn-temp"];
    if (!tempSensor) return;

    const tempValue = parseFloat(tempSensor);

    // Điều khiển Fan dựa trên giá trị nhiệt độ
    if (tempValue >= 0 && tempValue <= 25) {
      // Tắt tất cả Fan (value = 0)
      fanDevices.forEach((deviceId) => {
        if (fanValues[deviceId] !== 0) {
          setFanValue(deviceId, 0);
        }
      });
    } else if (tempValue > 25 && tempValue <= 32) {
      // Đặt tất cả Fan ở mức 50
      fanDevices.forEach((deviceId) => {
        if (fanValues[deviceId] !== 50) {
          setFanValue(deviceId, 50);
        }
      });
    } else if (tempValue > 32) {
      // Bật hết Fan (value = 100)
      fanDevices.forEach((deviceId) => {
        if (fanValues[deviceId] !== 100) {
          setFanValue(deviceId, 100);
        }
      });
    }
  }, [autoMode, sensorValues, fanDevices, fanValues]);

  const fetchDevices = async () => {
    try {
      const response = await fetch(`http://${serverIp}:8000/fan-devices`);
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

  const toggleFan = async (deviceId: string, action: string) => {
    try {
      const response = await fetch(
        `http://${serverIp}:8000/fan/${deviceId}/${action}`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Toggle fan result:", result);

      // Cập nhật trạng thái cục bộ
      if (result.success) {
        setFanValues((prev) => ({
          ...prev,
          [deviceId]: result.value,
        }));
      }
    } catch (error) {
      console.error("Error toggling fan:", error);
      Alert.alert("Error", "Failed to control the fan. Please try again.");
    }
  };

  const setFanValue = async (deviceId: string, value: number) => {
    try {
      const response = await fetch(
        `http://${serverIp}:8000/fan/${deviceId}/${value}`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Set fan value result:", result);

      // Cập nhật trạng thái cục bộ
      if (result.success) {
        setFanValues((prev) => ({
          ...prev,
          [deviceId]: result.value,
        }));
      }
    } catch (error) {
      console.error("Error setting fan value:", error);
      Alert.alert("Error", "Failed to set fan value. Please try again.");
    }
  };

  async function startRecording() {
    try {
      console.log("Requesting permissions..");
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log("Starting recording..");
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsListening(true);

      console.log("Recording started");
    } catch (err) {
      console.error("Failed to start recording", err);
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
      console.error("Error sending audio to server:", error);
      throw error; // Chuyển tiếp lỗi để xử lý ở stopRecording
    }
  }

  function handleVoiceCommand(command: string) {
    const normalizedCommand = command.toLowerCase();
    console.log("Processing command:", normalizedCommand);

    // Xác định hành động: bật/tắt/tăng/giảm
    let action = "";
    if (normalizedCommand.includes("tắt")) {
      action = "off";
    } else if (
      normalizedCommand.includes("bật") ||
      normalizedCommand.includes("mở")
    ) {
      action = "on";
    } else if (normalizedCommand.includes("tăng")) {
      action = "increase";
    } else if (normalizedCommand.includes("giảm")) {
      action = "decrease";
    } else {
      // Đặt quạt số $number ở (mức)? number %
      // Kiểm tra xem có yêu cầu đặt mức cụ thể không
      const percentMatch = normalizedCommand.match(/(\d+)(\s*%|\s*phần trăm)/);
      const setLevelMatch = normalizedCommand.match(
        /quạt\s+(số\s+)?(\d+)\s+(?:ở\s+)?mức\s+(\d+)/i
      );

      if (percentMatch) {
        const percent = parseInt(percentMatch[1]);
        if (!isNaN(percent) && percent >= 0 && percent <= 100) {
          // Xác định đối tượng: tất cả quạt hoặc quạt cụ thể
          if (
            normalizedCommand.includes("tất cả") ||
            normalizedCommand.includes("hết")
          ) {
            console.log(`Setting all fans to ${percent}%`);
            fanDevices.forEach((deviceId) => {
              setFanValue(deviceId, percent);
            });
            return;
          }

          // Tìm số quạt trong câu nói
          const numbers =
            normalizedCommand.match(/quạt\s+(số\s+)?(\d+)/g) || [];
          numbers.forEach((match) => {
            const matchResult = match.match(/\d+/);
            if (matchResult) {
              const num = matchResult[0];
              const deviceId = `dadn-fan-${num}`;
              if (fanDevices.includes(deviceId)) {
                console.log(`Setting fan ${num} to ${percent}%`);
                setFanValue(deviceId, percent);
              }
            }
          });
          return;
        }
      } else if (setLevelMatch) {
        const fanNumber = parseInt(setLevelMatch[2]);
        const level = parseInt(setLevelMatch[3]);

        if (!isNaN(fanNumber) && !isNaN(level) && level >= 0 && level <= 100) {
          const deviceId = `dadn-fan-${fanNumber}`;
          if (fanDevices.includes(deviceId)) {
            console.log(`Setting fan ${fanNumber} to ${level}%`);
            setFanValue(deviceId, level);
          } else {
            console.log(`Fan ${fanNumber} not found`);
          }
          return;
        }
      }

      console.log("No valid action found in command");
      return;
    }

    // Xác định đối tượng: tất cả quạt hoặc quạt cụ thể
    if (
      normalizedCommand.includes("tất cả") ||
      normalizedCommand.includes("hết")
    ) {
      console.log("Controlling all fans:", action);
      fanDevices.forEach((deviceId) => {
        toggleFan(deviceId, action);
      });
      return;
    }

    // Tìm số quạt trong câu nói
    const numbers = normalizedCommand.match(/\d+/g) || [];
    if (numbers.length > 0) {
      numbers.forEach((num) => {
        const deviceId = `dadn-fan-${num}`;
        if (fanDevices.includes(deviceId)) {
          console.log(`Controlling fan ${num}:`, action);
          toggleFan(deviceId, action);
        }
      });
      return;
    }

    // Nếu không tìm thấy số cụ thể, thử điều khiển quạt đầu tiên
    if (fanDevices.length > 0) {
      console.log("Controlling first fan:", action);
      toggleFan(fanDevices[0], action);
    }
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="fan"
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Fan Control</ThemedText>
      </ThemedView>

      <ThemedView style={styles.serverConfig}>
        <ThemedText type="defaultSemiBold">
          Server Status: {connectionStatus}
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.fanControlsContainer}>
        <ThemedText type="defaultSemiBold" style={{ marginBottom: 8 }}>
          Fan Controls
        </ThemedText>

        {fanDevices.length === 0 ? (
          <ThemedText>No fan devices found</ThemedText>
        ) : (
          <ScrollView>
            {fanDevices.map((deviceId) => (
              <ThemedView key={deviceId} style={styles.fanItem}>
                <ThemedView
                  style={[
                    styles.fanIndicator,
                    fanValues[deviceId] > 0 ? styles.fanOn : styles.fanOff,
                  ]}
                >
                  <ThemedText style={styles.fanStatusText}>
                    {fanValues[deviceId]}%
                  </ThemedText>
                </ThemedView>

                <ThemedView style={styles.fanInfo}>
                  <ThemedText type="defaultSemiBold">
                    {deviceDescriptions[deviceId] || deviceId}
                  </ThemedText>
                  <ThemedText>
                    Status: {fanValues[deviceId] > 0 ? "On" : "Off"}
                  </ThemedText>

                  <View style={styles.sliderContainer}>
                    <Slider
                      style={styles.slider}
                      minimumValue={0}
                      maximumValue={100}
                      step={10}
                      value={fanValues[deviceId] || 0}
                      // onValueChange={(value: number) => {
                      //   requestAnimationFrame(() => {
                      //     setFanValues((prev) => ({
                      //       ...prev,
                      //       [deviceId]: value,
                      //     }));
                      //   });
                      // }}

                      onSlidingComplete={(value: number) => {
                        // Chỉ gửi request khi người dùng đã kéo xong
                        setFanValue(deviceId, value);
                      }}
                      minimumTrackTintColor="#4CAF50"
                      maximumTrackTintColor={autoMode ? "#cccccc" : "#000000"}
                      thumbTintColor="#4CAF50"
                      disabled={autoMode}
                    />
                    <ThemedText>{fanValues[deviceId]}%</ThemedText>
                  </View>

                  <View style={styles.buttonGroup}>
                    <TouchableOpacity
                      style={styles.controlButton}
                      onPress={() => toggleFan(deviceId, "on")}
                    >
                      <ThemedText style={styles.buttonText}>On</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.controlButton}
                      onPress={() => toggleFan(deviceId, "off")}
                    >
                      <ThemedText style={styles.buttonText}>Off</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.controlButton}
                      onPress={() => toggleFan(deviceId, "increase")}
                    >
                      <ThemedText style={styles.buttonText}>+</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.controlButton}
                      onPress={() => toggleFan(deviceId, "decrease")}
                    >
                      <ThemedText style={styles.buttonText}>-</ThemedText>
                    </TouchableOpacity>
                  </View>
                </ThemedView>
              </ThemedView>
            ))}
          </ScrollView>
        )}
      </ThemedView>

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
            ? "Chế độ tự động: Fan sẽ điều chỉnh theo nhiệt độ"
            : 'Thử nói: "Bật quạt phòng khách", "Tắt quạt số 1" hoặc "Tắt tất cả quạt"'}
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: "#808080",
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
  serverConfig: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  fanControlsContainer: {
    marginBottom: 16,
  },
  fanItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  fanIndicator: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  fanOn: {
    backgroundColor: "#4CAF50",
  },
  fanOff: {
    backgroundColor: "#666",
  },
  fanStatusText: {
    color: "#fff",
    fontWeight: "bold",
  },
  fanInfo: {
    flex: 1,
  },
  sliderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  slider: {
    flex: 1,
    height: 40,
    marginRight: 8,
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    width: "100%",
  },
  controlButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginHorizontal: 4,
    minWidth: 40,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
  },
  voiceControlContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  controlButtonsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
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
  voiceHint: {
    textAlign: "center",
    marginTop: 8,
    fontSize: 14,
    opacity: 0.7,
  },
});
