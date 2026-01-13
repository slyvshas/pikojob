import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initGA } from './lib/analytics.js'

// Defer analytics initialization to improve initial load performance
// Use requestIdleCallback for non-blocking initialization
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => initGA());
} else {
  setTimeout(() => initGA(), 1);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
