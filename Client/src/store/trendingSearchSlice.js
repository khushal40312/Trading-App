import { createSlice } from "@reduxjs/toolkit";

const trendingSearches = createSlice({
    name: 'search',
    initialState: [],
    reducers: {
        addTrendingCoins: (state, action) => {

            return action.payload
        }
    }
});

export const SearchAction = trendingSearches.actions;



export default trendingSearches.reducer;