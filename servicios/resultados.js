import { obtenerCampeonatoId, actualizarCampeonato } from './campeonatos';
import { obtenerPosicionesGrupo } from './fases';

// ==================== TABLA DE POSICIONES ====================

export async function obtenerPosicionesCampeonato(idCampeonato) {
  const campeonato = await obtenerCampeonatoId(idCampeonato);
  if (!campeonato) throw new Error('Campeonato no encontrado');

  if (!championship.phases.groups) {
    return { groups: [] };
  }

  const standings = {
    groups: championship.phases.groups.groups.map(group => ({
      ...group,
      teams: group.teams.sort((a, b) => {
        if (b.stats.points !== a.stats.points) {
          return b.stats.points - a.stats.points;
        }
        const aDiff = a.stats.goalsFor - a.stats.goalsAgainst;
        const bDiff = b.stats.goalsFor - b.stats.goalsAgainst;
        if (bDiff !== aDiff) return bDiff - aDiff;
        return b.stats.goalsFor - a.stats.goalsFor;
      })
    }))
  };

  return standings;
}

export async function getTeamStats(championshipId, teamId) {
  const championship = await getChampionshipById(championshipId);
  if (!championship) throw new Error('Campeonato no encontrado');

  let team = null;
  let matches = [];
  let groupName = '';

  if (championship.phases.groups) {
    for (const group of championship.phases.groups.groups) {
      const foundTeam = group.teams.find(t => t.id === teamId);
      if (foundTeam) {
        team = foundTeam;
        matches = group.matches.filter(m => m.home.id === teamId || m.away.id === teamId);
        groupName = group.name;
        break;
      }
    }
  }

  if (!team) throw new Error('Equipo no encontrado');

  return {
    team,
    groupName,
    stats: team.stats,
    matches: matches.map(m => ({
      ...m,
      opponent: m.home.id === teamId ? m.away : m.home,
      isHome: m.home.id === teamId,
      goalsFor: m.home.id === teamId ? m.homeGoals : m.awayGoals,
      goalsAgainst: m.home.id === teamId ? m.awayGoals : m.homeGoals
    }))
  };
}

export async function getMatchDetails(championshipId, groupId, matchId) {
  const championship = await getChampionshipById(championshipId);
  if (!championship) throw new Error('Campeonato no encontrado');

  const group = championship.phases.groups?.groups?.find(g => g.id === groupId);
  if (!group) throw new Error('Grupo no encontrado');

  const match = group.matches.find(m => m.id === matchId);
  if (!match) throw new Error('Partido no encontrado');

  return {
    match,
    group: group.name,
    homeTeamStats: match.home.stats,
    awayTeamStats: match.away.stats
  };
}

export async function generateReports(championshipId) {
  const championship = await getChampionshipById(championshipId);
  if (!championship) throw new Error('Campeonato no encontrado');

  const reports = {
    championshipName: championship.name,
    status: championship.status,
    totalTeams: championship.teams.length,
    groupPhase: null,
    playoffPhase: null,
    topScorers: getTopScorers(championship),
    summary: null
  };

  if (championship.phases.groups) {
    reports.groupPhase = {
      status: championship.phases.groups.status,
      groups: championship.phases.groups.groups.map(g => ({
        name: g.name,
        teams: g.teams.map(t => ({
          name: t.name,
          points: t.stats.points,
          played: t.stats.played,
          won: t.stats.won,
          drawn: t.stats.drawn,
          lost: t.stats.lost,
          goalsFor: t.stats.goalsFor,
          goalsAgainst: t.stats.goalsAgainst,
          goalDifference: t.stats.goalsFor - t.stats.goalsAgainst
        }))
      }))
    };
  }

  if (championship.phases.playoffs) {
    reports.playoffPhase = {
      status: championship.phases.playoffs.status,
      matches: championship.phases.playoffs.matches.map(m => ({
        name: m.name,
        home: m.home.name,
        away: m.away.name,
        homeGoals: m.homeGoals,
        awayGoals: m.awayGoals,
        result: m.result,
        played: m.played
      }))
    };
  }

  reports.summary = `${championship.name} - ${championship.status}`;

  return reports;
}

function getTopScorers(championship) {
  const scorers = [];

  if (championship.phases.groups) {
    for (const group of championship.phases.groups.groups) {
      for (const team of group.teams) {
        for (const player of team.players) {
          if (player.goals > 0) {
            scorers.push({
              name: player.name,
              team: team.name,
              goals: player.goals
            });
          }
        }
      }
    }
  }

  return scorers.sort((a, b) => b.goals - a.goals);
}

// ==================== ACTUALIZAR ANOTACIONES DE JUGADORES ====================

export async function updatePlayerGoals(championshipId, groupId, matchId, { homePlayerId, awayPlayerId, homeGoals, awayGoals }) {
  const championship = await getChampionshipById(championshipId);
  if (!championship) throw new Error('Campeonato no encontrado');

  const group = championship.phases.groups?.groups?.find(g => g.id === groupId);
  if (!group) throw new Error('Grupo no encontrado');

  const match = group.matches.find(m => m.id === matchId);
  if (!match) throw new Error('Partido no encontrado');

  // Actualizar goles del jugador local
  if (homePlayerId) {
    const homePlayer = match.home.players.find(p => p.id === homePlayerId);
    if (homePlayer) {
      homePlayer.goals += parseInt(homeGoals) || 0;
    }
  }

  // Actualizar goles del jugador visitante
  if (awayPlayerId) {
    const awayPlayer = match.away.players.find(p => p.id === awayPlayerId);
    if (awayPlayer) {
      awayPlayer.goals += parseInt(awayGoals) || 0;
    }
  }

  await updateChampionship(championshipId, { phases: championship.phases });
  return match;
}
