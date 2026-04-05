import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            fontFamily: 'DM Sans, sans-serif',
            borderRadius: '8px',
            background: '#1a1208',
            color: '#fdf6ec',
          },
          success: { iconTheme: { primary: '#d4822a', secondary: '#fdf6ec' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
