import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

window.addEventListener('error', (e) => {
  console.error("Global window error:", e);
  const root = document.getElementById('root');
  if (root && (!root.innerHTML || root.innerHTML.trim() === '')) {
    root.innerHTML = `<div style="color:#ef4444;background:#0f172a;padding:24px;margin:20px;border-radius:12px;border:1px solid #ef4444;font-family:monospace;white-space:pre-wrap;"><h2>Global Error:</h2>${e.error ? (e.error.stack || e.error.message) : e.message}</div>`;
  }
});

window.addEventListener('unhandledrejection', (e) => {
  console.error("Unhandled promise rejection:", e);
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
