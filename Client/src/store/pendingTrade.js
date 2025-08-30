// store/pendingTrade.js
import { createSlice } from "@reduxjs/toolkit";

const pendingSlice = createSlice({
  name: "pendingTrades",
  initialState: [],
  reducers: {
    addPendingTrades: (state, action) => {
      return action.payload; // overwrites with fresh API data
    },
    removePendingTrade: (state, action) => {
      return state.filter((trade) => trade._id !== action.payload);
    },
  },
});

export const pendingAction = pendingSlice.actions;
export default pendingSlice.reducer;
