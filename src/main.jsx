import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import ErrorBoundary from './components/shared/ErrorBoundary.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#111118',
            color: '#E2E8F0',
            border: '1px solid #1E1E2E',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#00D4FF', secondary: '#111118' },
            duration: 2500,
          },
          error: {
            iconTheme: { primary: '#EF4444', secondary: '#111118' },
            duration: 4000,
          },
        }}
      />
    </ErrorBoundary>
  </React.StrictMode>,
)
