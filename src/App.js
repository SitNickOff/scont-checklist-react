// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import ObjectsList from './components/ObjectsList';
import ChecklistList from './components/ChecklistList';
import QuestionsStepper from './components/QuestionsStepper';

const App = () => {
    const [chatId, setChatId] = useState(null);
    const [token, setToken] = useState(null);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const initDataUnsafe = window.Telegram.WebApp.initDataUnsafe;
        if (initDataUnsafe) {
            setChatId(initDataUnsafe.user.id);
            setToken(initDataUnsafe.query_id); // Используйте query_id в качестве токена
            setIsAuthorized(true);
        }
    }, []);

    return (
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
    );
};

export default App;
