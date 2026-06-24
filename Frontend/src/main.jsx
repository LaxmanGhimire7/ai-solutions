import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import App from './App.jsx';
import { warmBackend } from './api/axios.js';
import { AuthProvider } from './context/AuthContext.jsx';
import './index.css';

if (import.meta.env.PROD) {
  warmBackend().catch(() => {
    // Individual API actions still show their own user-facing error messages.
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
