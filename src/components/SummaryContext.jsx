import React, { createContext, useState, useContext } from 'react';

const SummaryContext = createContext();

export const SummaryProvider = ({ children }) => {
    const [summaryContent, setSummaryContent] = useState(null);

    return (
        <SummaryContext.Provider value={{ summaryContent, setSummaryContent }}>
            {children}
        </SummaryContext.Provider>
    );
};

export const useSummary = () => useContext(SummaryContext);
