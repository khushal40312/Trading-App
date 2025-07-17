import { configureStore, combineReducers } from "@reduxjs/toolkit";
import UserInfo from "./userProfileSlice";
import trendingSearches from "./trendingSearchSlice"


const appReducer = combineReducers({
    user: UserInfo,
    search:trendingSearches
   
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