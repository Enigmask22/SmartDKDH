import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");

const OnboardingScreen = () => {
  const router = useRouter(); // Hook điều hướng

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <ImageBackground
        source={require("../assets/images/onboarding.png")}
        style={{ flex: 1 }}
      >
        <View style={[styles.container, { marginTop: height * 0.1 }]}>
          <View style={styles.container_top}>
            <Text style={styles.banner_text}>YoloHome</Text>
          </View>
        </View>

        {/* half container */}
        <View style={styles.container}>
          <View>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push("/login")}
            >
              <Text style={styles.buttonText}> Get Started</Text>
            </TouchableOpacity>
          </View>

          <View style={{ marginTop: height * 0.01 }}>
            <Text style={styles.bannerText}>Made by MyTeam</Text>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  container_top: {
    flex: 1,
    justifyContent: "flex-end",
  },
  banner_text: {
    fontSize: 60,
    fontWeight: "bold",
    color: "#203691",
    fontStyle: "italic",
  },
  button: {
    width: width * 0.5,
    height: height * 0.07,
    backgroundColor: "#2C5CB9",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    color: "white",
    fontSize: 23,
    fontWeight: "bold",
  },
  bannerText: {
    fontSize: 17,
    color: "white",
  },
});
export default OnboardingScreen;
