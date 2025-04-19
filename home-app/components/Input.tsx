import { PropsWithChildren } from "react";
import { StyleSheet, Text, TextInput, View, Platform, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

const InputBox = ({
  children,
  title,
  data,
  setData,
  isEmail,
  error,
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
    <View style={styles.container}>
      <View style={styles.boxSpacing}>
        <Text style={styles.normalText}>{title}</Text>
      </View>
      <View style={styles.boxSpacing}>
        <TextInput
          style={[
            (title == "Password") ? styles.passwordInput : styles.input,
            error && styles.inputError, // Apply error style if error prop exists
            Platform.OS === 'ios' ? styles.inputIOS : {}
          ]}
          onChangeText={handleChangeData}
          value={(["Password", "AIO_KEY", "AIO_USERNAME" ].find(e => e == title)) ? "••••••••••••••••••••••••••" : data}
          keyboardType={isEmail ? "email-address" : "default"}
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    </View>
  );
};

export default InputBox;

const styles = StyleSheet.create({
  container: {
    width: width * 0.85,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  normalText: {
    color: "black",
    fontSize: 15
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
    fontFamily: 'Rubik-Regular',
    color: "#333",
    // Cross-platform fixes
    textAlignVertical: 'center', // For Android
    paddingVertical: 0 // Remove default vertical padding
  },
  passwordInput: {
    width: width * 0.5,
    height: height * 0.05,
    borderRadius: 12,
    borderColor: "black",
    paddingHorizontal: 15,
    fontSize: 16,
    fontFamily: 'Rubik-Regular',
    color: "#333",
    // Cross-platform fixes
    textAlignVertical: 'center', // For Android
    paddingVertical: 0 // Remove default vertical padding
  },
  // iOS-specific fixes
  inputIOS: {
    lineHeight: Math.round(height * 0.05), // Match with height
    paddingTop: Platform.OS === 'ios' ? Math.round(height * 0.012) : 0, // Adjust based on your height
  },
  inputError: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 2,
  }
});