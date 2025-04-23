import { Ionicons } from "@expo/vector-icons";
import { PropsWithChildren, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Platform,
  Dimensions,
  TouchableOpacity,
} from "react-native";

const { width, height } = Dimensions.get("window");

export const InputBox = ({
  children,
  title,
  data,
  setData,
  isEmail,
  error,
  editable = false, // Default to false if not provided
}: PropsWithChildren & {
  title: string;
  data: string;
  isEmail?: boolean;
  error?: string;
  editable?: boolean; // Thêm prop này
  setData: (name: string) => void;
}) => {
  const handleChangeData = (name: string) => {
    setData(name);
  };

  return (
    <View style={styles.container}>
      <View style={styles.boxSpacing}>
        <Text style={styles.normalText}>{title}</Text>
      </View>
      <View style={styles.boxSpacing}>
        <TextInput
          style={[
            title == "Password" ? styles.passwordInput : styles.input,
            error && styles.inputError, // Apply error style if error prop exists
            Platform.OS === "ios" ? styles.inputIOS : {},
            !editable && styles.disabledInput,
          ]}
          editable={editable} // Disable editing if isDisabled is true
          onChangeText={handleChangeData}
          value={title === "Password" ? "••••••••••••••••••••••••••" : data}
          keyboardType={isEmail ? "email-address" : "default"}
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    </View>
  );
};

export const InputHiddenBox = ({
  children,
  title,
  data,
  setData,
  isEmail,
  error,
  editable = false, // Default to false if not provided
}: PropsWithChildren & {
  title: string;
  data: string;
  isEmail?: boolean;
  error?: string;
  setData: (name: string) => void;
  editable?: boolean; // Thêm prop này
}) => {
  const [hidden, setHidden] = useState(true); // State to manage password visibility
  const value = data;

  function handleHidden() {
    setHidden((prev) => !prev); // Toggle password visibility
  }

  const handleChangeData = (text: string) => {
    setData(text); // Gọi hàm setData để cập nhật giá trị
  };

  return (
    <View style={styles.container}>
      <View style={styles.boxTitle}>
        <Text style={styles.normalText}>{title}</Text>
        <TouchableOpacity onPress={handleHidden}>
          <Ionicons
            name={hidden ? "eye-off" : "eye"}
            size={15}
            color={"gray"}
            style={{ paddingTop: 4 }}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.boxSpacing}>
        <TextInput
          style={[
            title == "Password" ? styles.passwordInput : styles.input,
            error && styles.inputError, // Apply error style if error prop exists
            Platform.OS === "ios" ? styles.inputIOS : {},
            !editable && styles.disabledInput,
          ]}
          editable={editable} // Disable editing if isDisabled is true
          onChangeText={handleChangeData}
          value={hidden ? "••••••••••••••••••••••••••" : value}
          keyboardType={isEmail ? "email-address" : "default"}
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width * 0.9,
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
    alignItems: "center",
  },
  normalText: {
    color: "black",
    fontFamily: "Rubik-Regular",
    fontSize: height < 900 ? 15 : 20,
  },
  boxTitle: {
    marginBottom: height * 0.009,
    flexDirection: "row",
    gap: 5,
  },
  boxSpacing: {
    marginBottom: height * 0.009,
  },
  input: {
    width: width * 0.5,
    height: height * 0.05,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "black",
    paddingHorizontal: 15,
    fontSize: 16,
    fontFamily: "Rubik-Regular",
    color: "#333",
    // Cross-platform fixes
    textAlignVertical: "center", // For Android
    paddingVertical: 0, // Remove default vertical padding
  },
  passwordInput: {
    width: width * 0.5,
    height: height * 0.05,
    borderRadius: 12,
    borderColor: "black",
    paddingHorizontal: 15,
    fontSize: 16,
    fontFamily: "Rubik-Regular",
    color: "#333",
    // Cross-platform fixes
    textAlignVertical: "center", // For Android
    paddingVertical: 0, // Remove default vertical padding
  },
  // iOS-specific fixes
  inputIOS: {
    lineHeight: Math.round(height * 0.05), // Match with height
    paddingTop: Platform.OS === "ios" ? Math.round(height * 0.012) : 0, // Adjust based on your height
  },
  inputError: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 2,
  },
  // Thêm style này vào StyleSheet
  disabledInput: {
    backgroundColor: "#f5f5f5",
    color: "#777",
  },
});
