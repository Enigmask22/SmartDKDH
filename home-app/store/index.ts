import { configureStore } from '@reduxjs/toolkit';
import ledDevicesReducer from './ledDevicesSlice';
import fanDevicesReducer from './fanDevicesSlice';
import userReducer from './userSlice';
import sensorReducer from './sensorSlice';
import { se } from 'date-fns/locale';

export const store = configureStore({
  reducer: {
    user: userReducer,
    sensor: sensorReducer,
    ledDevices: ledDevicesReducer,
    fanDevices: fanDevicesReducer
  },
});

// Kiểu cho RootState và AppDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
