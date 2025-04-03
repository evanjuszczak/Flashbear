import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Import AOS
import AOS from 'aos';
import 'aos/dist/aos.css'; // Import AOS styles

// Initialize AOS
AOS.init({
  duration: 800,
  once: true,
  easing: 'ease-in-out',
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
