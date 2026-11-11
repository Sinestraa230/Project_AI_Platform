
import { useEffect, useMemo, useState } from 'react'

import WelcomeSection from '../components/dashboard/WelcomeSection'
import StatsSection from '../components/dashboard/StatsSection'
import QuickAction from '../components/dashboard/QuickAction'
import RecentActivity from '../components/dashboard/RecentActivity'
import DiseaseOverview from '../components/dashboard/DiseaseOverview'
import { getStats } from '../services/statsService'
import { getDiseases } from '../services/libraryService'

function Dashboard() {
  const [stats, setStats] = useState(null)
  const [library, setLibrary] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([getStats(), getDiseases()])
      .then(([statsData, libraryData]) => {
        setStats(statsData)
        setLibrary(libraryData.diseases)
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [])

  // Bệnh gặp nhiều nhất trong lịch sử; chưa có lượt nào thì giới thiệu vài bệnh trong thư viện
  const overview = useMemo(() => {
    const byClass = new Map(library.map((d) => [d.className, d]))
    const top = (stats?.topDiseases ?? [])
      .map((t) => ({ ...byClass.get(t.className), count: t.count }))
      .filter((d) => d.name)
    if (top.length > 0) return { fromHistory: true, diseases: top }
    return { fromHistory: false, diseases: library.filter((d) => !d.isHealthy).slice(0, 3) }
  }, [stats, library])

  return (
    <div className="space-y-8">
      <WelcomeSection />

      {error && (
        <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>
      )}

      <StatsSection stats={stats} />
      <QuickAction />
      <RecentActivity records={stats?.recent ?? []} isLoading={isLoading} />
      <DiseaseOverview
        diseases={overview.diseases}
        fromHistory={overview.fromHistory}
        isLoading={isLoading}
      />
    </div>
  )
}

export default Dashboard
