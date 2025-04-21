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
    padding: moderateScale(20),
    backgroundColor: "#f7f9fc",
  },
  header: {
    position: "relative",
    display: "flex",
    flexDirection: "row",

    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    width: width * 0.8,
    flexDirection: "column",
    alignItems: "center",
  },
  backButton: {
    width: width * 0.1,
  },
  headerContent: {
    flex: 1,
    alignItems: "center", // This centers the text horizontally in the remaining space
  },
  headerTitle: {
    fontSize: moderateScale(20),
    fontWeight: "bold",
    color: "#333",
  },
  description: {
    fontSize: moderateScale(14),
    color: "#666",
    marginTop: verticalScale(4),
  },

  mainContent: {
    flex: 1,
    alignItems: "center",
    paddingTop: verticalScale(10),
  },
  fanImageContainer: {
    position: "relative",
    width: "100%",
    height: verticalScale(220),
    alignItems: "center",
    justifyContent: "center",
  },
  fanAnimation: {
    width: scale(240),
    height: verticalScale(200),
  },
  fanValueContainer: {
    alignItems: "center",
  },
  fanValueText: {
    fontSize: moderateScale(28),
    fontWeight: "bold",
    color: "#4287f5",
  },
  controlsSection: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: moderateScale(20),
    padding: moderateScale(20),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginTop:verticalScale(20)
  },
  infoBoxContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(25),
  },
  infoBox: {
    alignItems: "center",
    minWidth: scale(70),
  },
  infoBoxText: {
    fontSize: moderateScale(16),
    fontWeight: "bold",
    color: "#333",
    marginTop: verticalScale(5),
  },
  infoBoxLabel: {
    fontSize: moderateScale(12),
    color: "#888",
    marginTop: verticalScale(2),
  },
  powerButtonContainer: {
    marginHorizontal: scale(20),
  },
  timerSection: {
    marginBottom: verticalScale(25),
  },
  timerHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: verticalScale(15),
  },
  timerTitle: {
    fontSize: moderateScale(16),
    fontWeight: "bold",
    color: "#333",
    marginRight: scale(15),
  },
  timerCountdown: {
    fontSize: moderateScale(14),
    color: "#4287f5",
    fontWeight: "bold",
    marginLeft: scale(10),
  },
  timerOptionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: verticalScale(10),
  },
  timerOption: {
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(10),
    backgroundColor: "#f7f7f7",
    borderRadius: moderateScale(12),
    minWidth: scale(60),
    alignItems: "center",
    justifyContent: "center",
  },
  timerOptionSelected: {
    backgroundColor: "#4287f5",
  },
  timerOptionText: {
    fontSize: moderateScale(14),
    color: "#666",
    fontWeight: "500",
  },
  timerOptionTextSelected: {
    color: "#fff",
  },
  autoModeSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: verticalScale(15),
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  autoModeTitle: {
    fontSize: moderateScale(16),
    fontWeight: "bold",
    color: "#333",
  },
  titleContainer: {
    height: height * 0.1,
    alignItems: "center",
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
    backgroundColor: "#4287f5",
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
    width: "100%",
    paddingHorizontal: scale(10),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  slider: {
    flex: 1,
    height: verticalScale(60), // Tăng độ dày của slider
    marginHorizontal: scale(10),
  },
  sliderButton: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
    position: "absolute",
    top: verticalScale(5),
    right: scale(5),
    zIndex: 10,
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
    borderColor: "#4287f5",
    borderWidth: 1, // Keep border width fixed
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dissabledMicButton: {
    width: scale(50), // Scale disabled button size
    height: scale(50),
    borderRadius: scale(25),
    borderColor: "#666",
    borderWidth: 1, // Keep border width fixed
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(240, 240, 240, 0.9)",
  },
  listeningButton: {
    borderColor: "#ff4444",
    borderWidth: 2, // Thicker border while recording
    backgroundColor: "rgba(255, 240, 240, 0.9)",
  },
  micButtonText: {
    fontSize: moderateScale(24),
  },
});
