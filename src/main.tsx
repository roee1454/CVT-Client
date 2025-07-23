import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import './index.css'
import { Toaster } from 'sonner';
import { UserProvider } from './context/auth-context.tsx';

const client = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnMount: true,
      refetchInterval: false,
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
      retryOnMount: true
    },
    mutations: {
      retry: 1,
    }
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.Fragment>
    <QueryClientProvider client={client}>
      <UserProvider>
        <BrowserRouter>
          <App />
          <Toaster />
        </BrowserRouter>
      </UserProvider>
    </QueryClientProvider>
  </React.Fragment>,
)
