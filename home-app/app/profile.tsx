import { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  ScrollView,
  View,
  Dimensions,
  Pressable,
  TouchableOpacity,
  Alert,
  Text,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { AvatarProfile } from "@/components/Avatar";
import { useColorScheme } from "@/hooks/useColorScheme";
import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { InputBox, InputHiddenBox } from "@/components/Input";
import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { BlurView } from "expo-blur";

const { width, height } = Dimensions.get("window");
const API_BASE_URL = `https://smartdkdh.onrender.com`;

interface LoadingOverlayProps {
  visible: boolean;
  message: string;
}

// Component cho hiệu ứng loading
const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const blurOpacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animate in with proper sequence
      Animated.sequence([
        // First animate the background blur
        Animated.timing(blurOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        // Then show the loading container
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
            easing: Easing.out(Easing.cubic),
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
            easing: Easing.out(Easing.back(1.5)),
          }),
        ]),
      ]).start();

      // Start rotating animation
      Animated.loop(
        Animated.timing(rotation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
          easing: Easing.linear,
        })
      ).start();
    } else {
      // Animate out in reverse order
      Animated.sequence([
        // First hide the loading container
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0.8,
            duration: 250,
            useNativeDriver: true,
          }),
        ]),
        // Then fade out the background blur
        Animated.timing(blurOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, opacity, blurOpacity, scale, rotation]);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Semi-transparent overlay that darkens the background */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.overlay,
          { opacity: blurOpacity },
        ]}
      />

      {/* Blur effect layer */}
      <BlurView
        intensity={30}
        tint="dark"
        style={[StyleSheet.absoluteFill, styles.loadingOverlay]}
      >
        {/* Loading container with animations */}
        <Animated.View
          style={[
            styles.loadingContainer,
            {
              opacity,
              transform: [{ scale }],
            },
          ]}
        >
          <Animated.View
            style={{ transform: [{ rotate: spin }], marginBottom: 16 }}
          >
            <View style={styles.logoCircle}>
              <MaterialIcons name="update" size={30} color="#fff" />
            </View>
          </Animated.View>
          <Text style={styles.loadingText}>{message}</Text>
          <View style={styles.loadingDotsContainer}>
            <LoadingDots />
          </View>
        </Animated.View>
      </BlurView>
    </View>
  );
};

// Component hiệu ứng dấu chấm loading
const LoadingDots: React.FC = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(dot1, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(dot2, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(dot3, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(dot1, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot2, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot3, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => animate());
    };

    animate();

    return () => {
      // Cleanup animations
      dot1.setValue(0);
      dot2.setValue(0);
      dot3.setValue(0);
    };
  }, [dot1, dot2, dot3]);

  const dotStyle = (animated: Animated.Value) => ({
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3674B5",
    marginHorizontal: 4,
    opacity: animated as unknown as number,
    transform: [
      {
        scale: animated.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.5],
        }),
      },
    ],
  });

  return (
    <View style={{ flexDirection: "row", marginTop: 8 }}>
      <Animated.View style={dotStyle(dot1)} />
      <Animated.View style={dotStyle(dot2)} />
      <Animated.View style={dotStyle(dot3)} />
    </View>
  );
};

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userNo, setUserNo] = useState<number | null>(null);
  const [userData, setUserData] = useState<Record<string, string>>({});
  const [editedData, setEditedData] = useState<Record<string, string>>({});
  const [hidden, setHidden] = useState([true, true, true]);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  function changeHidden(idx: number) {
    setHidden(hidden.map((e, index) => (index == idx ? !e : e)));
  }

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

  // Lấy dữ liệu người dùng từ AsyncStorage
  useEffect(() => {
    fetchUserData();
  }, []);

  // Thêm effect theo dõi sự kiện bàn phím
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
        // Tự động cuộn xuống khi bàn phím hiển thị
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  async function fetchUserData() {
    try {
      let name = await AsyncStorage.getItem("user_name");
      let email = await AsyncStorage.getItem("user_email");
      let ada = await AsyncStorage.getItem("user_ada");
      let key = await AsyncStorage.getItem("user_key");
      let password = await AsyncStorage.getItem("user_password");

      const userDataObj = {
        name: name != null ? name : "",
        email: email != null ? email : "",
        ada: ada != null ? ada : "",
        key: key != null ? key : "",
        password: password != null ? password : "",
      };

      setUserData(userDataObj);
      setEditedData(userDataObj); // Khởi tạo dữ liệu chỉnh sửa
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert("Error", "Failed to load user data");
    }
  }

  // Bắt đầu chỉnh sửa
  const startEditing = () => {
    setEditedData({ ...userData }); // Sao chép dữ liệu hiện tại vào state chỉnh sửa
    setIsEditing(true);
  };

  // Hủy chỉnh sửa
  const cancelEditing = () => {
    setIsEditing(false);
    setEditedData({ ...userData }); // Khôi phục lại dữ liệu gốc
  };

  // Cập nhật dữ liệu người dùng
  const updateUserProfile = async () => {
    if (!userNo) {
      Alert.alert("Error", "User information not found");
      return;
    }

    // Kiểm tra dữ liệu đầu vào
    if (
      !editedData.name ||
      !editedData.email ||
      !editedData.ada ||
      !editedData.key
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      // Gửi request để cập nhật
      const response = await fetch(`${API_BASE_URL}/api/users/${userNo}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editedData.name,
          email: editedData.email,
          password: editedData.password, // Giữ nguyên password
          username_adafruit: editedData.ada,
          key_adafruit: editedData.key,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || `Failed to update profile: ${response.status}`
        );
      }

      // Cập nhật trạng thái
      await AsyncStorage.setItem("user_name", editedData.name);
      await AsyncStorage.setItem("user_email", editedData.email);
      await AsyncStorage.setItem("user_ada", editedData.ada);
      await AsyncStorage.setItem("user_key", editedData.key);

      // Cập nhật state
      setUserData({ ...editedData });

      // Hiển thị thông báo thành công
      Alert.alert("Success", "Profile updated successfully");

      // Tắt chế độ chỉnh sửa
      setIsEditing(false);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", error.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  // Dữ liệu hiển thị
  const PersonalData = {
    username: isEditing ? editedData.name : userData.name,
    email: isEditing ? editedData.email : userData.email,
    password: userData.password,
  };

  const AdaData = {
    AIO_USERNAME: isEditing ? editedData.ada : userData.ada,
    AIO_KEY: isEditing ? editedData.key : userData.key,
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#ffffff" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <View style={{ backgroundColor: "#ffffff", height: height * 1.1 }}>
        <StatusBar backgroundColor="#ffffff" />
        <View style={styles.titleContainer}>
          <View style={{ flexDirection: "row", width: width }}>
            <View style={styles.backButton}></View>
            <View style={styles.title}>
              <Feather name="user" size={30} color="black" />
              <ThemedText type="title" style={{ fontSize: 25 }}>
                {" "}
                Profile
              </ThemedText>
            </View>
            <View style={styles.backButton}>
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="chevron-forward" size={24} color="black" />
              </TouchableOpacity>
            </View>
          </View>
          <AvatarProfile name={userData.name} />
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={{ borderRadius: 30, backgroundColor: "#f2f6fc" }}
          contentContainerStyle={{
            flexDirection: "column",
            alignItems: "center",
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
        >
          <ThemedView style={styles.optionContainer}>
            <InputBox
              title={"Username"}
              data={PersonalData.username}
              setData={(text) => setEditedData({ ...editedData, name: text })}
              editable={isEditing}
            />
            <InputBox
              title={"Email"}
              data={PersonalData.email}
              setData={(text) => setEditedData({ ...editedData, email: text })}
              editable={isEditing}
            />
            <InputHiddenBox
              title={"Password"}
              data={PersonalData.password}
              setData={() => {}}
              editable={false}
            />
          </ThemedView>

          <View style={styles.line} />

          <ThemedView
            style={[
              styles.optionContainer,
              keyboardVisible && styles.keyboardVisiblePadding,
            ]}
          >
            <ThemedText type="subtitle" style={{ paddingBottom: 10 }}>
              More
            </ThemedText>
            <InputHiddenBox
              title={"AIO_USERNAME"}
              data={AdaData.AIO_USERNAME}
              setData={(text) => setEditedData({ ...editedData, ada: text })}
              editable={isEditing}
            />
            <InputHiddenBox
              title={"AIO_KEY"}
              data={AdaData.AIO_KEY}
              setData={(text) => setEditedData({ ...editedData, key: text })}
              editable={isEditing}
            />
            <View style={styles.btnGroup}>
              {isEditing ? (
                <View style={styles.actionButtonsContainer}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.saveButton]}
                    onPress={updateUserProfile}
                  >
                    <Feather name="check" size={20} color="#4CAF50" />
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={cancelEditing}
                  >
                    <Feather name="x" size={20} color="#F44336" />
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={startEditing}
                >
                  <Feather name="edit-2" size={20} color="#2666de" />
                  <Text style={styles.editButtonText}>Edit Profile</Text>
                </TouchableOpacity>
              )}
            </View>
          </ThemedView>

          {/* Thêm padding bổ sung khi bàn phím hiển thị */}
          {keyboardVisible && <View style={{ height: 200 }} />}
        </ScrollView>

        {/* Loading Overlay */}
        <LoadingOverlay visible={isLoading} message="Updating profile..." />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    backgroundColor: "#ffffff",
    height: height * 0.45,
    flexDirection: "column",
    padding: 40,
    alignItems: "center",
    gap: 25,
    marginBottom: 16,
  },
  title: {
    flexDirection: "row",
    gap: width * 0.01,
    width: width * 0.8,
    justifyContent: "center",
  },
  backButton: {
    width: width * 0.1,
  },
  line: {
    backgroundColor: "#f2f6fc",
    borderBottomColor: "#4b4b4b",
    borderBottomWidth: 1,
    width: width * 0.6,
    marginHorizontal: width * 0.2,
  },
  optionContainer: {
    padding: 30,
    flexDirection: "column",
    alignItems: "flex-start",
    paddingLeft: width / 10,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    gap: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    gap: 8,
  },
  editButton: {
    borderColor: "#2666de",
    minWidth: 140,
  },
  saveButton: {
    borderColor: "#4CAF50",
    minWidth: 100,
  },
  cancelButton: {
    borderColor: "#F44336",
    minWidth: 100,
  },
  buttonText: {
    fontFamily: "Poppins-Medium",
    fontSize: 16,
  },
  editButtonText: {
    color: "#2666de",
    fontWeight: "bold",
  },
  saveButtonText: {
    color: "#4CAF50",
    fontWeight: "bold",
  },
  cancelButtonText: {
    color: "#F44336",
    fontWeight: "bold",
  },

  // Loading overlay styles
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    zIndex: 1000,
  },
  loadingOverlay: {
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1001,
  },
  loadingContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
    minWidth: 180,
    minHeight: 180,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  loadingText: {
    fontSize: 16,
    color: "#333",
    fontFamily: "Poppins-Medium",
    marginBottom: 4,
  },
  loadingDotsContainer: {
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#3674B5",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  btnGroup: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    marginTop: height * 0.03,
  },
  keyboardVisiblePadding: {
    paddingBottom: 100, // Thêm padding khi bàn phím hiển thị
  },
});
