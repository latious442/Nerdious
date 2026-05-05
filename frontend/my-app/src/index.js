import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Identity from './pages/Identity';
import Admin from './pages/Admin';
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />
  },
  {
    path: '/identity',
    element: <Identity />
  },
  {
    path: '/admin',
    element: <Admin />
  }
]); // <-- FIXED (closed properly)

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <RouterProvider router={router} />
);

reportWebVitals();