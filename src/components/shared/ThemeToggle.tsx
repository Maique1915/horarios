'use client';

import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-text-light-secondary dark:text-text-dark-secondary transition-colors"
            title={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
        >
            <span className="material-symbols-outlined text-xl">
                {theme === 'light' ? 'dark_mode' : 'light_mode'}
            </span>
        </button>
    );
};

export default ThemeToggle;
