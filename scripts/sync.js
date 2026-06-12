#!/usr/bin/env node
// Fetches 2026 World Cup match data from football-data.org and writes standings.json
// Run: FOOTBALL_DATA_API_KEY=xxx node scripts/sync.js

const fs = require('fs')
const path = require('path')
const { FIFA_RANKINGS } = require('./draw')

const API_KEY = process.env.FOOTBALL_DATA_API_KEY
const BASE_URL = 'https://api.football-data.org/v4'
const COMPETITION = 'WC' // FIFA World Cup

if (!API_KEY) {
  console.error('Error: FOOTBALL_DATA_API_KEY environment variable is required')
  process.exit(1)
}

async function apiGet(endpoint) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { 'X-Auth-Token': API_KEY }
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API ${endpoint} → ${res.status}: ${text}`)
  }
  return res.json()
}

// Returns goals for a match, including extra time if played
function getMatchGoals(match) {
  const et = match.score?.extraTime
  if (et?.home != null && et?.away != null) {
    return { home: et.home, away: et.away }
  }
  const ft = match.score?.fullTime
  return { home: ft?.home ?? 0, away: ft?.away ?? 0 }
}

const STAGE_RANK = {
  GROUP_STAGE: 1,
  ROUND_OF_32: 2,
  ROUND_OF_16: 3,
  QUARTER_FINALS: 4,
  SEMI_FINALS: 5,
  THIRD_PLACE: 6,
  FINAL: 7
}

async function main() {
  const configPath = path.join(__dirname, '../data/config.json')
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))

  const configuredTeams = new Set(config.participants.flatMap(p => p.teams))

  if (configuredTeams.size === 0) {
    console.warn('Warning: No teams configured in config.json. Run list-teams.js to see team names.')
    process.exit(0)
  }

  console.log(`Fetching data for ${configuredTeams.size} configured teams...`)

  const [teamsData, matchesData] = await Promise.all([
    apiGet(`/competitions/${COMPETITION}/teams`),
    apiGet(`/competitions/${COMPETITION}/matches`)
  ])

  // Build team registry keyed by name
  const teams = {}

  for (const teamName of configuredTeams) {
    // Find matching API team (case-insensitive fallback)
    const apiTeam = teamsData.teams.find(
      t => t.name === teamName || t.shortName === teamName || t.tla === teamName
    )

    teams[teamName] = {
      id: apiTeam?.id ?? null,
      name: teamName,
      crest: apiTeam?.crest ?? null,
      fifaRank: FIFA_RANKINGS[teamName] ?? null,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      played: 0,
      eliminated: false,
      round: null,
      finishPosition: null,
      nextMatch: null
    }
  }

  // Process finished matches involving configured teams
  for (const match of matchesData.matches) {
    if (match.status !== 'FINISHED') continue

    const homeName = match.homeTeam?.name
    const awayName = match.awayTeam?.name
    const homeTeam = teams[homeName]
    const awayTeam = teams[awayName]

    if (!homeTeam && !awayTeam) continue

    const { home: homeGoals, away: awayGoals } = getMatchGoals(match)
    const stage = match.stage

    if (homeTeam) {
      homeTeam.goalsFor += homeGoals
      homeTeam.goalsAgainst += awayGoals
      homeTeam.goalDifference += homeGoals - awayGoals
      homeTeam.played += 1
      if (!homeTeam.round || (STAGE_RANK[stage] ?? 0) > (STAGE_RANK[homeTeam.round] ?? 0)) {
        homeTeam.round = stage
      }
    }
    if (awayTeam) {
      awayTeam.goalsFor += awayGoals
      awayTeam.goalsAgainst += homeGoals
      awayTeam.goalDifference += awayGoals - homeGoals
      awayTeam.played += 1
      if (!awayTeam.round || (STAGE_RANK[stage] ?? 0) > (STAGE_RANK[awayTeam.round] ?? 0)) {
        awayTeam.round = stage
      }
    }

    // Knockout elimination / finish positions
    if (stage !== 'GROUP_STAGE') {
      const winner = match.score?.winner
      let winnerName = null
      let loserName = null

      if (winner === 'HOME_TEAM') { winnerName = homeName; loserName = awayName }
      else if (winner === 'AWAY_TEAM') { winnerName = awayName; loserName = homeName }

      if (stage === 'FINAL') {
        if (winnerName && teams[winnerName]) teams[winnerName].finishPosition = 1
        if (loserName && teams[loserName]) teams[loserName].finishPosition = 2
      } else if (stage === 'THIRD_PLACE' || stage === 'THIRD_PLACE_PLAYOFF') {
        if (winnerName && teams[winnerName]) teams[winnerName].finishPosition = 3
        if (loserName && teams[loserName]) { teams[loserName].finishPosition = 4; teams[loserName].eliminated = true }
      } else {
        if (loserName && teams[loserName]) teams[loserName].eliminated = true
      }
    }
  }

  // Capture next upcoming match for each configured team
  for (const teamName of configuredTeams) {
    if (!teams[teamName] || teams[teamName].eliminated || teams[teamName].finishPosition) continue
    const upcoming = matchesData.matches
      .filter(m =>
        m.status !== 'FINISHED' &&
        m.status !== 'CANCELLED' &&
        (m.homeTeam?.name === teamName || m.awayTeam?.name === teamName)
      )
      .sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime())
    const next = upcoming[0]
    if (next) {
      teams[teamName].nextMatch = {
        date: next.utcDate,
        opponent: next.homeTeam?.name === teamName ? next.awayTeam?.name : next.homeTeam?.name,
        stage: next.stage
      }
    }
  }

  // Compute participant standings
  const participantStandings = config.participants.map(p => {
    const teamList = p.teams.map(t => teams[t] ?? { goalsFor: 0, goalsAgainst: 0, goalDifference: 0, played: 0 })

    const totalGoalsFor = teamList.reduce((s, t) => s + t.goalsFor, 0)
    const totalGoalsAgainst = teamList.reduce((s, t) => s + t.goalsAgainst, 0)
    const netGoalDifference = totalGoalsFor - totalGoalsAgainst

    const finishPositions = p.teams.map(t => teams[t]?.finishPosition).filter(Boolean)
    const bestFinishPosition = finishPositions.length > 0 ? Math.min(...finishPositions) : null

    return {
      name: p.name,
      teams: p.teams,
      totalGoalsFor,
      totalGoalsAgainst,
      netGoalDifference,
      bestFinishPosition,
      prizePosition: null
    }
  })

  // Assign prize position — only 1st place (holder of the World Cup winner)
  const byFinish = participantStandings
    .filter(p => p.bestFinishPosition !== null)
    .sort((a, b) => a.bestFinishPosition - b.bestFinishPosition)

  if (byFinish[0]) byFinish[0].prizePosition = 1

  // Compute prizes
  const totalPot = config.participants.length * config.entryFee
  const goalsRefundAmount = config.entryFee
  const remainingPot = totalPot - goalsRefundAmount

  const round2 = n => Math.round(n * 100) / 100

  const sortedByGD = [...participantStandings].sort((a, b) => a.netGoalDifference - b.netGoalDifference)
  const goalsLeader = sortedByGD[0]?.name ?? null
  const tournamentComplete = byFinish.length > 0 && byFinish[0].bestFinishPosition === 1
  const goalsRefundRecipient = tournamentComplete ? goalsLeader : null

  const standings = {
    lastUpdated: new Date().toISOString(),
    teams,
    participantStandings,
    prizes: {
      totalPot,
      goalsRefund: {
        leader: goalsLeader,
        recipient: goalsRefundRecipient,
        amount: goalsRefundAmount
      },
      remainingPot,
      first: {
        recipient: byFinish[0]?.name ?? null,
        amount: round2(remainingPot)
      }
    }
  }

  const outPath = path.join(__dirname, '../data/standings.json')
  fs.writeFileSync(outPath, JSON.stringify(standings, null, 2))
  console.log(`✓ standings.json updated (${matchesData.matches.filter(m => m.status === 'FINISHED').length} finished matches processed)`)
}

main().catch(err => {
  console.error('Sync failed:', err.message)
  process.exit(1)
})
