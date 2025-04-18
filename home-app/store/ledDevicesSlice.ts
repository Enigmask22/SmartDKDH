import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

const apiBaseUrl = 'https://smartdkdh.onrender.com';

export interface LedDevice {
  id: string;
  description: string;
  status: string;
}

interface LedDevicesState {
  devices: LedDevice[];
  loading: boolean;
  error: string | null;
  autoMode: boolean;
}

const initialState: LedDevicesState = {
  devices: [],
  loading: false,
  error: null,
  autoMode: false,
};

const getDeviceNumber = (deviceId: string) => {
  const match = deviceId.match(/\d+$/);
  return match ? match[0] : "";
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
export const fetchLedDevices = createAsyncThunk(
  "ledDevices/fetchLedDevices",
  async () => {
    const response = await fetch(`${apiBaseUrl}/led-devices`);
    const data = await response.json();
    return data.devices as LedDevice[];
  }
);

// Thunk để bật/tắt LED
export const toggleLed = createAsyncThunk(
  "ledDevices/toggleLed",
  async (
    {
      id,
      newStatus,
    }: { id: string; newStatus: string;},
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`${apiBaseUrl}/led/${id}/${newStatus}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (data.success) {
        // Ghi log sau khi thao tác thành công
        const deviceNumber = getDeviceNumber(id);
        const actionText = newStatus === "1" ? "Turn on" : "Turn off";
        await logUserActivity(
          `${actionText} LED${deviceNumber}`,
          "Success",
          id
        );
        return { id, status: newStatus };
      } else {
        // Ghi log thất bại nếu cần
        const deviceNumber = getDeviceNumber(id);
        const actionText = newStatus === "1" ? "Turn on" : "Turn off";
        await logUserActivity(
          `${actionText} LED${deviceNumber}`,
          "Failed",
          id
        );
        return rejectWithValue(data.message || "Failed to toggle LED");
      }
    } catch (error: any) {
      // Ghi log thất bại nếu cần
      const deviceNumber = getDeviceNumber(id);
      const actionText = newStatus === "1" ? "Turn on" : "Turn off";
      await logUserActivity(
        `${actionText} LED${deviceNumber}`,
        "Failed",
        id
      );
      return rejectWithValue(error.message || "Network error");
    }
  }
);

const ledDevicesSlice = createSlice({
  name: "ledDevices",
  initialState,
  reducers: {
    setDeviceStatus: (
      state,
      action: PayloadAction<{ id: string; status: string }>
    ) => {
      const device = state.devices.find((d) => d.id === action.payload.id);
      if (device) {
        device.status = action.payload.status;
      }
    },
    setAllStatuses: (state, action: PayloadAction<Record<string, string>>) => {
      state.devices.forEach((device) => {
        if (action.payload[device.id] !== undefined) {
          device.status = action.payload[device.id];
        }
      });
    },
    toggleAutoMode: (state) => {
      state.autoMode = !state.autoMode;
    }
  },
  extraReducers: (builder) => {
    // các trạng thái khi call API
    builder
      .addCase(fetchLedDevices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLedDevices.fulfilled, (state, action) => {
        state.loading = false;
        state.devices = action.payload;
      })
      .addCase(fetchLedDevices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch devices";
      })
      .addCase(toggleLed.fulfilled, (state, action) => {
        const { id, status } = action.payload;
        const device = state.devices.find((d) => d.id === id);
        if (device) {
          device.status = status;
        }
      });
  },
});

export const { setDeviceStatus, setAllStatuses, toggleAutoMode } = ledDevicesSlice.actions;
export default ledDevicesSlice.reducer;
