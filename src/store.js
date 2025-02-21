import { configureStore, createSlice } from '@reduxjs/toolkit';

const initialState = {
    chatId: null,
    token: null,
    objectId: null,
    checklistId: null,
    lang: 'ru' 
};

const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        setChatId: (state, action) => {
            state.chatId = action.payload;
        },
        setToken: (state, action) => {
            state.token = action.payload;
        },
        setObjectId: (state, action) => {
            state.objectId = action.payload;
        },
        setChecklistId: (state, action) => {
            state.checklistId = action.payload;
        },
        setLang: (state, action) => {
            state.lang = action.payload;
        },
    },
});

export const { setChatId, setToken, setObjectId, setChecklistId, setLang } = appSlice.actions;

const store = configureStore({
    reducer: {
        app: appSlice.reducer,
    },
});

export default store;
