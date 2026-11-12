import Sidebar from './Sidebar'
import Header from './Header'

import { Outlet } from 'react-router-dom'

function MainLayout() {
  return (
    <div className="relative flex h-screen overflow-hidden bg-[#f0f4ee] text-gray-900 transition-colors dark:bg-[#0d1210] dark:text-gray-100">

      {/* Các đốm màu mờ phía sau, để lớp kính có thứ để làm nhòe */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-24 h-[500px] w-[500px] rounded-full bg-[#4ade80]/35 blur-[120px] dark:bg-[#22c55e]/35" />
        <div className="absolute -right-24 top-[20%] h-[550px] w-[550px] rounded-full bg-[#fcd34d]/40 blur-[140px] dark:bg-[#f59e0b]/25" />
        <div className="absolute -bottom-20 left-1/4 h-[500px] w-[600px] rounded-full bg-[#5eead4]/35 blur-[130px] dark:bg-[#14b8a6]/30" />
        {/* Thêm 2 đốm để kính có nhiều màu khúc xạ */}
        <div className="absolute left-[45%] top-[8%] h-[380px] w-[380px] rounded-full bg-[#a3e635]/30 blur-[110px] dark:bg-[#84cc16]/20" />
        <div className="absolute -bottom-32 -right-20 h-[480px] w-[480px] rounded-full bg-[#7dd3fc]/30 blur-[130px] dark:bg-[#0ea5e9]/15" />
      </div>

      <Sidebar />

      <div className="relative flex min-w-0 flex-1 flex-col">
        <main className="flex-1 space-y-6 overflow-y-auto p-6 xl:p-8">
          <Header />
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default MainLayout
