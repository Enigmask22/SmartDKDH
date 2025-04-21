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
  titleContainer: {
    height: height * 0.1,
    alignItems: "center",
    marginBottom: 16,
    paddingTop: verticalScale(20),
  },
  title: {
    width: width * 0.8,
    flexDirection: "column",
    alignItems: "center",
  },
  backButton: {
    width: width * 0.1,
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
  // Skeleton styles
  skeletonCardContainer: {
    width: width * 0.44,
    height: 180,
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    margin: 8,
    justifyContent: 'space-between',
  },
  skeletonIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#BDBDBD',
    alignSelf: 'center',
    marginBottom: 20,
  },
  skeletonTitle: {
    width: '70%',
    height: 20,
    backgroundColor: '#BDBDBD',
    borderRadius: 4,
    alignSelf: 'center',
    marginBottom: 20,
  },
  skeletonSwitch: {
    width: 40,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#BDBDBD',
    alignSelf: 'center',
  },
  skeletonSummaryContainer: {
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
    padding: 20,
    margin: 8,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skeletonSummaryItem: {
    width: width * 0.25,
    height: 60,
    backgroundColor: '#BDBDBD',
    borderRadius: 8,
  },
  // Error state styles
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    minHeight: 300,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f44336',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skeletonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  }
});
