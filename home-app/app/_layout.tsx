import React, { useState, useEffect } from "react";
import { Stack, useRouter, SplashScreen } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, View, StyleSheet, Alert } from "react-native";
import Constants from "expo-constants"; // Thêm để lấy cấu hình URL
import { store } from "@/store";
import { Provider } from "react-redux";

// Ngăn không cho splash screen tự động ẩn đi
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false); // Trạng thái sẵn sàng của app
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null); // Trạng thái đăng nhập (null: đang kiểm tra)
  const [isConnecting, setIsConnecting] = useState(false); // Trạng thái đang kết nối với Adafruit
  const router = useRouter();

  // Lấy thông tin URL backend từ cấu hình
  // const backendUrl = `http://${Constants.expoConfig?.extra?.serverIp}:${Constants.expoConfig?.extra?.apiPort}`;
  const backendUrl = `https://smartdkdh.onrender.com`;
  const adafruitApiUrl = `${backendUrl}/init-adafruit-connection`;

  // Hàm để khởi tạo kết nối Adafruit
  const initAdafruitConnection = async (email: string, password: string) => {
    setIsConnecting(true);
    try {
      console.log("Đang kết nối với Adafruit...");
      const response = await fetch(adafruitApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.detail || "Kết nối Adafruit thất bại.");
      }

      console.log("Kết nối Adafruit thành công");
      return true;
    } catch (err: any) {
      console.error("Lỗi kết nối Adafruit:", err);
      Alert.alert(
        "Kết nối thất bại",
        "Không thể kết nối với Adafruit. Bạn có thể thử đăng nhập lại.",
        [
          { text: "Đăng nhập lại", onPress: () => logOut() },
          { text: "Bỏ qua", style: "cancel" },
        ]
      );
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  // Hàm đăng xuất khi có lỗi
  const logOut = async () => {
    try {
      await AsyncStorage.multiRemove([
        "user_no",
        "user_email",
        "user_password",
      ]);
      setIsLoggedIn(false);
      router.replace("/login");
    } catch (e) {
      console.error("Lỗi khi đăng xuất:", e);
    }
  };

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userNo = await AsyncStorage.getItem("user_no");
        const hasLoggedIn = userNo !== null;
        setIsLoggedIn(hasLoggedIn); // Nếu có user_no thì đã đăng nhập

        // Nếu đã đăng nhập, thử kết nối với Adafruit
        if (hasLoggedIn) {
          const email = await AsyncStorage.getItem("user_email");
          const password = await AsyncStorage.getItem("user_password");

          if (email && password) {
            const connectionSuccess = await initAdafruitConnection(
              email,
              password
            );
            // Nếu kết nối thất bại nhưng người dùng chọn "Bỏ qua", vẫn cho phép vào app
            // Sẽ hiển thị thông báo lỗi nếu cần thiết trong initAdafruitConnection
          }
        }

        // Đánh dấu app đã sẵn sàng để hiển thị UI
        setIsReady(true);
      } catch (e) {
        console.error("Lỗi kiểm tra trạng thái đăng nhập:", e);
        setIsLoggedIn(false); // Mặc định là chưa đăng nhập nếu có lỗi
        setIsReady(true); // Vẫn đánh dấu là sẵn sàng để có thể hiển thị màn hình login
      }
    };

    checkLoginStatus();
  }, []); // Chạy 1 lần khi layout mount

  useEffect(() => {
    if (isReady && !isConnecting) {
      // Khi đã sẵn sàng và không đang kết nối, ẩn splash screen
      SplashScreen.hideAsync();

      // Điều hướng dựa trên trạng thái đăng nhập
      if (isLoggedIn === true) {
        // Đảm bảo người dùng đang ở màn hình tabs nếu họ đã đăng nhập
        // Dùng replace để không quay lại được màn hình loading/login
        router.replace("/(tabs)");
      } else if (isLoggedIn === false) {
        // Đảm bảo người dùng đang ở màn hình login nếu họ chưa đăng nhập
        router.replace("/login");
      }
      // Nếu isLoggedIn là null, không làm gì cả, đợi useEffect tiếp theo
    }
  }, [isReady, isLoggedIn, isConnecting, router]); // Chạy lại khi isReady, isLoggedIn hoặc isConnecting thay đổi

  if (!isReady || isConnecting) {
    // Hiển thị màn hình loading khi đang kiểm tra AsyncStorage hoặc đang kết nối Adafruit
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Sử dụng Stack layout gốc
  // Expo Router sẽ tự động quản lý việc hiển thị screen nào dựa trên URL/state
  // và điều hướng chúng ta thực hiện ở trên.
  return (
    <Provider store={store}>
      <Stack screenOptions={{ headerShown: false }}>
        {/*
          Screen cho login và tabs sẽ được định nghĩa trong thư mục app
          và được Expo Router tự động xử lý dựa trên điều hướng.
          Chúng ta không cần khai báo trực tiếp ở đây nếu dùng file-based routing.
        */}
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(list)" />
      </Stack>
    </Provider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
