import { PropsWithChildren } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");

// title: string
const ButtonAuth = ({
  children,
  title,
  onPress,
}: PropsWithChildren & { title: string; onPress: () => void }) => {
  return (
    <TouchableOpacity style={styles.buttonBox} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

export default ButtonAuth;

const styles = StyleSheet.create({
  buttonBox: {
    width: width * 0.7,
    height: height * 0.06,
    backgroundColor: "#2C5CB9",
    justifyContent: "center",
    borderRadius: 40,
  },
  buttonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
});
