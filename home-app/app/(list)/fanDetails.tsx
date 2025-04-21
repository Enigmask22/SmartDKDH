import { View, Text, TouchableOpacity, Platform, StatusBar, Dimensions } from "react-native";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Entypo from '@expo/vector-icons/Entypo';
import { router } from "expo-router";
import { useState, useEffect } from "react";
import Slider from '@react-native-community/slider';
import { toggleFan, setFanValue } from "@/store/fanDevicesSlice";
import { AppDispatch, RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "expo-router/build/hooks";
import { Audio } from "expo-av";
import { Alert } from "react-native";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import LottieView from "lottie-react-native";
import { handleForOne } from "@/actions/fan/handleVoiceCommand";
import { FanNotFound } from "@/components/notFound/fan";
import { styles } from "@/styles/fan/details";
import PowerButton from "@/components/ui/PowerButton";
import { VoiceHint } from "@/components/ui/VoiceHint";
import { setSensorValues } from "@/store/sensorSlice";
import { setAllValues } from "@/store/fanDevicesSlice";
import { ThemedText } from "@/components/ThemedText";
const { width, height } = Dimensions.get("window");

const API_BASE_URL = `https://smartdkdh.onrender.com`;

export default function FanDetails() {
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [recording, setRecording] = useState<Audio.Recording>();
  const [isListening, setIsListening] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [serverIp, setServerIp] = useState(
    API_BASE_URL.replace("http://", "").replace(":8000", "")
  );

  const autoMode = useSelector((state: RootState) => state.fanDevices.autoMode);
  // Lấy thông tin device từ Redux store
  const devices = useSelector((state: RootState) => state.fanDevices.devices);
  const fan = devices.find(device => device.id === id);

  // Lấy thông tin cảm biến từ Redux store
  const sensor = useSelector((state: RootState) => state.sensor);

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
    return <FanNotFound />
  }
  return (
    <View style={{padding:30, backgroundColor:'#f2f6fc'}}>
      <StatusBar backgroundColor="#f2f6fc"/>
      <View style={styles.titleContainer}>
        <View style={{flexDirection:'row', width:width}}>
          <View style={styles.backButton}></View>
          <View style={styles.title}>
            <ThemedText type="title" style={{fontSize:25}}> Fan {fan.id}</ThemedText>
            <Text style={styles.description}>{fan.description || "ABC room"}</Text>
          </View>
          <View style={styles.backButton}>
          <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-forward" size={24} color="black"/>
          </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={{
        position: "relative",
      }}>
        <LottieView
          source={require("@/animations/fan.json")}
          style={{ width: "100%", height: 400 }}
          autoPlay={fan.value > 0}
          loop={fan.value > 0}
          speed={fan.value > 0 ? fan.value / 50 : 0} // Adjust the divisor to control max speed
          progress={fan.value > 0 ? undefined : 0} // Keep at first frame when off
        />
        <View style={{
          ...styles.voiceControlContainer,
          position: "absolute",
          top: 10,
          right: 10,
        }}>
          <View style={styles.controlButtonsRow}>
            <TouchableOpacity
              style={[
                autoMode ? styles.dissabledMicButton : styles.micButton,
                isListening ? styles.listeningButton : null,
              ]}
              onPress={recording ? stopRecording : startRecording}
              disabled={autoMode}
            >
              {
                autoMode ? (
                  <MaterialIcons name="voice-over-off" size={24} color={
                    "#666"
                  } />
                ) : (
                  <MaterialIcons name="keyboard-voice" size={24} color={
                    isListening ? "#ff4444" : "#4CAF50"
                  } />
                )
              }
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sliderContainer}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={100}
            step={10}
            value={fan.value || 0}
            onSlidingComplete={(value: number) => {
              // Chỉ gửi request khi người dùng đã kéo xong
              handleSetFanValue(fan.id, value);
            }}
            minimumTrackTintColor="#4CAF50"
            // maximumTrackTintColor={autoMode ? "#cccccc" : "#000000"}
            thumbTintColor="#4CAF50"
            disabled={autoMode}
          />
          <View
            style={[
              styles.fanIndicator,
              fan?.value > 0 ? styles.fanOn : styles.fanOff,
            ]}
          >
            <Text style={styles.fanStatusText}>
              {fan.value}%
            </Text>
          </View>
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => handleToggleFan(fan.id, 'decrease')}
            disabled={autoMode}
          >
            <Entypo name="minus" size={24} color="black" />
          </TouchableOpacity>
          <PowerButton dissabled={autoMode} isOff={fan.value === 0} onPress={() => { fan.value > 0 ? handleToggleFan(fan.id, 'off') : handleToggleFan(fan.id, 'on'); }} />
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => handleToggleFan(fan.id, 'increase')}
            disabled={autoMode}
          >
            <Entypo name="plus" size={24} color="black" />
          </TouchableOpacity>
        </View>
        <VoiceHint>
          {
            autoMode ? (
              <Text>Chế độ tự động đang bật</Text>
            ) : (
              <Text>Thử nói: "Bật quạt", "Tắt quạt" hoặc "Bật quạt ở mức 60%"</Text>
            )
          }
        </VoiceHint>
      </View>
    </View>
  );
}