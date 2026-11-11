import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom'

import MainLayout from './components/layout/MainLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'

import Dashboard from './pages/Dashboard'
import Diagnosis from './pages/Diagnosis'
import History from './pages/History'
import DiseaseLibrary from './pages/DiseaseLibrary'
import Settings from './pages/Settings'
import Login from './pages/Login'
import Register from './pages/Register'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
      <Routes>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>

          <Route path="/" element={<Dashboard />} />

          <Route
            path="/diagnosis"
            element={<Diagnosis />}
          />

          <Route
            path="/history"
            element={<History />}
          />

          <Route
            path="/library"
            element={<DiseaseLibrary />}
          />

          <Route
            path="/settings"
            element={<Settings />}
          />

        </Route>
        </Route>

      </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
