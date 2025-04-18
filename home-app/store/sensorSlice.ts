import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface SensorValues {
  temperature: string;
  humidity: string;
  light: string;
}

interface SensorState {
  values: SensorValues;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: SensorState = {
  values: {
    temperature: '0.0',
    humidity: '0.0',
    light: '0.0'
  },
  loading: false,
  error: null,
  lastUpdated: null
};

// Thunk để fetch sensor data từ API
export const fetchSensorValues = createAsyncThunk(
  'sensors/fetchValues',
  async (apiBaseUrl: string) => {
    const response = await fetch(`${apiBaseUrl}/sensor-values`);
    const data = await response.json();
    return data.sensor_values;
  }
);

const sensorSlice = createSlice({
  name: 'sensors',
  initialState,
  reducers: {
    // Cập nhật sensor values từ WebSocket hoặc các nguồn khác
    setSensorValues: (state, action: PayloadAction<Record<string, string>>) => {
      const { 'dadn-temp': temperature, 'dadn-humi': humidity, 'dadn-light': light } = action.payload;
      
      if (temperature) state.values.temperature = temperature;
      if (humidity) state.values.humidity = humidity;
      if (light) state.values.light = light;
      
      state.lastUpdated = new Date().toISOString();
    },
    
    // Reset sensor values về mặc định
    resetSensorValues: (state) => {
      state.values = initialState.values;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSensorValues.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSensorValues.fulfilled, (state, action) => {
        state.loading = false;
        
        const { 'dadn-temp': temperature, 'dadn-humi': humidity, 'dadn-light': light } = 
          action.payload || {};
          
        if (temperature) state.values.temperature = temperature;
        if (humidity) state.values.humidity = humidity;
        if (light) state.values.light = light;
        
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchSensorValues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch sensor values';
      });
  }
});

export const { setSensorValues, resetSensorValues } = sensorSlice.actions;
export default sensorSlice.reducer;