import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  StatusBar,
  TouchableOpacity,
  Pressable,
  Dimensions,
  Animated,
  Easing,
} from "react-native";
import { Checkbox } from "react-native-paper";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur"; 
import InputUserNameBox from "@/components/InputUserNameBox";
import InputPasswordBox from "@/components/InputPasswordBox";
import ButtonAuth from "@/components/ButtonAuth";
import ButtonLoginGoogle from "@/components/ButtonLoginGoogle";
const { width, height } = Dimensions.get("window"); 

interface LoadingOverlayProps {
  visible: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ visible }) => {
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
            easing: Easing.out(Easing.cubic)
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
            easing: Easing.out(Easing.back(1.5))
          })
        ])
      ]).start();
      
      // Start rotating animation
      Animated.loop(
        Animated.timing(rotation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
          easing: Easing.linear
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
          })
        ]),
        // Then fade out the background blur
        Animated.timing(blurOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible, opacity, blurOpacity, scale, rotation]);
  
  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });
  
  if (!visible) return null;
  
  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Semi-transparent overlay that darkens the background */}
      <Animated.View 
        style={[
          StyleSheet.absoluteFill, 
          styles.overlay,
          { opacity: blurOpacity }
        ]} 
      />
      
      {/* Blur effect layer */}
      <BlurView 
        intensity={30} 
        tint="dark"
        style={[
          StyleSheet.absoluteFill, 
          styles.loadingOverlay
        ]}
      >
        {/* Loading container with animations */}
        <Animated.View 
          style={[
            styles.loadingContainer,
            { 
              opacity,
              transform: [
                { scale },
              ]
            }
          ]}
        >
          <Animated.View style={{ transform: [{ rotate: spin }], marginBottom: 16 }}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoLetter}>Y</Text>
            </View>
          </Animated.View>
          <Text style={styles.loadingText}>Logging in</Text>
          <View style={styles.loadingDotsContainer}>
            <LoadingDots />
          </View>
        </Animated.View>
      </BlurView>
    </View>
  );
};

// Animated dots for the loading indicator
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
          useNativeDriver: true
        }),
        Animated.timing(dot2, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true
        }),
        Animated.timing(dot3, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true
        }),
        Animated.parallel([
          Animated.timing(dot1, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true
          }),
          Animated.timing(dot2, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true
          }),
          Animated.timing(dot3, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true
          })
        ])
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
    backgroundColor: '#3674B5',
    marginHorizontal: 4,
    opacity: animated as unknown as number, // Type assertion needed for animated values
    transform: [
      {
        scale: animated.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.5]
        })
      }
    ]
  });
  
  return (
    <View style={{ flexDirection: 'row', marginTop: 8 }}>
      <Animated.View style={dotStyle(dot1)} />
      <Animated.View style={dotStyle(dot2)} />
      <Animated.View style={dotStyle(dot3)} />
    </View>
  );
};

interface UserData {
  name: string;
  username_adafruit: string;
  key_adafruit: string;
  [key: string]: string;
}

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  const backendUrl = `https://smartdkdh.onrender.com`;
  const loginApiUrl = `${backendUrl}/init-adafruit-connection`;
  
  async function fetchUserData(userId: number): Promise<UserData> {
    if (userId == null) throw new Error(`User id is null`);
    try {
      const response = await fetch(`https://smartdkdh.onrender.com/api/users/${userId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user data: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data as UserData;
    } catch (error) {
      console.error("Error fetching user data:", error);
      throw error;
    }
  }

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Vui lòng nhập email và mật khẩu.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Delay slightly to allow loading animation to start
      await new Promise(resolve => setTimeout(resolve, 300));
      
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
        const userData = await fetchUserData(userNo);
        
        if (!userData) {
          throw new Error("Phản hồi không hợp lệ từ server.");
        }
        
        // Lưu user_no, email và password vào AsyncStorage
        await AsyncStorage.setItem("user_no", JSON.stringify(userNo));
        await AsyncStorage.setItem("user_name", userData.name);
        await AsyncStorage.setItem("user_ada", userData.username_adafruit);
        await AsyncStorage.setItem("user_key", userData.key_adafruit);
        await AsyncStorage.setItem("user_email", email);
        await AsyncStorage.setItem("user_password", password);

        // Small delay before navigating for smooth transition
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Navigate to the main screen (tabs)
        router.replace("/(tabs)");
      } else {
        throw new Error("Phản hồi không hợp lệ từ server.");
      }
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
      Alert.alert(
        "Đăng nhập thất bại",
        err.message || "Đã xảy ra lỗi. Vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckboxPress = () => {
    setChecked((prev) => !prev);
  };

  return (
    <>
      <StatusBar backgroundColor={'#f2f6fc'}/>
      <View style={{ height: height*1.1, width: "100%", backgroundColor: "#F2F6FC" }}>
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
                    status={!checked ? "checked" : "unchecked"}
                    color="#2C5DBA"
                  />
                  <Text style={styles.normalText}>Remember me</Text>
                </Pressable>
              </View>

              {/* Forgot password */}
              <View style={styles.forgotPasswordBox}>
                <Text style={{fontFamily:'Poppins-Regular'}}>Forgot password</Text>
              </View>
            </View>
            
            {/* Login Normal*/}
            <View style={styles.buttonLoginBox}>
              <ButtonAuth 
                title="Login" onPress={handleLogin} 
                // @ts-ignore
                disabled={isLoading} 
              />
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
              <ButtonLoginGoogle 
                onPress={() => {}} 
                // @ts-ignore
                disabled={isLoading} 
              />
            </View>
          </View>
        </View>
        
        {/* Loading overlay */}
        <LoadingOverlay visible={isLoading} />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    height: "auto",
    marginHorizontal: width * 0.06,
    gap: height*0.12,
  },
  containerLogo: {
    marginTop: height * 0.1,
    height: height*0.08,
    paddingVertical: height < 900 ? height*0.015: height * 0.018,
  },
  logoBox: {
    margin: 0,
    padding: 0,
  },
  logoText: {
    color: "#3674B5",
    fontSize: 33,
    fontFamily:'Poppins-Bold'
  },
  signupLabel: {
    paddingTop: height * 0.015,
    flexDirection: "row",
  },
  normalText: {
    color: "black",
    fontSize: 15,
    fontFamily:'Poppins-Regular'
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
  checkbox: { 
    flexDirection: "row", 
    alignItems: "center" 
  },
  forgotPasswordBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 15
  },
  buttonLoginBox: { 
    alignItems: "center", 
    marginVertical: height * 0.05 
  },
  lineSeperateBox: {
    flexDirection: "row",
    alignItems: "center",
  },
  line: { 
    borderBottomWidth: 1, 
    flex: 1, 
    borderColor: "#CFD2D7" 
  },
  
  // Loading overlay styles
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Dark overlay for better blur contrast
    zIndex: 1000,
  },
  loadingOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1001, // Above the dark overlay
  },
  loadingContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)', // Slightly transparent container
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
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
    borderColor: 'rgba(255, 255, 255, 0.5)', // Subtle border
  },
  loadingText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Poppins-Medium',
    marginBottom: 4,
  },
  loadingDotsContainer: {
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3674B5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  logoLetter: {
    color: 'white',
    fontSize: 30,
    fontFamily: 'Poppins-Bold',
  },
});

export default LoginScreen;
