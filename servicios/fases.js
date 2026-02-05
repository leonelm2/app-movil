import { obtenerCampeonatoId, actualizarCampeonato } from './championships';

// ==================== FASES (GRUPOS Y ELIMINATORIAS) ====================

export async function crearFaseGrupos(idCampeonato, { nombre, cantidadGrupos }) {
  const campeonato = await obtenerCampeonatoId(idCampeonato);
  if (!campeonato) throw new Error('Campeonato no encontrado');

  const equipos = campeonato.equipos;
  if (equipos.length === 0) throw new Error('No hay equipos para crear grupos');

  const fasesGrupos = {
    id: Date.now().toString(),
    nombre,
    tipo: 'grupos',
    cantidadGrupos: parseInt(cantidadGrupos),
    grupos: [],
    jornadaActual: 1,
    estado: 'En curso'
  };

  // Distribuir equipos en grupos
  const equiposPorGrupo = Math.ceil(equipos.length / cantidadGrupos);
  let indiceEquipo = 0;

  for (let i = 0; i < cantidadGrupos; i++) {
    const equiposGrupo = equipos.slice(indiceEquipo, indiceEquipo + equiposPorGrupo);
    
    if (equiposGrupo.length > 0) {
      const grupo = {
        id: `grupo-${i + 1}`,
        nombre: `Grupo ${String.fromCharCode(65 + i)}`,
        equipos: equiposGrupo.map(t => ({
          ...t,
          estadisticas: {
            jugados: 0,
            ganados: 0,
            empatados: 0,
            perdidos: 0,
            golesAFavor: 0,
            golesEnContra: 0,
            puntos: 0
          }
        })),
        partidos: []
      };

      // Generar fixture (round-robin)
      grupo.partidos = generarFixture(grupo.equipos);
      fasesGrupos.grupos.push(grupo);
      indiceEquipo += equiposPorGrupo;
    }
  }

  campeonato.fases.grupos = fasesGrupos;
  await actualizarCampeonato(idCampeonato, { fases: campeonato.fases });
  return fasesGrupos;
}

function generarFixture(equipos) {
  const partidos = [];
  const n = equipos.length;

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      partidos.push({
        id: `partido-${partidos.length + 1}`,
        local: equipos[i],
        visitante: equipos[j],
        golesLocal: null,
        golesVisitante: null,
        resultado: null, // 'local', 'empate', 'visitante'
        jugado: false,
        fecha: '',
        observaciones: ''
      });
    }
  }

  return partidos;
}

export async function recordGroupMatch(championshipId, groupId, matchId, { homeGoals, awayGoals }) {
  const championship = await getChampionshipById(championshipId);
  if (!championship) throw new Error('Campeonato no encontrado');

  const groups = championship.phases.groups?.groups || [];
  const group = groups.find(g => g.id === groupId);
  if (!group) throw new Error('Grupo no encontrado');

  const match = group.matches.find(m => m.id === matchId);
  if (!match) throw new Error('Partido no encontrado');

  // Registrar resultado
  match.homeGoals = parseInt(homeGoals);
  match.awayGoals = parseInt(awayGoals);
  match.played = true;

  if (match.homeGoals > match.awayGoals) {
    match.result = 'home';
  } else if (match.homeGoals < match.awayGoals) {
    match.result = 'away';
  } else {
    match.result = 'draw';
  }

  // Actualizar estadísticas
  const homeTeam = group.teams.find(t => t.id === match.home.id);
  const awayTeam = group.teams.find(t => t.id === match.away.id);

  if (homeTeam) {
    homeTeam.stats.played += 1;
    homeTeam.stats.goalsFor += match.homeGoals;
    homeTeam.stats.goalsAgainst += match.awayGoals;
    if (match.result === 'home') {
      homeTeam.stats.won += 1;
      homeTeam.stats.points += 3;
    } else if (match.result === 'draw') {
      homeTeam.stats.drawn += 1;
      homeTeam.stats.points += 1;
    } else {
      homeTeam.stats.lost += 1;
    }
  }

  if (awayTeam) {
    awayTeam.stats.played += 1;
    awayTeam.stats.goalsFor += match.awayGoals;
    awayTeam.stats.goalsAgainst += match.homeGoals;
    if (match.result === 'away') {
      awayTeam.stats.won += 1;
      awayTeam.stats.points += 3;
    } else if (match.result === 'draw') {
      awayTeam.stats.drawn += 1;
      awayTeam.stats.points += 1;
    } else {
      awayTeam.stats.lost += 1;
    }
  }

  // Ordenar tabla de posiciones
  group.teams.sort((a, b) => {
    if (b.stats.points !== a.stats.points) {
      return b.stats.points - a.stats.points;
    }
    const aDiff = a.stats.goalsFor - a.stats.goalsAgainst;
    const bDiff = b.stats.goalsFor - b.stats.goalsAgainst;
    if (bDiff !== aDiff) return bDiff - aDiff;
    return b.stats.goalsFor - a.stats.goalsFor;
  });

  await updateChampionship(championshipId, { phases: championship.phases });
  return match;
}

export async function createPlayoffPhase(championshipId, { name, format }) {
  const championship = await getChampionshipById(championshipId);
  if (!championship) throw new Error('Campeonato no encontrado');
  if (!championship.phases.groups) throw new Error('Primero crea una fase de grupos');

  const playoffPhase = {
    id: Date.now().toString(),
    name,
    type: 'playoffs',
    format, // 'semi-finals' o 'finals'
    matches: [],
    status: 'Pendiente'
  };

  // Obtener mejores equipos de cada grupo
  const qualifiedTeams = championship.phases.groups.groups
    .map(group => group.teams[0]) // Campeón de cada grupo
    .slice(0, 4); // Top 4

  if (qualifiedTeams.length < 2) {
    throw new Error('No hay suficientes equipos calificados');
  }

  // Crear semifinales
  playoffPhase.matches = [
    {
      id: 'sf1',
      name: 'Semifinal 1',
      home: qualifiedTeams[0],
      away: qualifiedTeams[1],
      homeGoals: null,
      awayGoals: null,
      result: null,
      played: false
    },
    {
      id: 'sf2',
      name: 'Semifinal 2',
      home: qualifiedTeams[2],
      away: qualifiedTeams[3],
      homeGoals: null,
      awayGoals: null,
      result: null,
      played: false
    }
  ];

  championship.phases.playoffs = playoffPhase;
  await updateChampionship(championshipId, { phases: championship.phases });
  return playoffPhase;
}

export async function recordPlayoffMatch(championshipId, matchId, { homeGoals, awayGoals }) {
  const championship = await getChampionshipById(championshipId);
  if (!championship) throw new Error('Campeonato no encontrado');

  const match = championship.phases.playoffs?.matches?.find(m => m.id === matchId);
  if (!match) throw new Error('Partido no encontrado');

  match.homeGoals = parseInt(homeGoals);
  match.awayGoals = parseInt(awayGoals);
  match.played = true;

  if (match.homeGoals > match.awayGoals) {
    match.result = 'home';
  } else if (match.homeGoals < match.awayGoals) {
    match.result = 'away';
  } else {
    match.result = 'draw';
  }

  await updateChampionship(championshipId, { phases: championship.phases });
  return match;
}

export async function getGroupStandings(championshipId, groupId) {
  const championship = await getChampionshipById(championshipId);
  if (!championship) throw new Error('Campeonato no encontrado');

  const group = championship.phases.groups?.groups?.find(g => g.id === groupId);
  if (!group) throw new Error('Grupo no encontrado');

  return group.teams.sort((a, b) => {
    if (b.stats.points !== a.stats.points) {
      return b.stats.points - a.stats.points;
    }
    const aDiff = a.stats.goalsFor - a.stats.goalsAgainst;
    const bDiff = b.stats.goalsFor - b.stats.goalsAgainst;
    return bDiff - aDiff;
  });
}
