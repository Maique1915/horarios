import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import './index.css';
import AppLayout from './components/AppLayout';
import GeraGrade from './components/GeraGrade';
import Quadro from './components/Quadro';
import EditDb from './components/EditDb';
import Redirect from './components/Redirect';

const router = createBrowserRouter(
    [
        {
            path: '/',
            element: <AppLayout />,
            children: [
                { index: true, element: <Redirect to="/engcomp" /> },
                { path: ':cur', element: <GeraGrade /> },
                { path: ':cur/grades', element: <Quadro /> },
                { path: ':cur/edit', element: <EditDb /> }
            ]
        },
        {
            index: true, // Isso corresponde à rota pai '/'
            element: <GeraGrade /> // Renderiza GeraGrade com a prop padrão
        }
    ]
);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);
