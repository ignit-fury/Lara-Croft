import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import './index.css'
import App from './App.tsx'

Sentry.init({
  dsn: "https://de6831f720428a01babf724ba8d817ed@o4512101252988928.ingest.us.sentry.io/4512101276516352",
  integrations: [
    Sentry.browserTracingIntegration(),
  ],
  tracesSampleRate: 1.0,
  tracePropagationTargets: ["localhost", /^https:\/\/.*\.trycloudflare\.com/, /^https:\/\/lara-croft\.vercel\.app/],
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={<div>Something went wrong.</div>}>
      <App />
    </Sentry.ErrorBoundary>
  </StrictMode>,
)
