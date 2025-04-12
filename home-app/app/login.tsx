import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Image, // Import Image
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router"; // Dùng để điều hướng
import Constants from "expo-constants"; // Để lấy cấu hình IP/Port

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter(); // Hook điều hướng

  const backendUrl = `http://${Constants.expoConfig?.extra?.serverIp}:${Constants.expoConfig?.extra?.apiPort}`;
  const loginApiUrl = `${backendUrl}/init-adafruit-connection`;

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Vui lòng nhập email và mật khẩu.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(loginApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.detail || "Đăng nhập thất bại. Vui lòng thử lại."
        );
      }

      // Đăng nhập thành công
      if (responseData.success && responseData.user_no !== undefined) {
        const userNo = responseData.user_no;
        // Lưu user_no vào AsyncStorage
        await AsyncStorage.setItem("user_no", JSON.stringify(userNo));
        console.log("Đã lưu user_no:", userNo);

        // Điều hướng đến màn hình chính (tabs), thay thế màn hình login trong stack
        router.replace("/(tabs)"); // Điều hướng đến layout tabs
      } else {
        throw new Error("Phản hồi không hợp lệ từ server.");
      }
    } catch (err: any) {
      console.error("Lỗi đăng nhập:", err);
      setError(err.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
      // Hiển thị thông báo lỗi cụ thể hơn cho người dùng
      Alert.alert(
        "Đăng nhập thất bại",
        err.message || "Đã xảy ra lỗi. Vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.innerContainer}>
          {/* Thêm logo hoặc tiêu đề */}
          <Image
            source={require("../assets/images/icon.png")} // Thay bằng đường dẫn logo của bạn
            style={styles.logo}
          />
          <Text style={styles.title}>Đăng nhập</Text>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#aaa"
          />
          <TextInput
            style={styles.input}
            placeholder="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#aaa"
          />

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Đăng nhập</Text>
            )}
          </TouchableOpacity>
          {/* Có thể thêm nút "Quên mật khẩu?" hoặc "Đăng ký" ở đây */}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 30,
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
    color: "#333", // Màu chữ khi nhập
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#007AFF", // Màu xanh dương đặc trưng
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: "#a0c8ff", // Màu nhạt hơn khi loading
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    marginBottom: 15,
    textAlign: "center",
  },
});

export default LoginScreen;
