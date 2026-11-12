
import Sidebar from './Sidebar'
import Header from './Header'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/useAuth'

function MainLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 transition-colors dark:bg-gray-950 dark:text-gray-100">

      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">

        <Header onLogout={handleLogout} />

        <main className="flex-1 overflow-y-auto bg-gray-50 p-8 transition-colors dark:bg-gray-950">
          <Outlet />
        </main>

      </div>
    </div>
  )
}

export default MainLayout
