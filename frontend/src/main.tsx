import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { hydrateContent } from './lib/api'

async function renderApp() {
  // Loads live content when VITE_API_URL is set. If the request fails or times
  // out, the bundled demo content is used instead, so the site still renders.
  await hydrateContent()

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

void renderApp()
