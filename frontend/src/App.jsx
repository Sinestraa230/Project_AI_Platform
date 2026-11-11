import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom'

import MainLayout from './components/layout/MainLayout'

import Dashboard from './pages/Dashboard'
import Diagnosis from './pages/Diagnosis'
import History from './pages/History'
import DiseaseLibrary from './pages/DiseaseLibrary'
import Settings from './pages/Settings'

function App() {
  return (
    <BrowserRouter>
      <Routes>

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

      </Routes>
    </BrowserRouter>
  )
}

export default App
