import { createSlice } from "@reduxjs/toolkit";

const selectedTheme = createSlice({
    name: 'selectedTheme',
    initialState: 'Light',
    reducers: {
        changeTheme: (state, action) => {

            return action.payload
        }
    }
});

export const selectedThemeAction = selectedTheme.actions;



export default selectedTheme.reducer;