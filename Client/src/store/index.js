import { configureStore, combineReducers } from "@reduxjs/toolkit";
import UserInfo from "./userProfileSlice";



const appReducer = combineReducers({
    user: UserInfo,
   
})
const rootReducer = (state, action) => {
    if (action.type === 'LOGOUT') {
        state = undefined; // Reset all state to initial
    }
    return appReducer(state, action);
};


const tradexStore = configureStore({
    reducer: rootReducer,
});

export default tradexStore;