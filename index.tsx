import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import AdminTelemetry from './components/AdminTelemetry';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const isAdminRoute = () => {
  const { pathname, hash } = window.location;
  if (pathname.endsWith("/admin")) return true;
  if (hash === "#/admin" || hash.startsWith("#/admin")) return true;
  return false;
};

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    {isAdminRoute() ? <AdminTelemetry /> : <App />}
  </React.StrictMode>
);
