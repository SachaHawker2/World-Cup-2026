import fs from 'fs'
import path from 'path'
import type { Config, Standings } from '@/types'

export function getConfig(): Config {
  const raw = fs.readFileSync(path.join(process.cwd(), 'data', 'config.json'), 'utf-8')
  return JSON.parse(raw)
}

export async function getStandings(): Promise<Standings> {
  const raw = fs.readFileSync(path.join(process.cwd(), 'data', 'standings.json'), 'utf-8')
  return JSON.parse(raw)
}

export { formatCurrency, formatMatchDate, getStageLabel, getTeamProgressScore } from './utils'
