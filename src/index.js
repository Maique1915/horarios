import React from 'react';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as ReactDOMClient from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { cursos } from './model/Filtro';
function rotas() {
    const res = []
    let aux = {
        path: "/",
        element: <App cur={"engcomp"} />,
    }
    res.push(aux)
  for (const r of cursos()) {
    let aux = {
      path: "/" + r,
      element: <App cur={r} />,
    }
    res.push(aux)
  }
  return res;
}

const routes = createBrowserRouter(rotas());

const root = ReactDOMClient.createRoot(document.getElementById("root"));
//<RouterProvider router={routes}/>
root.render(
    <RouterProvider router={routes}/>
);

reportWebVitals();
