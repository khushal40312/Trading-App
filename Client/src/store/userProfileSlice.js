import { createSlice } from "@reduxjs/toolkit";

const UserInfo = createSlice({
    name: 'user',
    initialState: [],
    reducers: {
        addUserInfo: (state, action) => {

            return action.payload
        }
    }
});

export const UserAction = UserInfo.actions;



export default UserInfo.reducer;