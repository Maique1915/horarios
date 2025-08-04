import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const router = createBrowserRouter([
    {
        path: '/',
        element: <App cur="engcomp" />,
        errorElement: <App cur="engcomp" />,
    },
    {
        path: 'matematica',
        element: <App cur="matematica" />
    },
    {
        path: 'fisica',
        element: <App cur="fisica" />
    },
    {
        path: 'engcomp',
        element: <App cur="engcomp" />
    },
    {
        path: 'turismo',
        element: <App cur="turismo" />
    },
])

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <RouterProvider router={router} />
  </React.StrictMode>,
)
