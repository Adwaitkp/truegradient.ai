import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  
  if (!res.ok) {
    const error = new Error(data.message || 'Request failed');
    error.response = { status: res.status, data };
    throw error;
  }
  
  return data;
}

export const signUp = createAsyncThunk('auth/signUp', async (payload, { rejectWithValue }) => {
  try {
    return await request('/auth/signup', { method: 'POST', body: JSON.stringify(payload) });
  } catch (error) {
    return rejectWithValue({
      message: error.message,
      status: error.response?.status
    });
  }
});

export const signIn = createAsyncThunk('auth/signIn', async (payload, { rejectWithValue }) => {
  try {
    return await request('/auth/login', { method: 'POST', body: JSON.stringify(payload) });
  } catch (error) {
    return rejectWithValue({
      message: error.message,
      status: error.response?.status
    });
  }
});

const slice = createSlice({
  name: 'auth',
  initialState: { 
    user: null, 
    token: localStorage.getItem('token'), 
    loading: false, 
    error: null 
  },
  reducers: { 
    signOut(state) { 
      state.user = null; 
      state.token = null; 
      state.error = null;
      localStorage.removeItem('token'); 
    },
    clearError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // SignUp cases
      .addCase(signUp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        if (action.payload.token) {
          localStorage.setItem('token', action.payload.token);
        }
      })
      .addCase(signUp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // SignIn cases
      .addCase(signIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        if (action.payload.token) {
          localStorage.setItem('token', action.payload.token);
        }
      })
      .addCase(signIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { signOut, clearError } = slice.actions;
export default slice.reducer;
