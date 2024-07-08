import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        const tg = window.Telegram.WebApp;
        if (tg) {
            const themeParams = tg.themeParams;
            const isDarkMode = themeParams?.bg_color?.toLowerCase() === '#000000';
            setTheme(isDarkMode ? 'dark' : 'light');
        }
    }, []);

    return (
        <ThemeContext.Provider value={theme}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeProvider;
