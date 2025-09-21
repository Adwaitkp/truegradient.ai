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

export const loadRooms = createAsyncThunk('chat/loadRooms', async () => (await request('/api/rooms')).rooms);
export const createRoom = createAsyncThunk('chat/createRoom', async (title) =>
  (await request('/api/rooms', { method: 'POST', body: JSON.stringify({ title }) })).room
);
export const loadMessages = createAsyncThunk('chat/loadMessages', async (roomId) =>
  (await request(`/api/rooms/${roomId}/messages`)).messages
);
export const sendMessage = createAsyncThunk('chat/sendMessage', async ({ roomId, text }, { dispatch }) => {
  const userMessage = (await request(`/api/rooms/${roomId}/messages`, { method: 'POST', body: JSON.stringify({ text }) })).message;
  
  // Call Gemini API for AI response
  try {
    const { text: aiText } = await request('/api/ai/gemini', {
      method: 'POST',
      body: JSON.stringify({ text, model: 'gemini-1.5-flash' })
    });
    
    // Send AI response to backend
    await request(`/api/rooms/${roomId}/messages`, { 
      method: 'POST', 
      body: JSON.stringify({ text: aiText || 'Sorry, I could not generate a response.', role: 'ai' }) 
    });
    
    // Reload messages to show AI response
    dispatch(loadMessages(roomId));
    
  } catch (error) {
    console.error('Gemini API error:', error);
    // Send fallback AI response
    await request(`/api/rooms/${roomId}/messages`, { 
      method: 'POST', 
      body: JSON.stringify({ text: 'Sorry, I encountered an error. Please try again.', role: 'ai' }) 
    });
    
    // Reload messages to show error response
    dispatch(loadMessages(roomId));
  }
  
  return userMessage;
});

const slice = createSlice({
  name: 'chat',
  initialState: { rooms: [], activeRoomId: null, messages: [] },
  reducers: { setActiveRoom(state, { payload }) { state.activeRoomId = payload; } },
  extraReducers(b) {
    b.addCase(loadRooms.fulfilled, (s, { payload }) => { s.rooms = payload; if (!s.activeRoomId && payload[0]) s.activeRoomId = payload[0].id; })
     .addCase(createRoom.fulfilled, (s, { payload }) => { s.rooms.push(payload); s.activeRoomId = payload.id; })
     .addCase(loadMessages.fulfilled, (s, { payload }) => { s.messages = payload; })
     .addCase(sendMessage.fulfilled, (s, { payload }) => { s.messages.push(payload); });
  }
});

export const { setActiveRoom } = slice.actions;
export default slice.reducer;
