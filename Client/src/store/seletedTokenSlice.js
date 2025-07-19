import { createSlice } from "@reduxjs/toolkit";

const selectedToken = createSlice({
    name: 'selectedToken',
    initialState: {},
    reducers: {
        addToken: (state, action) => {

            return action.payload
        }
    }
});

export const selectedTokenAction = selectedToken.actions;



export default selectedToken.reducer;