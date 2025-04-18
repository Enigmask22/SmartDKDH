import { Ionicons } from "@expo/vector-icons";
import { PropsWithChildren } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");

// onPress: () => void
const ButtonLoginGoogle = ({
  children,
  onPress,
}: PropsWithChildren & { onPress: () => void }) => {
  return (
    <TouchableOpacity style={styles.buttonBox}>
      <View style={styles.buttonInnerBox}>
        <Image
          source={require("../assets/images/google.png")}
          style={styles.logoButton}
        />
        <Text style={styles.buttonText}>Continue with google</Text>
      </View>
    </TouchableOpacity>
  );
};

export default ButtonLoginGoogle;

const styles = StyleSheet.create({
  buttonBox: {
    width: width * 0.7,
    height: height * 0.06,
    backgroundColor: "white",
    justifyContent: "center",
    borderRadius: 40,
    borderWidth: 1,
  },
  buttonInnerBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  logoButton: { width: 24, height: 24, marginRight: 10, overflow: "hidden" },
  buttonText: {
    color: "black",
    fontSize: 20,
    textAlign: "center",
    alignItems: "center",
  },
});
