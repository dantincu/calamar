import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

// StrictMode runs extra checks in development (it renders components twice
// to help you find side effects that don't belong in rendering).
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
