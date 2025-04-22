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
  Image,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
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
import { Ionicons, Feather, MaterialIcons } from "@expo/vector-icons";
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
            <LinearGradient
              colors={['#3674B5', '#5E9DE8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoCircle}
            >
              <MaterialIcons name="home" size={30} color="white" />
            </LinearGradient>
          </Animated.View>
          <Text style={styles.loadingText}>Creating an account</Text>
          <Text style={styles.loadingSubText}>Please wait a moment...</Text>
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
    <View style={{ flexDirection: 'row', marginTop: 12 }}>
      <Animated.View style={dotStyle(dot1)} />
      <Animated.View style={dotStyle(dot2)} />
      <Animated.View style={dotStyle(dot3)} />
    </View>
  );
};

// Progress indicator component
const ProgressIndicator: React.FC<{isNext: boolean}> = ({ isNext }) => {
  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressStepWrapper}>
        <View style={[styles.progressStep, styles.progressStepCompleted]}>
          <Ionicons name="checkmark" size={16} color="#fff" />
        </View>
        <View style={[styles.progressLine, isNext ? styles.progressLineCompleted : {}]} />
      </View>
      <View style={styles.progressStepWrapper}>
        <View style={[styles.progressStep, isNext ? styles.progressStepCompleted : {}]}>
          {isNext && <Ionicons name="checkmark" size={16} color="#fff" />}
        </View>
      </View>
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
      Alert.alert("Notice", "Please fill in all the required information!");
      return;
    }
    
    // Check if email is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Notice", "Invalid email!");
      return;
    }
    
    // Check if password and confirm password are the same
    if (password !== confirmPassword) {
      Alert.alert("Notice", "Passwords do not match!");
      return;
    }
    
    // Check if password is strong enough
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      Alert.alert(
        "Notice",
        "Password must be at least 8 characters long and include at least one letter and one number!"
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
        Alert.alert("Success", "Account registration successful!", [
          { text: "Log in now", onPress: () => router.push("/login") }
        ]);
      } else {
        setIsLoading(false);
        Alert.alert("Failed", response.message || "Account registration was unsuccessful!");
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error signing up:", error);
      Alert.alert("Error", "An error occurred while registering your account. Please try again later.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backBtn} 
            onPress={handleReturnToLogin}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        
        {/* Main container */}
        <View style={styles.mainContainer}>
          {/* Title section */}
          <View style={styles.titleContainer}>
            <LinearGradient
              colors={['#3674B5', '#5E9DE8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.titleIcon}
            >
              <MaterialIcons name="person-add" size={24} color="white" />
            </LinearGradient>
            <Text style={styles.titleText}>Create an account</Text>
            <Text style={styles.subtitleText}>
              {isNext 
                ? "Connect with Adafruit IO to easily manage your IoT devices." 
                : "Just a few details to get started."
              }
            </Text>
          </View>
          
          {/* Progress indicator */}
          <ProgressIndicator isNext={isNext} />
          
          {/* Step indicator */}
          <View style={styles.stepIndicator}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepText}>Step {isNext ? "2" : "1"} / 2</Text>
            </View>
          </View>
          
          {/* Form container with improved styling */}
          <View style={styles.formContainer}>
            {!isNext ? (
              // Form page 1 (using existing component but with custom wrapper)
              <View style={styles.formPage}>
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
              </View>
            ) : (
              // Form page 2 (using existing component but with custom wrapper)
              <View style={styles.formPage}>
                <RegisterPageSecond
                  usernameAdafruit={usernameAdafruit}
                  setUsernameAdafruit={setUsernameAdafruit}
                  keyAdafruit={keyAdafruit}
                  setKeyAdafruit={setKeyAdafruit}
                  handleSignUp={handleSignUp}
                  togglePage={togglePage}
                  disabled={isLoading}
                />
              </View>
            )}
          </View>
          
          {/* Footer with additional help */}
          <View style={styles.footer}>
            <View style={styles.divider}>
              <View style={styles.line}></View>
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.line}></View>
            </View>
            
            <View style={styles.footerButtons}>
              {!isNext ? (
                // First page footer - Google login option
                <TouchableOpacity style={styles.googleButton}>
                  <Image 
                    source={require('@/assets/images/google.png')} 
                    style={styles.googleIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.googleText}>Continue with Google</Text>
                </TouchableOpacity>
              ) : (
                // Second page footer - Help info
                <View style={styles.helpContainer}>
                  <MaterialIcons name="help-outline" size={20} color="#3674B5" />
                  <Text style={styles.helpText}>
                    Log in to your Adafruit account to access your Adafruit IO information.
                  </Text>
                </View>
              )}
            </View>
            
            {/* Login redirection */}
            <View style={styles.loginRedirect}>
              <Text style={styles.redirectText}>Already have an account?</Text>
              <TouchableOpacity onPress={handleReturnToLogin}>
                <Text style={styles.loginLink}>Log in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
      
      {/* Loading overlay */}
      <LoadingOverlay visible={isLoading} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
    paddingTop: Constants.statusBarHeight,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  titleContainer: {
    marginTop: 10,
    marginBottom: 30,
    alignItems: 'center',
  },
  titleIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleText: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    textAlign: 'center',
    maxWidth: '90%',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  progressStepWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressStep: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E0E0E0',
    borderWidth: 2,
    borderColor: '#D0D0D0',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  progressStepCompleted: {
    backgroundColor: '#3674B5',
    borderColor: '#3674B5',
  },
  progressLine: {
    height: 3,
    width: 100,
    backgroundColor: '#E0E0E0',
  },
  progressLineCompleted: {
    backgroundColor: '#3674B5',
  },
  stepIndicator: {
    alignItems: 'center',
    marginBottom: 20,
  },
  stepBadge: {
    backgroundColor: '#F0F7FF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D6E8FF',
  },
  stepText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#3674B5',
  },
  formContainer: {
    backgroundColor: '#F7FAFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 30,
  },
  formPage: {
    // Give some space for the modified RegisterPage components
  },
  footer: {
    marginTop: 10,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    paddingHorizontal: 10,
    color: '#888',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  footerButtons: {
    marginBottom: 30,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  googleIcon: {
    width: 20,
    height: 20,
  },
  googleText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#333',
  },
  helpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D6E8FF',
    gap: 10,
  },
  helpText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#444',
    lineHeight: 20,
  },
  loginRedirect: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  redirectText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  loginLink: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#3674B5',
  },
  
  // Loading overlay styles
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  loadingOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1001,
  },
  loadingContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
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
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  loadingSubText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  loadingDotsContainer: {
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
});

export default RegisterScreen;
