import { getConfig, getStandings } from '@/lib/data'
import DrawClient from './DrawClient'

export default async function DrawPage() {
  const [config, standings] = await Promise.all([
    Promise.resolve(getConfig()),
    getStandings()
  ])

  return <DrawClient config={config} standings={standings} />
}
