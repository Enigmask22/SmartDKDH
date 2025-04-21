import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Platform,
  StatusBar,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
const { width, height } = Dimensions.get("window"); 

// ... (interface LogEntry, component LogItem giữ nguyên) ...
interface LogEntry {
  _id: string;
  user_no: number;
  activity: string;
  status: string;
  timestamp: string;
  device_name?: string;
}

const LogItem = React.memo(({ item }: { item: LogEntry }) => {
  // ... (code LogItem giữ nguyên) ...
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
      case "thành công":
        return { name: "checkmark-circle", color: "#2ecc71" }; // Green
      case "failed":
      case "thất bại":
        return { name: "close-circle", color: "#e74c3c" }; // Red
      case "started":
      case "đang xử lý":
        return { name: "ellipsis-horizontal-circle", color: "#f39c12" }; // Orange
      case "error":
      case "lỗi":
        return { name: "alert-circle", color: "#e74c3c" }; // Red
      default:
        return { name: "information-circle-outline", color: "#bdc3c7" }; // Gray
    }
  };

  const statusInfo = getStatusIcon(item.status);
  const formattedTimestamp = format(
    parseISO(item.timestamp),
    "HH:mm:ss dd/MM/yyyy",
    { locale: vi }
  );

  return (
    <View style={styles.logItemContainer}>
      <Ionicons
        name={statusInfo.name as any}
        size={28}
        color={statusInfo.color}
        style={styles.icon}
      />
      <View style={styles.logTextContainer}>
        <Text style={styles.activityText}>{item.activity}</Text>
        {item.device_name && (
          <Text style={styles.deviceText}>Thiết bị: {item.device_name}</Text>
        )}
        <Text style={styles.timestampText}>{formattedTimestamp}</Text>
      </View>
      <Text style={[styles.statusText, { color: statusInfo.color }]}>
        {item.status}
      </Text>
    </View>
  );
});

export const ActivityLogScreen = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Ban đầu là loading để lấy user_no
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserNo, setCurrentUserNo] = useState<number | null>(null); // State lưu user_no

  // const backendUrl = `http://${Constants.expoConfig?.extra?.serverIp}:${Constants.expoConfig?.extra?.apiPort}`;
  const backendUrl = `https://smartdkdh.onrender.com`;
  // Hàm lấy user_no từ AsyncStorage
  useEffect(() => {
    const getUser = async () => {
      try {
        const storedUserNo = await AsyncStorage.getItem("user_no");
        if (storedUserNo !== null) {
          setCurrentUserNo(JSON.parse(storedUserNo));
          console.log("Đã lấy được user_no:", JSON.parse(storedUserNo));
        } else {
          // Xử lý trường hợp không tìm thấy user_no (ví dụ: điều hướng về login)
          console.error("Không tìm thấy user_no trong AsyncStorage.");
          setError("Không thể xác thực người dùng.");
          setIsLoading(false); // Dừng loading vì không thể fetch
        }
      } catch (e) {
        console.error("Lỗi đọc user_no từ AsyncStorage:", e);
        setError("Lỗi đọc thông tin người dùng.");
        setIsLoading(false);
      }
    };
    getUser();
  }, []); // Chạy 1 lần khi component mount

  // Hàm fetch logs, giờ sẽ phụ thuộc vào currentUserNo
  const fetchLogs = useCallback(async () => {
    if (currentUserNo === null) {
      console.log("Chưa có currentUserNo, không fetch logs.");
      setIsLoading(false); // Đảm bảo dừng loading nếu user_no chưa sẵn sàng
      return; // Không fetch nếu chưa có user_no
    }

    const apiUrl = `${backendUrl}/api/logs/user/${currentUserNo}`; // Dùng currentUserNo
    console.log("Fetching logs từ:", apiUrl); // Log để kiểm tra

    setError(null);
    // Không set isLoading = true ở đây nếu là refresh
    if (!refreshing) setIsLoading(true);

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        const errorData = await response.text(); // Đọc text để xem lỗi chi tiết hơn
        console.error("Server error:", errorData);
        throw new Error(`Lỗi mạng: ${response.status}`);
      }
      const data: LogEntry[] = await response.json();
      setLogs(data);
    } catch (err: any) {
      console.error("Lỗi fetch logs:", err);
      setError(err.message || "Không thể tải dữ liệu.");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [backendUrl, currentUserNo, refreshing]); // Thêm currentUserNo và refreshing vào dependency

  // Gọi fetchLogs khi currentUserNo đã có giá trị
  useEffect(() => {
    if (currentUserNo !== null) {
      fetchLogs();
    }
  }, [currentUserNo, fetchLogs]); // Chạy lại khi currentUserNo thay đổi hoặc fetchLogs thay đổi

  const onRefresh = useCallback(() => {
    if (currentUserNo !== null) {
      // Chỉ refresh nếu đã có user_no
      setRefreshing(true);
      // fetchLogs sẽ tự động được gọi lại do refreshing thay đổi trong dependency của nó
    }
  }, [currentUserNo]); // fetchLogs đã có currentUserNo rồi

  // ... (renderEmptyList, renderError giữ nguyên) ...
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="archive-outline" size={60} color="#bdc3c7" />
      <Text style={styles.emptyText}>Chưa có hoạt động nào được ghi lại.</Text>
    </View>
  );

  const renderError = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cloud-offline-outline" size={60} color="#e74c3c" />
      <Text style={styles.errorText}>Lỗi: {error}</Text>
      <Text style={styles.errorText}>
        Vui lòng kiểm tra kết nối và thử lại.
      </Text>
    </View>
  );

  return (
    <View style={styles.safeArea}>
      <ScrollView style={{height:'auto'}} >
      {/* Hiển thị loading ban đầu khi đang lấy user_no hoặc fetch lần đầu */}
      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : error ? ( // Hiển thị lỗi nếu có
        renderError()
      ) : currentUserNo === null ? ( // Trường hợp không lấy được user_no
        renderError() // Hoặc một thông báo khác
      ) : (
        <FlatList
          data={logs}
          renderItem={({ item }) => <LogItem item={item} />}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyList}
          scrollEnabled={false} 
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#007AFF"]}
              tintColor={"#007AFF"}
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
      </ScrollView>
    </View>
  );
};

// ... (styles giữ nguyên) ...
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingTop: Platform.OS === "android" ? Constants.statusBarHeight : 0,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
    backgroundColor: "#f8f9fa", // Giữ màu nền header đồng bộ
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#343a40",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16, // Padding dưới cùng cho list
  },
  logItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: "#ffffff", // Nền trắng cho từng item
    borderRadius: 8,
    marginVertical: 4, // Khoảng cách giữa các item
    paddingHorizontal: 12,
    // Shadow nhẹ cho iOS
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    // Elevation cho Android
    elevation: 2,
  },
  icon: {
    marginRight: 12,
  },
  logTextContainer: {
    flex: 1, // Chiếm phần lớn không gian
    marginRight: 8,
  },
  activityText: {
    fontSize: 15,
    fontWeight: "500", // Semi-bold
    color: "#212529",
    marginBottom: 3,
  },
  deviceText: {
    fontSize: 13,
    color: "#6c757d", // Màu xám nhẹ
    marginBottom: 3,
  },
  timestampText: {
    fontSize: 12,
    color: "#adb5bd", // Màu xám nhạt hơn
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "right",
    minWidth: 80, // Đảm bảo độ rộng tối thiểu để căn chỉnh
  },
  separator: {
    height: 1,
    backgroundColor: "#e9ecef",
    marginVertical: 4, // Đặt separator giữa các thẻ
    marginLeft: 52, // Thụt vào bằng khoảng cách icon + margin
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50, // Đẩy xuống một chút
    paddingHorizontal: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6c757d",
    textAlign: "center",
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: "#dc3545", // Màu đỏ cho lỗi
    textAlign: "center",
  },
});
