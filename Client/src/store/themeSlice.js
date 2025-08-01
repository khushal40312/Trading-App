import { createSlice } from "@reduxjs/toolkit";
import Cookies from 'js-cookie'
const selectedTheme = createSlice({
    name: 'selectedTheme',
    initialState: '',
    reducers: {
        changeTheme: (state, action) => {

            return action.payload
        }
    }
});

export const selectedThemeAction = selectedTheme.actions;



export default selectedTheme.reducer;