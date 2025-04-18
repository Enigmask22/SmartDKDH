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
        textAlign: "center",
        margin: 50,
        fontSize: 13,
        borderTopWidth: 1,
        borderBottomWidth: 2,
        borderLeftWidth: 2,
        borderRightWidth: 1,
        padding: 10,
        borderRadius: 8,
        fontStyle: "italic",
    },
});