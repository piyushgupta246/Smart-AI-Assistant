import React, { createContext, useState } from 'react';

export const dataContext = createContext();

// Global state objects
export const user = {
    data: null,
    mime_type: null,
    imgUrl: null
};

export const pre_user = {
    data: null,
    mime_type: null,
    prompt: null,
    imgUrl: null
};

export function UserContext({ children }) {
    const [state, setState] = useState({
        startRes: false,
        userMessage: '',
        popUp: false,
        input: '',
        feature: 'chat',
        showresult: '',
        loading: false
    });

    const updateState = (newState) => {
        setState(prev => ({ ...prev, ...newState }));
    };

    const contextValue = {
        ...state,
        setStartRes: (val) => updateState({ startRes: val }),
        setUserMessage: (msg) => updateState({ userMessage: msg }),
        setPopUp: (val) => updateState({ popUp: val }),
        setInput: (val) => updateState({ input: val }),
        setfeature: (val) => updateState({ feature: val }),
        setshowresult: (val) => updateState({ showresult: val }),
        setLoading: (val) => updateState({ loading: val })
    };

    return (
        <dataContext.Provider value={contextValue}>
            {children}
        </dataContext.Provider>
    );
}

export default UserContext;