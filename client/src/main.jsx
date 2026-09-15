import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext'

// Entry point: mounts the React app into the DOM element with id="root"
ReactDOM.createRoot(document.getElementById('root')).render(
    // StrictMode highlights potential problems during development
    // (e.g. deprecated APIs, side effects) by intentionally double-invoking certain functions
    <React.StrictMode>
        {/* Wraps the entire app so all components can access auth state via useContext(AuthContext) */}
        <AuthProvider>
            <App />
        </AuthProvider>
    </React.StrictMode>,
)
