import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import './index.css';
import AppLayout from './components/AppLayout';
import Home from './components/Home';
import GeraGrade from './components/GeraGrade';
import Quadro from './components/Quadro';
import EditDb from './components/EditDb';
import Redirect from './components/Redirect';
import MapaMental from './components/MapaMental';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <AppLayout />,
      children: [
        { index: true, element: <Home /> },
        { path: 'login', element: <Login /> },
        { path: ':cur', element: <GeraGrade /> },
        { path: ':cur/grades', element: <Quadro /> },
        { 
          path: ':cur/edit', 
          element: <ProtectedRoute><EditDb /></ProtectedRoute> 
        },
        { path: ':cur/cronograma', element: <MapaMental /> }
      ]
    },
    {
      path: '/edit',
      element: <AppLayout />,
      children: [
        { 
          index: true, 
          element: <ProtectedRoute><EditDb /></ProtectedRoute> 
        }
      ]
    }
  ],
  {
    basename: '/Matricula/'
  }
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);