import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { ErrorBoundary } from './components/common/ErrorBoundary'

// Auto-clear cache if ?clearCache=true in URL
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('clearCache') === 'true') {
  console.log('🧹 [CACHE] Clearing all browser cache...');
  localStorage.clear();
  sessionStorage.clear();
  
  // Clear IndexedDB
  if (window.indexedDB && indexedDB.databases) {
    indexedDB.databases().then(dbs => {
      dbs.forEach(db => {
        if (db.name) {
          indexedDB.deleteDatabase(db.name);
          console.log('🗑️ [CACHE] Deleted IndexedDB:', db.name);
        }
      });
    });
  }
  
  console.log('✅ [CACHE] Cache cleared! Reloading...');
  
  // Remove clearCache param and reload
  const newUrl = window.location.origin + window.location.pathname;
  window.location.replace(newUrl);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
