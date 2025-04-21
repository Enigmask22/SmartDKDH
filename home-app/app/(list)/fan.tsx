import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Platform,
  StatusBar,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchFanDevices,
  setAllValues,
  setFanValue,
  toggleAutoMode,
} from "@/store/fanDevicesSlice";
import { setSensorValues } from "@/store/sensorSlice";
import { AppDispatch, RootState } from "@/store";
import DeviceCard from "@/components/card/index";
import SummaryCard from "@/components/card/Summary";
import { Audio } from "expo-av";
import { MaterialIcons } from "@expo/vector-icons";
import { handleForAll } from "@/actions/fan/handleVoiceCommand";
import { styles } from "@/styles/fan";
import { VoiceHint } from "@/components/ui/VoiceHint";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { ThemedText } from "@/components/ThemedText";
const { width, height } = Dimensions.get("window");

const API_BASE_URL = `https://smartdkdh.onrender.com`;

export default function FanList() {
  const [recording, setRecording] = useState<Audio.Recording>();
  const [isListening, setIsListening] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [serverIp, setServerIp] = useState(
    API_BASE_URL.replace("http://", "").replace(":8000", "")
  );
  const sensor = useSelector((state: RootState) => state.sensor);
  const autoMode = useSelector((state: RootState) => state.fanDevices.autoMode);
  const { devices, loading, error } = useSelector(
    (state: RootState) => state.fanDevices
  );
  const onFans = devices.filter((fan) => fan.value !== 0).length;
  const offFans = devices.length - onFans;

  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    dispatch(fetchFanDevices());
  }, [dispatch]);

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
        console.log("Received data:", data);
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
              handleForAll(command, dispatch, devices);
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

  return (
    <ScrollView style={styles.container}>
      <StatusBar backgroundColor="#f2f6fc"/>
      <View style={styles.titleContainer}>
        <View style={{flexDirection:'row', width:width}}>
          <View style={styles.backButton}></View>
          <View style={styles.title}>
            <ThemedText type="title" style={{fontSize:25}}> Smart Fan</ThemedText>
          </View>
          <View style={styles.backButton}>
          <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-forward" size={24} color="black"/>
          </TouchableOpacity>
          </View>
        </View>
      </View>
      <SummaryCard
        total={devices.length}
        on={onFans}
        off={offFans}
        type="fan"
      />
      <View style={styles.fansGrid}>
        {devices.map((fan) => (
          <DeviceCard
            key={fan.id}
            device={{
              type: "fan",
              ...fan,
            }}
          >
            <TouchableOpacity>
              <Ionicons
                name="settings-outline"
                size={20}
                color="#777"
                onPress={() => router.push(`/(list)/fanDetails?id=${fan.id}`)}
              />
            </TouchableOpacity>
          </DeviceCard>
        ))}
      </View>
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.micButton,
            isListening ? styles.listeningButton : null,
          ]}
          onPress={recording ? stopRecording : startRecording}
          disabled={autoMode}
        >
          {autoMode ? (
            <FontAwesome6 name="superpowers" size={24} color="#4CAF50" />
          ) : (
            <MaterialIcons
              name="keyboard-voice"
              size={24}
              color={isListening ? "#ff4444" : "#4CAF50"}
            />
          )}
        </TouchableOpacity>
        <View
          style={{
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            Auto Mode
          </Text>
          <Switch
            trackColor={{ false: "#e0e0e0", true: "#3b82f6" }}
            thumbColor={"#ffffff"}
            // @ts-ignore
            onValueChange={() => dispatch(toggleAutoMode())}
            value={autoMode}
            style={{ transform: [{ scale: 2 }], margin: 6 }} // Adjust the scale factor as needed
          />
        </View>
      </View>
      <VoiceHint>
        {autoMode
          ? "Chế độ tự động: Fan sẽ điều chỉnh theo nhiệt độ"
          : 'Thử nói: "Bật quạt phòng khách", "Tắt quạt số 1" hoặc "Tắt tất cả quạt"'}
      </VoiceHint>
    </ScrollView>
  );
}
