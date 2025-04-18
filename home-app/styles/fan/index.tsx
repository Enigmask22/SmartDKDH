import { StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

// Define a base width for scaling calculations (e.g., the width of the design mockup)
const baseWidth = 375;
const scale = (size: number) => (width / baseWidth) * size;
const verticalScale = (size: number) => (height / 667) * size; // Assuming a base height
const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(16),
    backgroundColor: "#f8f9fa",
  },
  backButton: {
    position: "absolute",
    left: scale(16),
    // Adjust top/transform if needed for vertical centering based on header height
    top: verticalScale(20), // Example: align with paddingTop
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: "bold",
  },
  fansGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: scale(16),
    paddingBottom: verticalScale(16),
    // Add paddingTop if needed
    paddingTop: verticalScale(16),
  },
  footer: {
    padding: moderateScale(20),
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  micButton: {
    width: scale(60),
    height: scale(60), // Keep aspect ratio square
    borderRadius: scale(30), // Half of width/height
    justifyContent: "center",
    alignItems: "center",
    marginBottom: verticalScale(8),
    borderWidth: 1, // Keep border width fixed
    borderColor: "#4CAF50",
  },
  listeningButton: {
    borderColor: "#ff4444",
  },
  micButtonText: {
    fontSize: moderateScale(24),
  },
  voiceHint: {
    fontStyle: "italic",
    textAlign: "center",
    margin: moderateScale(16),
    fontSize: moderateScale(14), // Added font size scaling
  },
});
