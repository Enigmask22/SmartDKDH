import { StyleSheet } from "react-native";
export const styles = StyleSheet.create({
    header: {
        position: "relative",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center", // Center the header content
        paddingHorizontal: 16,
        paddingTop: 15,
        paddingBottom: 10,
        width: "100%",
    },
    backButton: {
        position: "absolute",
        left: 16,
        top: "50%",
        transform: [{ translateY: -12 }], // Half of the icon size to center it vertically
        zIndex: 10, // Ensure it's above other elements
    },
    headerContent: {
        flex: 1,
        alignItems: "center", // This centers the text horizontally in the remaining space
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    description: {
        fontSize: 14,
        color: "#666",
        marginTop: 4,
    },
    titleContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 16,
    },
    serverConfig: {
        marginBottom: 16,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ccc",
    },
    fanControlsContainer: {
        marginBottom: 16,
    },
    fanItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#ccc",
    },
    fanIndicator: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    fanOn: {
        backgroundColor: "#4CAF50",
    },
    fanOff: {
        backgroundColor: "#666",
    },
    fanStatusText: {
        color: "#fff",
        fontWeight: "bold",
    },
    sliderContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
    },
    slider: {
        flex: 1,
        height: 40,
        marginRight: 8,
    },
    buttonGroup: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        marginTop: 8,
        width: "100%",
    },
    controlButton: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 4,
        marginHorizontal: 4,
        minWidth: 40,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
    },
    voiceControlContainer: {
        alignItems: "center",
        marginTop: 20,
        marginBottom: 40,
    },
    controlButtonsRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 20,
    },
    micButton: {
        width: 50,
        height: 50,
        borderRadius: 30,
        borderColor: "#4CAF50",
        borderWidth: 1,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },
    dissabledMicButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderColor: "#666",
        borderWidth: 1,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },
    listeningButton: {
        borderColor: "#ff4444",
        borderWidth: 1,
    },
    micButtonText: {
        fontSize: 24,
    },
});