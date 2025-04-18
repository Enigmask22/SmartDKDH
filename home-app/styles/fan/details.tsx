import { StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

// Define a base width for scaling calculations (e.g., the width of the design mockup)
const baseWidth = 375;
const scale = (size: number) => (width / baseWidth) * size;
const verticalScale = (size: number) => (height / 667) * size; // Assuming a base height
const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

export const styles = StyleSheet.create({
  header: {
    position: "relative",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", // Center the header content
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(15),
    paddingBottom: verticalScale(10),
    width: "100%",
  },
  backButton: {
    position: "absolute",
    left: scale(16),
    top: "50%", // Keep percentage for vertical centering relative to header height
    // Adjust translateY based on the actual scaled icon size if needed
    transform: [{ translateY: -moderateScale(12) }],
    zIndex: 10, // Ensure it's above other elements
  },
  headerContent: {
    flex: 1,
    alignItems: "center", // This centers the text horizontally in the remaining space
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: "bold",
  },
  description: {
    fontSize: moderateScale(14),
    color: "#666",
    marginTop: verticalScale(4),
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
    marginBottom: verticalScale(16),
  },
  serverConfig: {
    marginBottom: verticalScale(16),
    padding: moderateScale(12),
    borderRadius: moderateScale(8),
    borderWidth: 1, // Keep border width fixed or scale minimally if desired
    borderColor: "#ccc",
  },
  fanControlsContainer: {
    marginBottom: verticalScale(16),
  },
  fanItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: moderateScale(12),
    borderRadius: moderateScale(8),
    marginBottom: verticalScale(8),
    borderWidth: 1, // Keep border width fixed
    borderColor: "#ccc",
  },
  fanIndicator: {
    width: scale(50),
    height: scale(50), // Keep aspect ratio square
    borderRadius: scale(25), // Half of width/height
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(12),
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
    fontSize: moderateScale(12), // Scale status text if needed
  },
  sliderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: verticalScale(8),
  },
  slider: {
    flex: 1,
    height: verticalScale(40),
    marginRight: scale(8),
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: scale(10),
    marginTop: verticalScale(8),
    width: "100%",
  },
  controlButton: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 }, // Shadow offset might not need scaling
    shadowOpacity: 0.25,
    paddingVertical: verticalScale(6),
    paddingHorizontal: scale(12),
    borderRadius: moderateScale(4),
    marginHorizontal: scale(4),
    minWidth: scale(40),
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: moderateScale(14), // Scale button text
  },
  voiceControlContainer: {
    alignItems: "center",
    marginTop: verticalScale(20),
    marginBottom: verticalScale(40),
  },
  controlButtonsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: scale(20),
  },
  micButton: {
    width: scale(50),
    height: scale(50), // Keep aspect ratio
    borderRadius: scale(25), // Half of width/height
    borderColor: "#4CAF50",
    borderWidth: 1, // Keep border width fixed
    justifyContent: "center",
    alignItems: "center",
    marginBottom: verticalScale(8),
  },
  dissabledMicButton: {
    width: scale(60), // Scale disabled button size
    height: scale(60),
    borderRadius: scale(30),
    borderColor: "#666",
    borderWidth: 1, // Keep border width fixed
    justifyContent: "center",
    alignItems: "center",
    marginBottom: verticalScale(8),
  },
  listeningButton: {
    borderColor: "#ff4444",
    borderWidth: 1, // Keep border width fixed
  },
  micButtonText: {
    fontSize: moderateScale(24),
  },
});
