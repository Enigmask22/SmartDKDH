import { Text, StyleSheet } from "react-native";
export const VoiceHint = ({
    children
}: {
    children?: React.ReactNode;
}) => {
    return (
        <Text style={styles.voiceHint}>
            {children}
        </Text>
    );
}

const styles = StyleSheet.create({
    voiceHint: {
        backgroundColor:'#ffffff',
        textAlign: "center",
        margin: 50,
        fontSize: 13,
        padding: 10,
        borderRadius: 8,
        fontFamily:'Inter-Light',
        borderWidth:1,
        borderColor:'#ffffff',
        elevation:5
    },
});