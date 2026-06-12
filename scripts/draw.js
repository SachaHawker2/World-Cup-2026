#!/usr/bin/env node
// Randomly assigns World Cup teams to participants and writes data/config.json
//
// Usage:
//   FOOTBALL_DATA_API_KEY=xxx node scripts/draw.js "Alice,Bob,Charlie,Dave,Eve,Frank,Grace,Harry,Isla,Jack"
//
// - Fetches all 48 WC teams from football-data.org
// - Excludes the lowest FIFA-ranked teams so remaining count divides evenly
// - Randomly shuffles remaining teams and assigns evenly to each participant
// - Writes the result to data/config.json (overwrites existing participant assignments)

const fs = require('fs')
const path = require('path')

// FIFA rankings for 2026 World Cup qualified teams.
// Lower number = higher ranked = less likely to be excluded.
// Edit this list if team names differ from the API response (run list-teams.js to check).
// Official FIFA rankings as used in the WC 2026 sweepstakes draw.
const FIFA_RANKINGS = module.exports.FIFA_RANKINGS = {
  'Argentina': 1,
  'Spain': 2,
  'France': 3,
  'England': 4,
  'Portugal': 5,
  'Brazil': 6,
  'Netherlands': 7,
  'Germany': 8,
  'Belgium': 9,
  'Croatia': 10,
  'Morocco': 11,
  'Colombia': 12,
  'Senegal': 13,
  'Mexico': 14,
  'United States': 15,
  'Uruguay': 16,
  'Japan': 17,
  'Switzerland': 18,
  'Iran': 19,
  'Turkey': 20,
  'Ecuador': 21,
  'Austria': 22,
  'South Korea': 23,
  'Australia': 24,
  'Algeria': 25,
  'Egypt': 26,
  'Canada': 27,
  'Norway': 28,
  'Panama': 29,
  'Ivory Coast': 30,
  'Paraguay': 31,
  'Qatar': 32,
  'Saudi Arabia': 33,
  'Iraq': 34,
  'Congo DR': 35,
  'South Africa': 36,
  'Sweden': 37,
  'Scotland': 38,
  'Czechia': 39,
  'Uzbekistan': 40,
  'Jordan': 41,
  'Tunisia': 42,
  'Ghana': 43,
  'Cape Verde Islands': 44,
  'Bosnia-Herzegovina': 45,
  'New Zealand': 46,
  'Haiti': 47,
  'Curaçao': 48,
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

async function reveal(team, rank, participant) {
  const rankLabel = `(#${rank})`
  const label = `${team} ${rankLabel}`
  const maxLen = 36
  const dotCount = Math.max(4, maxLen - label.length)
  process.stdout.write(`  ⚽ ${label} `)
  await sleep(1000)
  for (let i = 0; i < dotCount; i++) {
    process.stdout.write('.')
    await sleep(80)
  }
  process.stdout.write(' ')
  await sleep(800)
  process.stdout.write(`${participant}\n`)
  await sleep(600)
}

async function main(API_KEY, participants) {
  const res = await fetch('https://api.football-data.org/v4/competitions/WC/teams', {
    headers: { 'X-Auth-Token': API_KEY }
  })
  if (!res.ok) {
    console.error(`API error: ${res.status}`)
    process.exit(1)
  }

  const data = await res.json()
  const allTeams = data.teams.map(t => t.name)

  const n = participants.length
  const teamsPerPerson = Math.floor(allTeams.length / n)
  const teamsInDraw = teamsPerPerson * n
  const excluded = allTeams.length - teamsInDraw

  // Sort by FIFA ranking (unknown teams get rank 999 — excluded first)
  const sorted = [...allTeams].sort((a, b) => (FIFA_RANKINGS[a] ?? 999) - (FIFA_RANKINGS[b] ?? 999))

  const excludedTeams = sorted.slice(teamsInDraw)
  const drawTeams = sorted.slice(0, teamsInDraw)

  console.log('\n')
  console.log('  ╔══════════════════════════════════════╗')
  console.log('  ║   FIFA WORLD CUP 2026 — THE DRAW    ║')
  console.log('  ╚══════════════════════════════════════╝')
  console.log(`\n  ${n} participants · ${teamsPerPerson} teams each · ${excluded} excluded\n`)

  if (excludedTeams.length > 0) {
    console.log(`  Excluded (lowest ranked): ${excludedTeams.join(', ')}\n`)
  }

  await sleep(1000)
  console.log('  Drawing now...\n')
  await sleep(800)

  const shuffled = shuffle(drawTeams)
  const assignments = participants.map((name, i) => ({
    name,
    teams: shuffled.slice(i * teamsPerPerson, (i + 1) * teamsPerPerson)
  }))

  // Flatten all team→person pairs then shuffle for a fully random reveal order
  const revealOrder = shuffle(
    assignments.flatMap(p => p.teams.map(t => ({ team: t, participant: p.name })))
  )

  for (const { team, participant } of revealOrder) {
    await reveal(team, FIFA_RANKINGS[team] ?? '?', participant)
  }

  // Summary
  console.log('\n  ─────────────────────────────────────────')
  console.log('  FINAL DRAW SUMMARY\n')
  assignments.forEach(p => {
    console.log(`  ${p.name}`)
    p.teams.forEach(t => console.log(`    · ${t}`))
    console.log()
  })

  // Write config
  const configPath = path.join(__dirname, '../data/config.json')
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
  config.participants = assignments
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2))

  console.log('  ✓ data/config.json updated.')
  console.log('  Push to deploy: git add data/config.json && git commit -m "config: draw results" && git push\n')
}

if (require.main === module) {
  const API_KEY = process.env.FOOTBALL_DATA_API_KEY
  if (!API_KEY) { console.error('Error: FOOTBALL_DATA_API_KEY environment variable is required'); process.exit(1) }

  const participantArg = process.argv[2]
  if (!participantArg) { console.error('Usage: node scripts/draw.js "Name1,Name2,..."'); process.exit(1) }

  const participants = participantArg.split(',').map(n => n.trim()).filter(Boolean)
  if (participants.length < 2) { console.error('Error: at least 2 participants required'); process.exit(1) }

  main(API_KEY, participants).catch(err => { console.error('Draw failed:', err.message); process.exit(1) })
}
