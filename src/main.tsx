import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App'
import Dashboard from './pages/Dashboard'
import Field3D from './pages/Field3D'
import Sensors from './pages/Sensors'
import MetricsDetail from './pages/MetricsDetail'
import Terreno from './pages/Terreno'
import TerreniMapGoogle3D from './pages/TerreniMapGoogle3D'


const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            { index: true, element: <Dashboard /> },
            { path: 'terreni', element: <TerreniMapGoogle3D /> },
            { path: 'terreni/:tid', element: <Terreno /> },         // dashboard specifico terreno
            { path: 'terreni/:tid/3d', element: <Field3D /> },      // 3D del terreno selezionato
            { path: 'sonde', element: <Sensors /> },
            { path: 'metriche/:id', element: <MetricsDetail /> },
        ]
    }
])


ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
)