// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import ObjectsList from './components/ObjectsList';
import ChecklistList from './components/ChecklistList';
import QuestionsStepper from './components/QuestionsStepper';
import ThemeProvider, { useTheme } from './ThemeContext';
import { lightTheme, darkTheme } from './themes';

const AppContent = ({ chatId, token }) => {
    const theme = useTheme();

    return (
        <MuiThemeProvider theme={theme === 'dark' ? darkTheme : lightTheme}>
            <Router>
                <Routes>
                    <Route path="/objects" element={<ObjectsList chatId={chatId} token={token} />} />
                    <Route path="/checklists" element={<ChecklistList chatId={chatId} token={token} />} />
                    <Route path="/questions" element={<QuestionsStepper chatId={chatId} token={token} />} />
                    <Route path="*" element={<Navigate to="/objects" />} />
                </Routes>
            </Router>
        </MuiThemeProvider>
    );
};

const App = () => {
    const [chatId, setChatId] = useState(null);
    const [token, setToken] = useState(null);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const chatIdParam = params.get('chat_id');
        const tokenParam = params.get('token');
        if (chatIdParam && tokenParam) {
            setChatId(chatIdParam);
            setToken(tokenParam);
            setIsAuthorized(true);
        }
    }, []);

    return (
        <ThemeProvider>
            {isAuthorized ? (
                <AppContent chatId={chatId} token={token} />
            ) : (
                <div>Loading...</div>
            )}
        </ThemeProvider>
    );
};

export default App;
