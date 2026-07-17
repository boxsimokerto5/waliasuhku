import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register Service Worker for PWA
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch((err) => {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
} else if ('serviceWorker' in navigator) {
  // Also register in dev mode if needed, or print a debug note
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('ServiceWorker registered in development:', registration.scope);
      })
      .catch((err) => {
        console.log('ServiceWorker registration failed in dev:', err);
      });
  });
}

// Global PWA Installation Capture
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later.
  (window as any).deferredPrompt = e;
  // Dispatch a custom event to notify React components that prompt is ready
  window.dispatchEvent(new CustomEvent('pwa-prompt-available'));
  console.log('PWA installation prompt captured and stashed.');
});

window.addEventListener('appinstalled', () => {
  // Clear the deferredPrompt so it can't be used again
  (window as any).deferredPrompt = null;
  window.dispatchEvent(new CustomEvent('pwa-app-installed'));
  console.log('PWA WaliAsuhku telah sukses diinstal pada sistem.');
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

