import { StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

const baseWidth = 375;
const scale = (size: number) => (width / baseWidth) * size;
const verticalScale = (size: number) => (height / 667) * size;
const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f6fc",
  },
  header: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: scale(16),
    paddingTop: 50,
    paddingBottom: verticalScale(16),
    backgroundColor: "#f2f6fc",
  },
  backButton: {
    position: "absolute",
    left: scale(20),
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: "#3b82f6",
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    justifyContent: "center",
    alignItems: "center",
  },
  bulbsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: scale(16),
    paddingBottom: verticalScale(16),
  },
  footer: {
    paddingHorizontal: scale(20),
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  micButton: {
    width: scale(60),
    height: scale(60),
    borderRadius: scale(30),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: verticalScale(8),
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  listeningButton: {
    borderColor: "#ff4444",
  },
  micButtonText: {
    fontSize: moderateScale(24),
  },
});
