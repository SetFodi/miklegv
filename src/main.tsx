import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/outfit'
import '@fontsource-variable/syne'
import '@fontsource/noto-sans-georgian/400.css'
import '@fontsource/noto-sans-georgian/600.css'
import App from './App'
import AdminApp from './admin/AdminApp'
import './styles.css'

const isAdminRoute = window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isAdminRoute ? <AdminApp /> : <App />}
  </StrictMode>,
)
