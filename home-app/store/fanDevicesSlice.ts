import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

const apiBaseUrl = "https://smartdkdh.onrender.com";

export interface FanDevice {
  id: string;
  description: string;
  value: number;
}

interface FanDevicesState {
  devices: FanDevice[];
  loading: boolean;
  error: string | null;
  autoMode: boolean;
}

const initialState: FanDevicesState = {
  devices: [],
  loading: false,
  error: null,
  autoMode: false,
};

const logUserActivity = async (
  activity: string,
  status: string,
  deviceName: string
) => {
  try {
    // Kiểm tra xem đã có user_no chưa
    const userNo = await AsyncStorage.getItem("user_no");
    if (userNo === null) {
      console.warn("userNo chưa sẵn sàng, không thể gửi log hoạt động");
      return;
    }

    const logData = {
      user_no: userNo,
      activity: activity,
      status: status,
      device_name: deviceName,
      timestamp: new Date().toISOString(),
    };

    console.log("Sending log data:", logData);

    // const response = await fetch(`http://${serverIp}:8000/api/logs`, {
    const response = await fetch(`${apiBaseUrl}/api/logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(logData),
    });

    // Log response status để debug
    console.log(`Log API response status: ${response.status}`);

    // Lấy response body dưới dạng text
    const responseText = await response.text();
    console.log("Response text:", responseText);

    // Kiểm tra xem response có phải JSON không
    let result;
    try {
      // Chỉ parse JSON nếu responseText không rỗng
      if (responseText) {
        result = JSON.parse(responseText);
      } else {
        // Nếu response rỗng nhưng status OK
        if (response.ok) {
          console.log("Activity logged successfully (empty response)");
          return;
        } else {
          throw new Error("Empty response with error status");
        }
      }
    } catch (parseError) {
      console.error("Error parsing response:", parseError);
      // Nếu response OK dù không phải JSON
      if (response.ok) {
        console.log("Activity logged successfully (non-JSON response)");
        return;
      } else {
        throw new Error(`Invalid response format: ${responseText}`);
      }
    }

    // Xử lý result nếu có
    if (result) {
      if (result.success || response.ok) {
        console.log("Activity logged successfully");
      } else {
        console.error(
          "Failed to log activity:",
          result.message || result.detail || "Unknown error"
        );
      }
    }
  } catch (error) {
    console.error("Error logging user activity:", error);
  }
};

// Thunk để fetch devices từ API
export const fetchFanDevices = createAsyncThunk(
  "fanDevices/fetchFanDevices",
  async () => {
    const response = await fetch(`${apiBaseUrl}/fan-devices`);
    const data = await response.json();
    return data.devices as FanDevice[];
  }
);

// Thunk để toggle fan
export const toggleFan = createAsyncThunk(
  "fanDevices/toggleFan",
  async (
    { id, action }: { id: string; action: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`${apiBaseUrl}/fan/${id}/${action}`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        // Ghi log sau khi thao tác thành công
        const deviceNumber = id.replace("dadn-fan-", "");
        let actionText = "";

        if (action === "on") {
          actionText = "Turn on";
        } else if (action === "off") {
          actionText = "Turn off";
        } else if (action === "increase") {
          actionText = "Increase";
        } else if (action === "decrease") {
          actionText = "Decrease";
        }

        await logUserActivity(
          `${actionText} Fan${deviceNumber}`,
          "Success",
          id
        );
        return { id, value: result.value }; // Giả sử API trả về giá trị mới
      } else {
        // Ghi log thất bại
        const deviceNumber = id.replace("dadn-fan-", "");
        let actionText = "";

        if (action === "on") {
          actionText = "Turn on";
        } else if (action === "off") {
          actionText = "Turn off";
        } else if (action === "increase") {
          actionText = "Increase";
        } else if (action === "decrease") {
          actionText = "Decrease";
        }

        await logUserActivity(`${actionText} Fan${deviceNumber}`, "Failed", id);
        return rejectWithValue(result.message || "Failed to toggle fan");
      }
    } catch (error: any) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Thunk để set giá trị quạt
export const setFanValue = createAsyncThunk(
  "fanDevices/setFanValue",
  async ({ id, value }: { id: string; value: number }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${apiBaseUrl}/fan/${id}/${value}`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        // Ghi log sau khi thao tác thành công
        const deviceNumber = id.replace("dadn-fan-", "");
        await logUserActivity(
          `Set Fan${deviceNumber} to ${value}%`,
          "Success",
          id
        );
        return { id, value: result.value }; // Giả sử API trả về giá trị mới
      } else {
        // Ghi log thất bại
        const deviceNumber = id.replace("dadn-fan-", "");
        await logUserActivity(
          `Set Fan${deviceNumber} to ${value}%`,
          "Failed",
          id
        );
        return rejectWithValue(result.message || "Failed to set fan value");
      }
    } catch (error: any) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

const fanDevicesSlice = createSlice({
  name: "fanDevices",
  initialState,
  reducers: {
    setAllValues: (state, action: PayloadAction<Record<string, string>>) => {
      state.devices.forEach((device) => {
        if (action.payload[device.id] !== undefined) {
          device.value = parseInt(action.payload[device.id]);
        }
      });
    },
    toggleAutoMode: (state) => {
      state.autoMode = !state.autoMode; // Chuyển đổi chế độ tự động
    },
  },
  extraReducers: (builder) => {
    // các trạng thái khi call API
    builder
      .addCase(fetchFanDevices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFanDevices.fulfilled, (state, action) => {
        state.loading = false;
        state.devices = action.payload;
      })
      .addCase(fetchFanDevices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch devices";
      })
      .addCase(toggleFan.fulfilled, (state, action) => {
        const { id, value } = action.payload;
        const device = state.devices.find((d) => d.id === id);
        if (device) {
          device.value = value; // Cập nhật giá trị mới
        }
      })
      .addCase(setFanValue.fulfilled, (state, action) => {
        const { id, value } = action.payload;
        const device = state.devices.find((d) => d.id === id);
        if (device) {
          device.value = value; // Cập nhật giá trị mới
        }
      });
  },
});

export const { setAllValues, toggleAutoMode } = fanDevicesSlice.actions;
export default fanDevicesSlice.reducer;
