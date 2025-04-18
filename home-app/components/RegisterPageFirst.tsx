import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import InputUserNameBox from "./InputUserNameBox";
import { PropsWithChildren } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Dimensions } from "react-native";
import InputPasswordBox from "./InputPasswordBox";

const { width, height } = Dimensions.get("window");

const RegisterPageFirst = ({
  children,
  email,
  setEmail,
  username,
  setUserName,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  handleReturnToLogin,
  togglePage,
}: PropsWithChildren & {
  email: string;
  setEmail: (email: string) => void;
  username: string;
  setUserName: (username: string) => void;
  password: string;
  setPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (confirmPassword: string) => void;
  handleReturnToLogin: () => void; // Hàm điều hướng về trang đăng nhập
  togglePage: () => void; // Hàm điều hướng đến trang tiếp theo
}) => {
  return (
    <View>
      <InputUserNameBox
        title={"Email address"}
        data={email}
        setData={setEmail}
        isEmail={true}
      />
      <InputUserNameBox
        title={"User name"}
        data={username}
        setData={setUserName}
      />
      <InputPasswordBox
        title={"Password"}
        password={password}
        setPassword={setPassword}
      />
      <InputPasswordBox
        title={"Confirm Password"}
        password={confirmPassword}
        setPassword={setConfirmPassword}
      />

      <View style={styles.navigateBox}>
        <TouchableOpacity onPress={handleReturnToLogin}>
          <View style={styles.buttonInnerBox}>
            <Ionicons name="return-down-back-sharp" size={24} color="#6F6D6C" />
            <Text style={styles.buttonText}> Back to Login</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={togglePage}>
          <View style={styles.buttonInnerBox}>
            <Text style={styles.nextButton}>Next</Text>
            <Ionicons name="arrow-forward-outline" size={24} color="black" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};
export default RegisterPageFirst;

const styles = StyleSheet.create({
  navigateBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: height * 0.02,
  },
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
  nextButton: {
    fontSize: 20,
    textAlign: "center",
    alignItems: "center",
    color: "black",
    // fontWeight: "bold",
  },
});
