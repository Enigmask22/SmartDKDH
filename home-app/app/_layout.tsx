import React, { useState, useEffect } from "react";
import { Stack, useRouter, SplashScreen } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, View, StyleSheet } from "react-native";

// Ngăn không cho splash screen tự động ẩn đi
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false); // Trạng thái sẵn sàng của app
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null); // Trạng thái đăng nhập (null: đang kiểm tra)
  const router = useRouter();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userNo = await AsyncStorage.getItem("user_no");
        setIsLoggedIn(userNo !== null); // Nếu có user_no thì đã đăng nhập
        console.log("Trạng thái đăng nhập:", userNo !== null);
      } catch (e) {
        console.error("Lỗi kiểm tra trạng thái đăng nhập:", e);
        setIsLoggedIn(false); // Mặc định là chưa đăng nhập nếu có lỗi
      } finally {
        setIsReady(true); // Đánh dấu app đã sẵn sàng để hiển thị UI
      }
    };

    checkLoginStatus();
  }, []); // Chạy 1 lần khi layout mount

  useEffect(() => {
    if (isReady) {
      // Khi đã sẵn sàng, ẩn splash screen
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
  }, [isReady, isLoggedIn, router]); // Chạy lại khi isReady hoặc isLoggedIn thay đổi

  if (!isReady) {
    // Hiển thị màn hình loading đơn giản trong khi kiểm tra AsyncStorage
    // hoặc có thể để Splash Screen hiển thị lâu hơn một chút
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
    <Stack screenOptions={{ headerShown: false }}>
      {/*
        Screen cho login và tabs sẽ được định nghĩa trong thư mục app
        và được Expo Router tự động xử lý dựa trên điều hướng.
        Chúng ta không cần khai báo trực tiếp ở đây nếu dùng file-based routing.
      */}
      <Stack.Screen name="login" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
