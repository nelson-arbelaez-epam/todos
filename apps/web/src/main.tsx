import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import sharedFaviconUrl from '../../../packages/shared/assets/todos-favicon.svg?url';
import './index.css';
import App from './App.tsx';

const existingFavicon = document.querySelector<HTMLLinkElement>("link[rel='icon']");
if (existingFavicon) {
  existingFavicon.href = sharedFaviconUrl;
} else {
  const favicon = document.createElement('link');
  favicon.rel = 'icon';
  favicon.type = 'image/svg+xml';
  favicon.href = sharedFaviconUrl;
  document.head.appendChild(favicon);
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
