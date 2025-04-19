import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserState {
    info: {
        user_no: string | null;
        user_email: string | null;
        user_password: string | null;
    } | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: UserState = {
    info: null,
    status: 'idle',
    error: null,
};

// Thunk để lấy thông tin user từ AsyncStorage
export const fetchUser = createAsyncThunk('user/fetchUser', async (_, { rejectWithValue }) => {
    try {
        const userNo = await AsyncStorage.getItem('user_no');
        const userEmail = await AsyncStorage.getItem('user_email');
        const userPassword = await AsyncStorage.getItem('user_password');

        // Đảm bảo dữ liệu trả về đúng kiểu
        const userData: UserState['info'] = {
            user_no: typeof userNo === 'string' ? userNo : null,
            user_email: typeof userEmail === 'string' ? userEmail : null,
            user_password: typeof userPassword === 'string' ? userPassword : null,
        };

        return userData;
    } catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch user data from AsyncStorage');
    }
});

// Thunk để log out user
export const logoutUser = createAsyncThunk('user/logoutUser', async (_, { rejectWithValue }) => {
    try {
        await AsyncStorage.multiRemove(['user_no', 'user_email', 'user_password']);
    } catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : 'Failed to log out user');
    }
});

// Khởi tạo slice
const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        // Action để cập nhật user
        setUser: (state, action) => {
            state.info = action.payload;
        },
        // Action để xóa user
        clearUser: (state) => {
            state.info = null;
            state.status = 'idle';
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Xử lý khi fetchUser đang loading
            .addCase(fetchUser.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            // Xử lý khi fetchUser thành công
            .addCase(fetchUser.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.info = action.payload;
            })
            // Xử lý khi fetchUser thất bại
            .addCase(fetchUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            // Xử lý khi logoutUser thành công
            .addCase(logoutUser.fulfilled, (state) => {
                state.info = null;
                state.status = 'idle';
                state.error = null;
            })
    },
});

// Export actions
export const { setUser, clearUser } = userSlice.actions;

// Export reducer
export default userSlice.reducer;