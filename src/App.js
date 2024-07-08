// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import ObjectsList from './components/ObjectsList';
import ChecklistList from './components/ChecklistList';
import QuestionsStepper from './components/QuestionsStepper';
import ThemeProviderWrapper from './ThemeProviderWrapper';

const App = () => {
  const [chatId, setChatId] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const chatIdParam = params.get('chat_id');
    const tokenParam = params.get('token');
    if (chatIdParam && tokenParam) {
      setChatId(chatIdParam);
      setToken(tokenParam);
      setIsAuthorized(true);
    }

    const tg = window.Telegram.WebApp;
    if (tg) {
      const themeParams = tg.themeParams;
      const isDarkMode = themeParams?.bg_color?.toLowerCase() === '#000000';
      setDarkMode(isDarkMode);
    }
  }, []);

  return (
    <ThemeProviderWrapper darkMode={darkMode}>
      <Router>
        <Routes>
          {isAuthorized ? (
            <>
              <Route path="/objects" element={<ObjectsList chatId={chatId} token={token} />} />
              <Route path="/checklists" element={<ChecklistList chatId={chatId} token={token} />} />
              <Route path="/questions" element={<QuestionsStepper chatId={chatId} token={token} />} />
              <Route path="*" element={<Navigate to="/objects" />} />
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
