import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  Platform,
  StatusBar,
  Dimensions,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect, useRef } from "react";
import { router } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import {
  fetchLedDevices,
  setAllStatuses,
  toggleLed,
  toggleAutoMode,
} from "@/store/ledDevicesSlice";
import DeviceCard from "@/components/card/index";
import SummaryCard from "@/components/card/Summary";
import { setSensorValues } from "@/store/sensorSlice";
import { Audio } from "expo-av";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { VoiceHint } from "@/components/ui/VoiceHint";
import { styles } from "@/styles/light";
import { handleForAll } from "@/actions/light/handleVoiceCommand";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { ThemedText } from "@/components/ThemedText";
import { Feather } from "@expo/vector-icons";
const { width, height } = Dimensions.get("window");

const API_BASE_URL = "https://smartdkdh.onrender.com";

// Skeleton component for light cards
const SkeletonCard = () => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
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
    <Animated.View 
      style={[
        styles.skeletonCardContainer, 
        { opacity }
      ]}
    >
      <View style={styles.skeletonIcon} />
      <View style={styles.skeletonTitle} />
      <View style={styles.skeletonSwitch} />
    </Animated.View>
  );
};

// Skeleton component for summary card
const SkeletonSummary = () => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
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
    <Animated.View 
      style={[
        styles.skeletonSummaryContainer, 
        { opacity }
      ]}
    >
      <View style={styles.skeletonSummaryItem} />
      <View style={styles.skeletonSummaryItem} />
      <View style={styles.skeletonSummaryItem} />
    </Animated.View>
  );
};

// Error state component
const ErrorState = ({ message, onRetry } : {
  message?: string; 
  onRetry: () => void;
}) => {
  return (
    <View style={styles.errorContainer}>
      <Feather name="wifi-off" size={64} color="#f44336" />
      <Text style={styles.errorTitle}>Connection Error</Text>
      <Text style={styles.errorMessage}>{message || "Unable to load lights data"}</Text>
      <TouchableOpacity 
        style={styles.retryButton}
        onPress={onRetry}
        activeOpacity={0.7}
      >
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function LightList() {
  // khởi tạo state cho các hành động cần thiết
  const [recording, setRecording] = useState<Audio.Recording>();
  const [isListening, setIsListening] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [serverIp, setServerIp] = useState(
    API_BASE_URL.replace("http://", "").replace(":8000", "")
  );

  // Lấy dữ liệu từ Redux store
  const dispatch = useDispatch<AppDispatch>();
  const autoMode = useSelector((state: RootState) => state.ledDevices.autoMode);
  const { devices, loading, error } = useSelector(
    (state: RootState) => state.ledDevices
  );
  const sensor = useSelector((state: RootState) => state.sensor);
  
  // Calculate only if devices are loaded
  const onBulbs = loading ? 0 : devices.filter((bulb) => bulb.status === "1").length;
  const offBulbs = loading ? 0 : devices.length - onBulbs;

  // Retry fetching function
  const handleRetry = () => {
    dispatch(fetchLedDevices());
  };

  useEffect(() => {
    dispatch(fetchLedDevices());
  }, [dispatch]);

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
          dispatch(setAllStatuses(data.led_statuses));
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

  // Thêm useEffect để theo dõi giá trị ánh sáng và tự động điều khiển LED khi Auto mode được bật
  useEffect(() => {
    if (!autoMode) return;

    // Lấy giá trị ánh sáng từ WebSocket
    const lightSensor = sensor.values.light;
    if (!lightSensor) return;

    const lightValue = parseFloat(lightSensor);

    // Điều khiển LED dựa trên giá trị ánh sáng
    if (lightValue >= 0 && lightValue <= 33) {
      // Bật tất cả LED
      devices.forEach((device) => {
        if (device.status !== "1") {
          toggleSwitch(device.id);
        }
      });
    } else if (lightValue > 33 && lightValue <= 66) {
      // Bật một nửa số LED
      const halfCount = Math.ceil(devices.length / 2);
      devices.forEach((device, index) => {
        const newStatus = index < halfCount ? "1" : "0";
        if (device.status !== newStatus) {
          toggleSwitch(device.id);
        }
      });
    } else if (lightValue > 66 && lightValue <= 100) {
      // Tắt tất cả LED
      devices.forEach((device) => {
        if (device.status !== "0") {
          toggleSwitch(device.id);
        }
      });
    }
  }, [autoMode, sensor, devices]);

  const toggleSwitch = (id: string) => {
    const device = devices.find((b) => b.id === id);
    if (!device) return;
    const newStatus = device.status === "1" ? "0" : "1";
    dispatch(toggleLed({ id, newStatus }));
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
              handleForAll(command, devices, dispatch);
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
      throw error; // Chuyển tiếp lỗi để xử lý ở stopRecording
    }
  }

  // Render content based on loading and error states
  const renderContent = () => {
    if (loading) {
      return (
        <>
          <SkeletonSummary />
          <View style={styles.skeletonGrid}>
            {[1, 2, 3, 4].map((item) => (
              <SkeletonCard key={`skeleton-${item}`} />
            ))}
          </View>
        </>
      );
    } else if (error) {
      return <ErrorState message={error} onRetry={handleRetry} />;
    } else {
      return (
        <>
          <SummaryCard
            type="bulb"
            total={devices.length}
            on={onBulbs}
            off={offBulbs}
          />
          <View style={styles.bulbsGrid}>
            {devices.map((bulb) => (
              <DeviceCard
                key={bulb.id}
                device={{
                  ...bulb,
                  type: "bulb",
                }}
              >
                <Switch
                  trackColor={{ false: "#e0e0e0", true: "#3b82f6" }}
                  thumbColor={"#ffffff"}
                  onValueChange={() => toggleSwitch(bulb.id)}
                  value={bulb.status === "1"}
                />
              </DeviceCard>
            ))}
          </View>
        </>
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <StatusBar backgroundColor="#f2f6fc"/>
      <View style={styles.titleContainer}>
        <View style={{flexDirection:'row', width:width}}>
          <View style={styles.backButton}></View>
          <View style={styles.title}>
            <ThemedText type="title" style={{fontSize:25}}> Smart Light</ThemedText>
          </View>
          <View style={styles.backButton}>
          <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-forward" size={24} color="black"/>
          </TouchableOpacity>
          </View>
        </View>
      </View>
      
      {/* Render dynamic content */}
      {renderContent()}
      
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.micButton,
            isListening ? styles.listeningButton : null,
          ]}
          onPress={recording ? stopRecording : startRecording}
          // @ts-ignore
          disabled={autoMode || loading || error}
          activeOpacity={0.7}
        >
          {autoMode ? (
            <FontAwesome6 name="superpowers" size={24} color="#4CAF50" />
          ) : (
            <MaterialIcons
              name="keyboard-voice"
              size={24}
              color={isListening ? "#ff4444" : "#4CAF50"}
              style={{ opacity: loading || error ? 0.5 : 1 }}
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
              color: loading || error ? "#9e9e9e" : "#000",
            }}
          >
            Auto Mode
          </Text>
          <Switch
            trackColor={{ false: "#e0e0e0", true: "#3b82f6" }}
            thumbColor={"#ffffff"}
            onValueChange={(value: boolean) => {
              if (!loading && !error) {
                dispatch(toggleAutoMode());
              }
            }}
            value={autoMode === true}
            // @ts-ignore
            disabled={loading || error}
            style={{ transform: [{ scale: 2 }], margin: 6 }}
          />
        </View>
      </View>
      <VoiceHint>
        {loading ? "Đang tải dữ liệu..." 
          : error ? "Không thể kết nối đến thiết bị. Vui lòng thử lại." 
          : autoMode
          ? "Chế độ tự động: LED sẽ điều chỉnh theo ánh sáng"
          : 'Thử nói: "Bật đèn phòng khách", "Tắt đèn số 1" hoặc "Tắt tất cả đèn"'}
      </VoiceHint>
    </ScrollView>
  );
}
