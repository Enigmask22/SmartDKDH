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
  Image,
  Touchable,
  Pressable,
  ScrollView, // Import Image
} from "react-native";
import { Checkbox } from "react-native-paper";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router"; // Dùng để điều hướng
import Constants from "expo-constants"; // Để lấy cấu hình IP/Port
import { Dimensions } from "react-native"; // Để lấy kích thước
import InputUserNameBox from "@/components/InputUserNameBox";
import InputPasswordBox from "@/components/InputPasswordBox";
import ButtonAuth from "@/components/ButtonAuth";
import ButtonLoginGoogle from "@/components/ButtonLoginGoogle";
import { Ionicons } from "@expo/vector-icons";
import RegisterPageFirst from "@/components/RegisterPageFirst";
import RegisterPageSecond from "@/components/RegisterPageSecond";
const { width, height } = Dimensions.get("window"); // L

const RegisterScreen = () => {
  const router = useRouter(); // Hook điều hướng
  const [email, setEmail] = useState("");
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [usernameAdafruit, setUsernameAdafruit] = useState("");
  const [keyAdafruit, setKeyAdafruit] = useState("");
  const [error, setError] = useState("");
  const [isNext, setIsNext] = useState(false); // Trạng thái để điều hướng đến trang tiếp theo

  const backendUrl = `https://smartdkdh.onrender.com`;
  const signupApiUrl = `${backendUrl}/api/users`;

  const handleReturnToLogin = () => {
    router.push("/login"); // Điều hướng
  };

  const togglePage = () => {
    setIsNext((prev) => !prev); // Trở về trang trước
  };

  const signUp = async () => {
    try {
      const response = await fetch(signupApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: username,
          email: email,
          password: password,
          username_adafruit: usernameAdafruit,
          key_adafruit: keyAdafruit,
        }),
      });
      const data = await response.json();
      // console.log("Response data:", data); // Log dữ liệu trả về từ API
      if (response.ok) {
        return { success: true };
      } else {
        return { success: false };
      }
    } catch (error) {
      console.error("Error signing up:", error);
      return { success: false };
    }
  };

  const handleSignUp = async () => {
    if (
      !email ||
      !username ||
      !password ||
      !confirmPassword ||
      !usernameAdafruit ||
      !keyAdafruit
    ) {
      Alert.alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    //check if email is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Email không hợp lệ!");
      return;
    }
    // check if password and confirm password are the same
    if (password !== confirmPassword) {
      Alert.alert("Mật khẩu không khớp!");
      return;
    }
    // check if password is strong enough
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/; // At least 8 characters, at least one letter and one number
    if (!passwordRegex.test(password)) {
      Alert.alert(
        "Mật khẩu phải có ít nhất 8 ký tự, bao gồm ít nhất một chữ cái và một số!"
      );
      return;
    }

    // call api to register user
    // signUp();
    try {
      const response = await signUp();
      if (response.success) {
        Alert.alert("Đăng ký thành công!");
        router.push("/login"); // Điều hướng về trang đăng nhập
      } else {
        Alert.alert("Đăng ký thất bại!");
      }
    } catch (error) {
      console.error("Error signing up:", error);
      Alert.alert("Đăng ký thất bại!");
    }
  };

  return (
    <ScrollView>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        {/* Logo */}
        <View style={{ backgroundColor: "#F2F6FC" }}>
          <View style={styles.container}>
            {/* Logo */}
            <View style={styles.containerLogo}>
              <View style={styles.logoBox}>
                <Text style={styles.logoText}>Create An</Text>
              </View>
              <View style={styles.logoBox}>
                <Text style={styles.logoText}>Account</Text>
              </View>
            </View>

            {!isNext ? (
              // Register page 1
              <RegisterPageFirst
                email={email}
                setEmail={setEmail}
                username={username}
                setUserName={setUserName}
                password={password}
                setPassword={setPassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
                handleReturnToLogin={handleReturnToLogin}
                togglePage={togglePage}
              />
            ) : (
              // Register page 2
              <RegisterPageSecond
                usernameAdafruit={usernameAdafruit}
                setUsernameAdafruit={setUsernameAdafruit}
                keyAdafruit={keyAdafruit}
                setKeyAdafruit={setKeyAdafruit}
                handleSignUp={handleSignUp}
                togglePage={togglePage}
              />
            )}
          </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};
export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: width * 0.06,
  },
  containerLogo: {
    marginTop: height * 0.1,
    paddingVertical: height * 0.02,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#F2F6FC",
    height: height,
    width: width,
  },
  logoBox: {
    margin: 0,
    padding: 0,
  },
  logoText: {
    color: "#3674B5",
    fontSize: 33,
    fontWeight: "bold",
  },
});
