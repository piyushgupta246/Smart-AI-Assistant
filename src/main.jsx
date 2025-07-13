import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import UserContext from './context/UserContext.jsx';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UserContext>
      <BrowserRouter> {/* ✅ REQUIRED for useNavigate */}
        <App />
      </BrowserRouter>
    </UserContext>
  </React.StrictMode>
);
