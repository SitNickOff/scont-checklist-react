import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import store, { setAgent, setChatId, setLang, setToken } from './store';
import ObjectsList from './components/ObjectsList';
import ChecklistList from './components/ChecklistList';
import QuestionsStepper from './components/QuestionsStepper';
import ThemeProviderWrapper from './ThemeProviderWrapper';

const STORAGE_KEYS = {
  CHAT_ID: 'tg_chat_id',
  TOKEN: 'tg_token',
  LANG: 'tg_lang',
  AGENT: 'tg_agent',
};

const DEFAULT_AGENT = 'telegram';
const ALLOWED_AGENTS = new Set(['telegram', 'max']);

const normalizeAgent = (value) => (
  ALLOWED_AGENTS.has(value) ? value : DEFAULT_AGENT
);

const getStoredParams = () => {
  const chatId = sessionStorage.getItem(STORAGE_KEYS.CHAT_ID);
  const token = sessionStorage.getItem(STORAGE_KEYS.TOKEN);
  const lang = sessionStorage.getItem(STORAGE_KEYS.LANG) || 'ru';
  const agent = normalizeAgent(sessionStorage.getItem(STORAGE_KEYS.AGENT));
  return { chatId, token, lang, agent };
};

const storeParams = (chatId, token, lang, agent) => {
  sessionStorage.setItem(STORAGE_KEYS.CHAT_ID, chatId);
  sessionStorage.setItem(STORAGE_KEYS.TOKEN, token);
  sessionStorage.setItem(STORAGE_KEYS.LANG, lang);
  sessionStorage.setItem(STORAGE_KEYS.AGENT, agent);
};

const App = () => {
  const { chatId: storeChatId, token: storeToken } = useSelector((state) => state.app);
  const [isAuthorized, setIsAuthorized] = useState(Boolean(storeChatId && storeToken));
  const [darkMode, setDarkMode] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let chatIdParam = params.get('chat_id');
    let tokenParam = params.get('token');
    let langParam = params.get('lang') || 'ru';
    let agentParam = normalizeAgent(params.get('agent'));

    if (!chatIdParam || !tokenParam) {
      const stored = getStoredParams();
      const appState = store.getState().app;
      if (stored.chatId && stored.token) {
        chatIdParam = stored.chatId;
        tokenParam = stored.token;
        langParam = stored.lang;
        agentParam = stored.agent;
      } else if (appState.chatId && appState.token) {
        chatIdParam = appState.chatId;
        tokenParam = appState.token;
        langParam = appState.lang || 'ru';
      }
      if (chatIdParam && tokenParam) {
        const newSearch = new URLSearchParams({
          chat_id: chatIdParam,
          token: tokenParam,
          lang: langParam,
          agent: agentParam,
        }).toString();
        window.history.replaceState(null, '', `${window.location.pathname}${window.location.hash}?${newSearch}`);
      }
    }

    if (chatIdParam && tokenParam) {
      storeParams(chatIdParam, tokenParam, langParam, agentParam);
      dispatch(setChatId(chatIdParam));
      dispatch(setToken(tokenParam));
      dispatch(setLang(langParam));
      dispatch(setAgent(agentParam));
      setIsAuthorized(true);
    }

    const tg = window.Telegram?.WebApp;
    if (tg) {
      const themeParams = tg.themeParams;
      const isDarkMode = themeParams?.bg_color?.toLowerCase() === '#000000';
      setDarkMode(isDarkMode);
    } else {
      console.info('Telegram WebApp is not available. Running in browser mode.');
    }
  }, [dispatch]);

  return (
    <ThemeProviderWrapper darkMode={darkMode}>
      <Router>
        <Routes>
          {isAuthorized ? (
            <>
              <Route path="/objects" element={<ObjectsList />} />
              <Route path="/checklists" element={<ChecklistList />} />
              <Route path="/questions" element={<QuestionsStepper />} />
              <Route path="*" element={<Navigate to={`/objects${window.location.search || ''}`} />} />
            </>
          ) : (
            <Route path="*" element={<div>Loading...</div>} />
          )}
        </Routes>
      </Router>
    </ThemeProviderWrapper>
  );
};

export default App;
