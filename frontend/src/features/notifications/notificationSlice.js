import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const loadNotifications = createAsyncThunk('notifications/load', async () =>
  request('/api/notifications')
);
export const markAllRead = createAsyncThunk('notifications/markAll', async () =>
  request('/api/notifications/read-all', { method: 'PATCH' })
);

const slice = createSlice({
  name: 'notifications',
  initialState: { items: [], open: false },
  reducers: { togglePanel(state) { state.open = !state.open; } },
  extraReducers(b) {
    b.addCase(loadNotifications.fulfilled, (s, { payload }) => { s.items = payload.items; })
     .addCase(markAllRead.fulfilled, (s) => { s.items = s.items.map((n) => ({ ...n, read: true })); });
  }
});

export const { togglePanel } = slice.actions;
export default slice.reducer;
