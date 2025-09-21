import { configureStore } from '@reduxjs/toolkit';
import auth from '../features/auth/authSlice';
import notifications from '../features/notifications/notificationSlice';
import credits from '../features/credits/creditsSlice';
import chat from '../features/chat/chatSlice';

export const store = configureStore({
  reducer: { auth, notifications, credits, chat }
});
