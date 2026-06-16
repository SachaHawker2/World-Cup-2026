import { getConfig, getStandings } from '@/lib/data'
import DashboardView from '@/components/dashboard/DashboardView'

export default async function DashboardPage() {
  const [config, standings] = await Promise.all([
    Promise.resolve(getConfig()),
    getStandings()
  ])

  return <DashboardView config={config} standings={standings} />
}
