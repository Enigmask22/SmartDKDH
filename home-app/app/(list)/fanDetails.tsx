import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  Switch,
  StatusBar,
  Dimensions,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Entypo from "@expo/vector-icons/Entypo";
import { router } from "expo-router";
import { useState, useEffect, useRef } from "react";
import Slider from "@react-native-community/slider";
import { toggleFan, setFanValue } from "@/store/fanDevicesSlice";
import { AppDispatch, RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "expo-router/build/hooks";
import { Audio } from "expo-av";
import { Alert } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import LottieView from "lottie-react-native";
import { handleForOne } from "@/actions/fan/handleVoiceCommand";
import { FanNotFound } from "@/components/notFound/fan";
import { styles } from "@/styles/fan/details";
import PowerButton from "@/components/ui/PowerButton";
import { VoiceHint } from "@/components/ui/VoiceHint";
import { setSensorValues } from "@/store/sensorSlice";
import { setAllValues } from "@/store/fanDevicesSlice";
import { ThemedText } from "@/components/ThemedText";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");
const API_BASE_URL = `https://smartdkdh.onrender.com`;

// Các tùy chọn thời gian hẹn giờ (phút)
const TIMER_OPTIONS = [
  { label: "30 min", value: 30 },
  { label: "1 h", value: 60 },
  { label: "2 h", value: 120 },
  { label: "5 h", value: 300 },
];

export default function FanDetails() {
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [recording, setRecording] = useState<Audio.Recording>();
  const [isListening, setIsListening] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [serverIp, setServerIp] = useState(
    API_BASE_URL.replace("http://", "").replace(":8000", "")
  );

  // Timer Mode states
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [selectedTimer, setSelectedTimer] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const autoMode = useSelector((state: RootState) => state.fanDevices.autoMode);
  // Lấy thông tin device từ Redux store
  const devices = useSelector((state: RootState) => state.fanDevices.devices);
  const fan = devices.find((device) => device.id === id);

  // Lấy thông tin cảm biến từ Redux store
  const sensor = useSelector((state: RootState) => state.sensor);

  // Load timer state from AsyncStorage on component mount
  useEffect(() => {
    if (fan?.id) {
      loadTimerState();
    }
  }, [fan?.id]);

  // Save timer state to AsyncStorage whenever it changes
  useEffect(() => {
    if (fan?.id) {
      saveTimerState();
    }
  }, [timerEnabled, selectedTimer, timeRemaining]);

  // Handle timer countdown
  useEffect(() => {
    if (
      timerEnabled &&
      timeRemaining !== null &&
      timeRemaining > 0 &&
      fan &&
      fan.value > 0
    ) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev !== null && prev > 0) {
            return prev - 1;
          }
          return 0;
        });
      }, 1000);
    } else if (timerEnabled && timeRemaining === 0 && fan && fan.value > 0) {
      // Turn off fan when timer reaches 0
      handleToggleFan(fan.id, "off");
      setTimerEnabled(false);
      setTimeRemaining(null);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timerEnabled, timeRemaining, fan?.value]);

  const loadTimerState = async () => {
    try {
      const timerStateStr = await AsyncStorage.getItem(`fan_timer_${fan?.id}`);
      if (timerStateStr) {
        const timerState = JSON.parse(timerStateStr);
        setTimerEnabled(timerState.enabled);
        setSelectedTimer(timerState.selectedTimer);

        // Check if there's a timer running and calculate remaining time
        if (timerState.enabled && timerState.endTime) {
          const now = new Date().getTime();
          const endTime = timerState.endTime;
          const remaining = Math.max(0, Math.floor((endTime - now) / 1000));

          if (remaining > 0) {
            setTimeRemaining(remaining);
          } else {
            // Timer has already expired
            setTimerEnabled(false);
            setTimeRemaining(null);
          }
        }
      }
    } catch (error) {
      console.error("Failed to load timer state:", error);
    }
  };

  const saveTimerState = async () => {
    try {
      const endTime = timeRemaining
        ? new Date().getTime() + timeRemaining * 1000
        : null;

      const timerState = {
        enabled: timerEnabled,
        selectedTimer,
        endTime,
      };
      await AsyncStorage.setItem(
        `fan_timer_${fan?.id}`,
        JSON.stringify(timerState)
      );
    } catch (error) {
      console.error("Failed to save timer state:", error);
    }
  };

  const handleTimerToggle = (value: boolean) => {
    if (value && selectedTimer) {
      setTimerEnabled(true);
      const seconds = selectedTimer * 60;
      setTimeRemaining(seconds);
    } else {
      setTimerEnabled(false);
      setTimeRemaining(null);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const handleTimerSelect = (minutes: number) => {
    setSelectedTimer(minutes);
    if (timerEnabled) {
      const seconds = minutes * 60;
      setTimeRemaining(seconds);
    }
  };

  const formatTimeRemaining = () => {
    if (!timeRemaining) return "";

    const hours = Math.floor(timeRemaining / 3600);
    const minutes = Math.floor((timeRemaining % 3600) / 60);
    const seconds = timeRemaining % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const processCommand = (command: string) => {
    if (fan) {
      handleForOne(command, fan.id, dispatch, devices);
    }
  };

  const handleToggleFan = (id: string, action: string) => {
    dispatch(toggleFan({ id, action }));
  };

  const handleSetFanValue = (id: string, value: number) => {
    dispatch(setFanValue({ id, value }));
  };

  const handleDecrease = () => {
    if (fan && fan.value >= 10) {
      handleSetFanValue(fan.id, fan.value - 10);
    }
  };

  const handleIncrease = () => {
    if (fan && fan.value <= 90) {
      handleSetFanValue(fan.id, fan.value + 10);
    }
  };

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
              processCommand(command);
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

      // const url = `http://${serverIp}:8000/speech-to-text`;
      const url = `${API_BASE_URL}/speech-to-text`;
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

  // Thêm useEffect để theo dõi giá trị nhiệt độ và tự động điều khiển Fan khi Auto mode được bật
  useEffect(() => {
    if (!autoMode) return;

    // Lấy giá trị nhiệt độ từ WebSocket
    const tempSensor = sensor.values.temperature;
    if (!tempSensor) return;

    const tempValue = parseFloat(tempSensor);

    // Điều khiển Fan dựa trên giá trị nhiệt độ
    if (tempValue >= 0 && tempValue <= 25) {
      // Tắt tất cả Fan (value = 0)
      devices.forEach((device) => {
        if (device.value !== 0) {
          dispatch(setFanValue({ id: device.id, value: 0 }));
        }
      });
    } else if (tempValue > 25 && tempValue <= 32) {
      // Đặt tất cả Fan ở mức 50
      devices.forEach((device) => {
        if (device.value !== 50) {
          dispatch(setFanValue({ id: device.id, value: 50 }));
        }
      });
    } else if (tempValue > 32) {
      // Bật hết Fan (value = 100)
      devices.forEach((device) => {
        if (device.value !== 100) {
          dispatch(setFanValue({ id: device.id, value: 100 }));
        }
      });
    }
  }, [autoMode, sensor, devices]);

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
        if (data.fan_statuses) {
          dispatch(setAllValues(data.fan_statuses));
        }
        if (data.sensor_values) {
          dispatch(setSensorValues(data.sensor_values));
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

  if (!fan) {
    return <FanNotFound />;
  }

  return (
    <View style={{ padding: 30, backgroundColor: "#f2f6fc" }}>
      <StatusBar backgroundColor="#f2f6fc" />
      <View style={styles.titleContainer}>
        <View style={{ flexDirection: "row", width: width }}>
          <View style={styles.backButton}></View>
          <View style={styles.title}>
            <ThemedText type="title" style={{ fontSize: 25 }}>
              {" "}
              Fan {fan.id}
            </ThemedText>
            <Text style={styles.description}>
              {fan.description || "ABC room"}
            </Text>
          </View>
          <View style={styles.backButton}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-forward" size={24} color="black" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={{ position: "relative" }}>
        <LottieView
          source={require("@/animations/fan.json")}
          style={{ width: "100%", height: 400 }}
          autoPlay={fan.value > 0}
          loop={fan.value > 0}
          speed={fan.value > 0 ? fan.value / 50 : 0}
          progress={fan.value > 0 ? undefined : 0}
        />

        <View
          style={{
            ...styles.voiceControlContainer,
            position: "absolute",
            top: 10,
            right: 10,
          }}
        >
          <TouchableOpacity
            style={[
              autoMode ? styles.dissabledMicButton : styles.micButton,
              isListening ? styles.listeningButton : null,
            ]}
            onPress={recording ? stopRecording : startRecording}
            disabled={autoMode}
          >
            {autoMode ? (
              <MaterialIcons name="voice-over-off" size={24} color="#666" />
            ) : (
              <MaterialIcons
                name="keyboard-voice"
                size={24}
                color={isListening ? "#ff4444" : "#4287f5"}
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Hiển thị giá trị quạt */}
        <View style={styles.fanValueContainer}>
          <Text style={styles.fanValueText}>{fan.value}%</Text>
        </View>

        <View style={styles.sliderContainer}>
          <TouchableOpacity
            style={styles.sliderButton}
            onPress={handleDecrease}
            disabled={autoMode || fan.value <= 0}
          >
            <Entypo
              name="minus"
              size={20}
              color={autoMode ? "#ccc" : "#4287f5"}
            />
          </TouchableOpacity>

          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={100}
            step={10}
            value={fan.value || 0}
            onSlidingComplete={(value: number) => {
              handleSetFanValue(fan.id, value);
            }}
            minimumTrackTintColor="#4287f5"
            maximumTrackTintColor="#e0e0e0"
            thumbTintColor="#4287f5"
            disabled={autoMode}
          />

          <TouchableOpacity
            style={styles.sliderButton}
            onPress={handleIncrease}
            disabled={autoMode || fan.value >= 100}
          >
            <Entypo
              name="plus"
              size={20}
              color={autoMode ? "#ccc" : "#4287f5"}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.controlsSection}>
          <View style={styles.infoBoxContainer}>
            <View style={styles.infoBox}>
              <Ionicons name="thermometer-outline" size={20} color="#4287f5" />
              <Text style={styles.infoBoxText}>
                {sensor.values.temperature
                  ? `${sensor.values.temperature}°C`
                  : "--°C"}
              </Text>
              <Text style={styles.infoBoxLabel}>Temperature</Text>
            </View>

            <View style={styles.powerButtonContainer}>
              <PowerButton
                dissabled={autoMode}
                isOff={fan.value === 0}
                onPress={() => {
                  fan.value > 0
                    ? handleToggleFan(fan.id, "off")
                    : handleToggleFan(fan.id, "on");
                }}
              />
            </View>

            <View style={styles.infoBox}>
              <Ionicons name="water-outline" size={20} color="#4287f5" />
              <Text style={styles.infoBoxText}>
                {sensor.values.humidity ? `${sensor.values.humidity}%` : "--%"}
              </Text>
              <Text style={styles.infoBoxLabel}>Humidity</Text>
            </View>
          </View>

          <View style={styles.timerSection}>
            <View style={styles.timerHeaderRow}>
              <Text style={styles.timerTitle}>Timer</Text>
              <Switch
                value={timerEnabled}
                onValueChange={handleTimerToggle}
                trackColor={{ false: "#ddd", true: "#4287f5" }}
                thumbColor={timerEnabled ? "#fff" : "#fff"}
                disabled={autoMode || !selectedTimer}
              />
              {timerEnabled && timeRemaining && (
                <Text style={styles.timerCountdown}>
                  {formatTimeRemaining()}
                </Text>
              )}
            </View>

            <View style={styles.timerOptionsContainer}>
              {TIMER_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.timerOption,
                    selectedTimer === option.value &&
                      styles.timerOptionSelected,
                  ]}
                  onPress={() => handleTimerSelect(option.value)}
                  disabled={autoMode}
                >
                  <Text
                    style={[
                      styles.timerOptionText,
                      selectedTimer === option.value &&
                        styles.timerOptionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* <View style={styles.autoModeSection}>
            <Text style={styles.autoModeTitle}>Auto Mode</Text>
            <Switch
              value={autoMode}
              onValueChange={(value) => {
                // Auto mode would be handled in your Redux store or similar
                // This is just a placeholder
              }}
              trackColor={{ false: "#ddd", true: "#4287f5" }}
              thumbColor={autoMode ? "#fff" : "#fff"}
            />
          </View> */}
        </View>

        <VoiceHint>
          {autoMode ? (
            <Text>Chế độ tự động đang bật</Text>
          ) : (
            <Text>
              Thử nói: "Bật quạt", "Tắt quạt" hoặc "Bật quạt ở mức 60%"
            </Text>
          )}
        </VoiceHint>
      </View>
    </View>
  );
}
