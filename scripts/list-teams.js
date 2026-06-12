#!/usr/bin/env node
// Lists all WC 2026 teams sorted by FIFA ranking, showing which would be excluded.
// Run: FOOTBALL_DATA_API_KEY=xxx node scripts/list-teams.js [number_of_participants]
//
// Examples:
//   node scripts/list-teams.js        — lists all 48 teams in ranking order
//   node scripts/list-teams.js 10     — shows draw with 10 participants (4 teams each, 8 excluded)

const API_KEY = process.env.FOOTBALL_DATA_API_KEY
if (!API_KEY) {
  console.error('Error: FOOTBALL_DATA_API_KEY environment variable is required')
  process.exit(1)
}

const { FIFA_RANKINGS } = require('./draw.js')
const nParticipants = parseInt(process.argv[2]) || null

async function main() {
  const res = await fetch('https://api.football-data.org/v4/competitions/WC/teams', {
    headers: { 'X-Auth-Token': API_KEY }
  })
  if (!res.ok) { console.error(`API error: ${res.status}`); process.exit(1) }

  const data = await res.json()
  const apiTeams = data.teams.map(t => t.name)

  const sorted = [...apiTeams].sort((a, b) => {
    return (FIFA_RANKINGS[a] ?? 999) - (FIFA_RANKINGS[b] ?? 999)
  })

  const teamsInDraw = nParticipants ? Math.floor(apiTeams.length / nParticipants) * nParticipants : apiTeams.length
  const excludedCount = apiTeams.length - teamsInDraw

  const header = nParticipants
    ? `${apiTeams.length} teams · ${nParticipants} participants · ${Math.floor(apiTeams.length / nParticipants)} teams each · ${excludedCount} excluded`
    : `${apiTeams.length} teams — pass a participant count to see exclusions`

  console.log(`\n${header}\n`)

  sorted.forEach((name, i) => {
    const rank = FIFA_RANKINGS[name]
    const rankLabel = rank ? `#${String(rank).padStart(2)}` : '  ?'
    const excluded = i >= teamsInDraw
    const flag = !rank ? ' ⚠ not in rankings map' : ''
    const marker = excluded ? ' ← EXCLUDED' : ''
    console.log(`  ${rankLabel}  ${name}${flag}${marker}`)
  })

  if (sorted.some(t => !FIFA_RANKINGS[t])) {
    console.log('\n⚠  Teams marked with ? are not in the FIFA_RANKINGS map in draw.js.')
    console.log('   They will be treated as lowest-ranked and excluded first.')
    console.log('   Update the FIFA_RANKINGS object in scripts/draw.js with the exact names above.')
  }
}

main().catch(err => { console.error(err.message); process.exit(1) })
