import { Ionicons } from "@expo/vector-icons";
import { PropsWithChildren, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");
const InputPasswordBox = ({
  children,
  title,
  password,
  setPassword,
}: PropsWithChildren & {
  title: string;
  password: string;
  setPassword: (name: string) => void;
}) => {
  const [showPassword, setShowPassword] = useState(false); // State to manage password visibility

  function handlePasswordVisibility() {
    setShowPassword((prev) => !prev); // Toggle password visibility
  }

  const handleChangePassword = (password: string) => {
    setPassword(password); // Update password state
  };

  return (
    <View>
      <View
        style={[
          styles.boxSpacing,
          { flexDirection: "row", justifyContent: "space-between" },
        ]}
      >
        <View>
          <Text style={styles.normalText}>{title}</Text>
        </View>
        <TouchableOpacity onPress={handlePasswordVisibility}>
          <View style={styles.hidePassword}>
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={15}
            />
            <Text style={styles.normalText}> Hide</Text>
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.boxSpacing}>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={handleChangePassword}
          secureTextEntry={showPassword} // Toggle password visibility
          keyboardType={"default"}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
    </View>
  );
};

export default InputPasswordBox;

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
  hidePassword: {
    paddingRight: 15,
    flexDirection: "row",
    alignItems: "center",
  },
});
