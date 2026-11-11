
import Sidebar from './Sidebar'
import Header from './Header'

import { Outlet } from 'react-router-dom'

function MainLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col">

        {/* Header */}
        <Header />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-8">

          <Outlet />

        </main>

      </div>

    </div>
  )
}

export default MainLayout
