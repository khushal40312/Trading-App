import { configureStore, combineReducers } from "@reduxjs/toolkit";
import UserInfo from "./userProfileSlice";
import trendingSearches from "./trendingSearchSlice"
import selectedToken from "./seletedTokenSlice"
import selectedTheme from "./themeSlice"
import pendingSlice from "./pendingTrade"


const appReducer = combineReducers({
    user: UserInfo,
    search:trendingSearches,
    selectedToken:selectedToken,
    selectedTheme:selectedTheme,
    pendingTrades:pendingSlice
   
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