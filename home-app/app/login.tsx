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
const { width, height } = Dimensions.get("window"); // L

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter(); // Hook điều hướng
  const [checked, setChecked] = useState(false); // State cho checkbox

  // const backendUrl = `http://${Constants.expoConfig?.extra?.serverIp}:${Constants.expoConfig?.extra?.apiPort}`;
  const backendUrl = `https://smartdkdh.onrender.com`;
  const loginApiUrl = `${backendUrl}/init-adafruit-connection`;

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Vui lòng nhập email và mật khẩu.");
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
        // Lưu user_no, email và password vào AsyncStorage
        await AsyncStorage.setItem("user_no", JSON.stringify(userNo));
        await AsyncStorage.setItem("user_email", email);
        await AsyncStorage.setItem("user_password", password);
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

  const handleCheckboxPress = () => {
    setChecked((prev) => !prev); // Đảo ngược trạng thái checkbox
  };

  return (
    // <SafeAreaView style={styles.safeArea}>
    //   <StatusBar barStyle="dark-content" backgroundColor="#fff" />
    //   <KeyboardAvoidingView
    //     behavior={Platform.OS === "ios" ? "padding" : "height"}
    //     style={styles.container}
    //   >
    //     <View style={styles.innerContainer}>
    //       {/* Thêm logo hoặc tiêu đề */}
    //       <Image
    //         source={require("../assets/images/icon.png")} // Thay bằng đường dẫn logo của bạn
    //         style={styles.logo}
    //       />
    //       <Text style={styles.title}>Đăng nhập</Text>

    //       {error && <Text style={styles.errorText}>{error}</Text>}

    //       <TextInput
    //         style={styles.input}
    //         placeholder="Email"
    //         value={email}
    //         onChangeText={setEmail}
    //         keyboardType="email-address"
    //         autoCapitalize="none"
    //         placeholderTextColor="#aaa"
    //       />
    //       <TextInput
    //         style={styles.input}
    //         placeholder="Mật khẩu"
    //         value={password}
    //         onChangeText={setPassword}
    //         secureTextEntry
    //         placeholderTextColor="#aaa"
    //       />

    //       <TouchableOpacity
    //         style={[styles.button, isLoading && styles.buttonDisabled]}
    //         onPress={handleLogin}
    //         disabled={isLoading}
    //       >
    //         {isLoading ? (
    //           <ActivityIndicator size="small" color="#ffffff" />
    //         ) : (
    //           <Text style={styles.buttonText}>Đăng nhập</Text>
    //         )}
    //       </TouchableOpacity>
    //       {/* Có thể thêm nút "Quên mật khẩu?" hoặc "Đăng ký" ở đây */}
    //       <TouchableOpacity
    //         onPress={() => router.push("/register")} //
    //       >
    //         <Text style={{ marginTop: 20, color: "#007AFF" }}>
    //           Chưa có tài khoản? Đăng ký
    //         </Text>
    //       </TouchableOpacity>
    //     </View>
    //   </KeyboardAvoidingView>
    // </SafeAreaView>
    <ScrollView>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        {/* Logo */}
        <View
          style={{ height: "100%", width: "100%", backgroundColor: "#F2F6FC" }}
        >
          <View style={styles.container}>
            {/* Logo */}
            <View style={styles.containerLogo}>
              <View style={styles.logoBox}>
                <Text style={styles.logoText}>Welcome To</Text>
              </View>
              <View style={styles.logoBox}>
                <Text style={styles.logoText}>YoloHome</Text>
              </View>

              {/* sign up */}
              <View style={styles.signupLabel}>
                <View>
                  <Text style={styles.normalText}>Don't have account? </Text>
                </View>
                <TouchableOpacity onPress={() => router.push("/register")}>
                  <View>
                    <Text style={[styles.normalText, styles.signupText]}>
                      Sign up
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Input Box */}
            <View>
              <InputUserNameBox
                title={"Email address or user name"}
                data={email}
                setData={setEmail}
              />
              <InputPasswordBox
                title={"Password"}
                password={password}
                setPassword={setPassword}
              />

              <View style={styles.remembermeBox}>
                {/* checkbox */}
                <View style={{ flexDirection: "row" }}>
                  <Pressable
                    onPress={handleCheckboxPress}
                    style={styles.checkbox}
                  >
                    <Checkbox
                      status={checked ? "checked" : "unchecked"}
                      // onPress={handleCheckboxPress}
                      color="#2C5DBA"
                    />
                    <Text style={styles.normalText}>Remember me</Text>
                  </Pressable>
                </View>

                {/* Forgot password */}
                <View style={styles.forgotPasswordBox}>
                  <Text>Forgot password</Text>
                </View>
              </View>
              {/* Loggin Normal*/}
              <View style={styles.buttonLoginBox}>
                <ButtonAuth title="Login" onPress={handleLogin} />
              </View>

              <View style={styles.lineSeperateBox}>
                <View style={styles.line} />
                <Text
                  style={[
                    styles.normalText,
                    { marginHorizontal: width * 0.03 },
                  ]}
                >
                  OR
                </Text>
                <View style={styles.line} />
              </View>
              <View style={styles.buttonLoginBox}>
                <ButtonLoginGoogle onPress={() => {}} />
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: "#F2F6FC",
//   },
//   container: {
//     flex: 1,
//   },
//   innerContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     paddingHorizontal: 30,
//   },
//   logo: {
//     width: 100,
//     height: 100,
//     resizeMode: "contain",
//     marginBottom: 30,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: "bold",
//     color: "#333",
//     marginBottom: 30,
//   },
//   input: {
//     width: "100%",
//     height: 50,
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 8,
//     paddingHorizontal: 15,
//     marginBottom: 15,
//     fontSize: 16,
//     backgroundColor: "#f9f9f9",
//     color: "#333", // Màu chữ khi nhập
//   },
//   button: {
//     width: "100%",
//     height: 50,
//     backgroundColor: "#007AFF", // Màu xanh dương đặc trưng
//     justifyContent: "center",
//     alignItems: "center",
//     borderRadius: 8,
//     marginTop: 10,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 3,
//     elevation: 3,
//   },
//   buttonDisabled: {
//     backgroundColor: "#a0c8ff", // Màu nhạt hơn khi loading
//   },
//   buttonText: {
//     color: "#ffffff",
//     fontSize: 18,
//     fontWeight: "bold",
//   },
//   errorText: {
//     color: "red",
//     marginBottom: 15,
//     textAlign: "center",
//   },
// });

const styles = StyleSheet.create({
  container: {
    height: "auto",
    marginHorizontal: width * 0.06,
    // backgroundColor: "green",
  },
  containerLogo: {
    marginTop: height * 0.1,
    // backgroundColor: "red",
    height: "auto",
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
    // borderColor: "black",
    // borderWidth: 2,
  },
  logoText: {
    color: "#3674B5",
    fontSize: 33,
    fontWeight: "bold",
  },
  signupLabel: {
    paddingTop: height * 0.01,
    flexDirection: "row",
  },
  normalText: {
    color: "black",
    fontSize: 15,
  },
  signupText: {
    color: "#186DA1",
    textDecorationLine: "underline",
    textDecorationColor: "#186DA1",
  },
  remembermeBox: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  checkbox: { flexDirection: "row", alignItems: "center" },
  forgotPasswordBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 15,
  },
  buttonLoginBox: { alignItems: "center", marginVertical: height * 0.05 },
  lineSeperateBox: {
    flexDirection: "row",
    alignItems: "center",
  },
  line: { borderBottomWidth: 1, flex: 1, borderColor: "#CFD2D7" },
});

export default LoginScreen;
