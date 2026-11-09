
import WelcomeSection from '../components/dashboard/WelcomeSection'
import StatsSection from '../components/dashboard/StatsSection'
import QuickAction from '../components/dashboard/QuickAction'
import RecentActivity from '../components/dashboard/RecentActivity'
import DiseaseOverview from '../components/dashboard/DiseaseOverview'

function Dashboard() {
  return (
    <div className="space-y-8">
      <WelcomeSection />
      <StatsSection />
      <QuickAction />
      <RecentActivity />
      <DiseaseOverview />
    </div>
  )
}

export default Dashboard
