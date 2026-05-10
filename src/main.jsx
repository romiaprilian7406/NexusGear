import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#111118',
          color: '#E2E8F0',
          border: '1px solid #1E1E2E',
        },
        success: { iconTheme: { primary: '#00D4FF', secondary: '#111118' } },
        error: { iconTheme: { primary: '#EF4444', secondary: '#111118' } },
      }}
    />
  </React.StrictMode>,
)
