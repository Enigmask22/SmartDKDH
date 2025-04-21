import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import InputUserNameBox from "./InputUserNameBox";
import ButtonAuth from "./ButtonAuth";
import { Ionicons } from "@expo/vector-icons";

import { Dimensions } from "react-native";
import { PropsWithChildren } from "react";
const { width, height } = Dimensions.get("window");

interface RegisterPageSecondProps {
  usernameAdafruit: string;
  setUsernameAdafruit: React.Dispatch<React.SetStateAction<string>>;
  keyAdafruit: string;
  setKeyAdafruit: React.Dispatch<React.SetStateAction<string>>;
  handleSignUp: () => void;
  togglePage: () => void;
  disabled?: boolean;
}

const RegisterPageSecond: React.FC<RegisterPageSecondProps> = ({
  usernameAdafruit,
  setUsernameAdafruit,
  keyAdafruit,
  setKeyAdafruit,
  handleSignUp,
  togglePage,
  disabled = false,
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
        <ButtonAuth title="Create Account" onPress={handleSignUp} />
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
