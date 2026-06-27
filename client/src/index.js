import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { GoogleOAuthProvider } from '@react-oauth/google';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="976882479340-hhnvm1piea0if49smbh74efnab9smcr3.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);