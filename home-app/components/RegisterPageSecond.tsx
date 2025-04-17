import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import InputUserNameBox from "./InputUserNameBox";
import ButtonAuth from "./ButtonAuth";
import { Ionicons } from "@expo/vector-icons";

import { Dimensions } from "react-native";
import { PropsWithChildren } from "react";
const { width, height } = Dimensions.get("window");

const RegisterPageSecond = ({
  children,
  usernameAdafruit,
  setUsernameAdafruit,
  keyAdafruit,
  setKeyAdafruit,
  handleSignUp,
  togglePage,
}: PropsWithChildren & {
  usernameAdafruit: string;
  setUsernameAdafruit: (usernameAdafruit: string) => void;
  keyAdafruit: string;
  setKeyAdafruit: (keyAdafruit: string) => void;
  handleSignUp: () => void; // Hàm điều hướng về trang đăng nhập
  togglePage: () => void; // Hàm điều hướng đến trang tiếp theo
}) => {
  return (
    <View>
      <InputUserNameBox
        title={"Username Adafruit"}
        data={usernameAdafruit}
        setData={setUsernameAdafruit}
      />
      <InputUserNameBox
        title={"Key Adafruit"}
        data={keyAdafruit}
        setData={setKeyAdafruit}
      />

      {/* Sign up Box*/}
      <View style={styles.buttonLoginBox}>
        <ButtonAuth title="Sign up" onPress={handleSignUp} />
      </View>

      <View>
        <TouchableOpacity onPress={togglePage}>
          <View style={styles.buttonInnerBox}>
            <Ionicons name="return-down-back-sharp" size={24} color="#6F6D6C" />
            <Text style={styles.buttonText}> Back</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RegisterPageSecond;

const styles = StyleSheet.create({
  buttonLoginBox: { alignItems: "center", marginVertical: height * 0.05 },
  buttonInnerBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  buttonText: {
    color: "#6F6D6C",
    fontSize: 20,
    textAlign: "center",
    alignItems: "center",
  },
});
