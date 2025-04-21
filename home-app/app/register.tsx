import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  ScrollView,
  Animated,
  Easing,
} from "react-native";
import { Checkbox } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import { Dimensions } from "react-native";
import { BlurView } from "expo-blur";
import InputUserNameBox from "@/components/InputUserNameBox";
import InputPasswordBox from "@/components/InputPasswordBox";
import ButtonAuth from "@/components/ButtonAuth";
import ButtonLoginGoogle from "@/components/ButtonLoginGoogle";
import { Ionicons } from "@expo/vector-icons";
import RegisterPageFirst from "@/components/RegisterPageFirst";
import RegisterPageSecond from "@/components/RegisterPageSecond";
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
          <Text style={styles.loadingText}>Creating account</Text>
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
    opacity: animated as unknown as number,
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

const RegisterScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [usernameAdafruit, setUsernameAdafruit] = useState("");
  const [keyAdafruit, setKeyAdafruit] = useState("");
  const [error, setError] = useState("");
  const [isNext, setIsNext] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const backendUrl = `https://smartdkdh.onrender.com`;
  const signupApiUrl = `${backendUrl}/api/users`;

  const handleReturnToLogin = () => {
    router.push("/login");
  };

  const togglePage = () => {
    setIsNext((prev) => !prev);
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
      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, message: data.detail || "Registration failed" };
      }
    } catch (error) {
      console.error("Error signing up:", error);
      return { success: false, message: "Connection error" };
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
      Alert.alert("Thông báo", "Vui lòng điền đầy đủ thông tin!");
      return;
    }
    
    // Check if email is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Thông báo", "Email không hợp lệ!");
      return;
    }
    
    // Check if password and confirm password are the same
    if (password !== confirmPassword) {
      Alert.alert("Thông báo", "Mật khẩu không khớp!");
      return;
    }
    
    // Check if password is strong enough
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      Alert.alert(
        "Thông báo",
        "Mật khẩu phải có ít nhất 8 ký tự, bao gồm ít nhất một chữ cái và một số!"
      );
      return;
    }

    // Show loading and perform registration
    setIsLoading(true);
    
    try {
      // Add small delay to show loading animation
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const response = await signUp();
      
      if (response.success) {
        // Wait a bit before showing success message for better UX
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsLoading(false);
        Alert.alert("Thành công", "Đăng ký tài khoản thành công!", [
          { text: "Đăng nhập ngay", onPress: () => router.push("/login") }
        ]);
      } else {
        setIsLoading(false);
        Alert.alert("Thất bại", response.message || "Đăng ký tài khoản thất bại!");
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error signing up:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi đăng ký tài khoản. Vui lòng thử lại sau.");
    }
  };

  return (
    <ScrollView>
      <StatusBar barStyle="dark-content" />
      <View style={{ backgroundColor: "#F2F6FC", height: height*1.1 }}>
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
              disabled={isLoading}
            />
          )}
        </View>
        
        {/* Loading overlay */}
        <LoadingOverlay visible={isLoading} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: width * 0.06,
    gap: height*0.15
  },
  containerLogo: {
    height: height*0.1,
    marginTop: height * 0.1,
    paddingVertical: height * 0.02,
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
  
  // Loading overlay styles
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 1000,
  },
  loadingOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1001,
  },
  loadingContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
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
    borderColor: 'rgba(255, 255, 255, 0.5)',
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

export default RegisterScreen;
