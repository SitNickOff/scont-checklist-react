import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Auth from './components/Auth';
import ObjectsList from './components/ObjectsList';
import ChecklistList from './components/ChecklistList';
import QuestionsList from './components/QuestionsList';

const App = () => {
    const [chatId] = useState('328084848'); // Пример chat_id, измените по необходимости
    const [isAuthorized, setIsAuthorized] = useState(false);

    const handleAuthorized = () => {
        setIsAuthorized(true);
    };

    return (
        <Router>
            <Routes>
                <Route path="/" element={!isAuthorized ? <Auth chatId={chatId} onAuthorized={handleAuthorized} /> : <Navigate to="/objects" />} />
                {isAuthorized && (
                    <>
                        <Route path="/objects" element={<ObjectsList chatId={chatId} />} />
                        <Route path="/checklists" element={<ChecklistList chatId={chatId} />} />
                        <Route path="/questions" element={<QuestionsList chatId={chatId} />} />
                    </>
                )}
                {/* Redirect any unknown paths */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
};

export default App;
