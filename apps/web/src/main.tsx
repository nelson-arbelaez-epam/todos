import { QueryClientProvider } from '@tanstack/react-query';
import sharedFaviconUrl from '@todos/branding/favicon.svg?url';
import '@todos/branding/tokens.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import { createTodosQueryClient } from './query/query-client';

const existingFavicon =
  document.querySelector<HTMLLinkElement>("link[rel='icon']");
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

const queryClient = createTodosQueryClient();

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
