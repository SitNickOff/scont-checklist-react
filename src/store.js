import { configureStore, createSlice } from '@reduxjs/toolkit';

const PERSIST_KEY = 'scont_checklist_app_state';

const initialState = {
    chatId: null,
    token: null,
    objectId: null,
    checklistId: null,
    draftId: null,
    only_cam_inspector_bot: false,
    lang: 'ru'
};

const loadState = () => {
    try {
        const serialized = localStorage.getItem(PERSIST_KEY);
        if (serialized == null) return undefined;
        const parsed = JSON.parse(serialized);
        return { ...initialState, ...parsed };
    } catch {
        return undefined;
    }
};

const saveState = (state) => {
    try {
        const toSave = state.app;
        localStorage.setItem(PERSIST_KEY, JSON.stringify(toSave));
    } catch {
        // ignore write errors
    }
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
            state.checklistId = action.payload.checklistId;
            state.only_cam_inspector_bot = action.payload.only_cam_inspector_bot ?? false;
        },
        setLang: (state, action) => {
            state.lang = action.payload;
        },
        setDraftId: (state, action) => {
            state.draftId = action.payload;
        },
    },
});

export const { setChatId, setToken, setObjectId, setChecklistId, setLang, setDraftId } = appSlice.actions;

const persistedAppState = loadState();

const store = configureStore({
    reducer: {
        app: appSlice.reducer,
    },
    preloadedState: persistedAppState !== undefined ? { app: persistedAppState } : undefined,
});

store.subscribe(() => saveState(store.getState()));

export default store;
