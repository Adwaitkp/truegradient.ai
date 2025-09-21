import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
  name: 'credits',
  initialState: { balance: 1250 },
  reducers: { setCredits(state, { payload }) { state.balance = payload; } }
});

export const { setCredits } = slice.actions;
export default slice.reducer;
