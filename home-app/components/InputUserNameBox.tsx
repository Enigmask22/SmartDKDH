import { PropsWithChildren, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");
const InputUserNameBox = ({
  children,
  title,
  data,
  isEmail = false, // Default to false if not provided
  setData,
}: PropsWithChildren & {
  title: string;
  data: string;
  isEmail?: boolean;
  error?: string;
  setData: (name: string) => void;
}) => {
  const handleChangeData = (name: string) => {
    setData(name);
  };

  return (
    <View>
      <View style={styles.boxSpacing}>
        <Text style={styles.normalText}>{title}</Text>
      </View>
      <View style={styles.boxSpacing}>
        <TextInput
          style={styles.input} // Apply error style if error prop is provided
          onChangeText={handleChangeData}
          value={data}
          keyboardType={isEmail ? "email-address" : "default"} // Set keyboard type based on isEmail prop
        />
      </View>
    </View>
  );
};

export default InputUserNameBox;

const styles = StyleSheet.create({
  normalText: {
    color: "black",
    fontSize: 15,
  },
  boxSpacing: {
    marginBottom: height * 0.009,
  },
  input: {
    width: "100%",
    height: height * 0.06,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "black",
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#333",
  },
});
