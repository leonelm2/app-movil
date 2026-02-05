import { apiRequest } from './api';
import { obtenerEquipos } from './equipos';

// ==================== DISCIPLINAS ====================
export async function obtenerDisciplinas() {
  return apiRequest('/disciplinas');
}

export async function crearDisciplina(nombre, icono = '⚽') {
  return apiRequest('/disciplinas', {
    method: 'POST',
    body: JSON.stringify({ nombre, icono })
  });
}

export async function eliminarDisciplina(id) {
  await apiRequest(`/disciplinas/${id}`, { method: 'DELETE' });
}

// ==================== CAMPEONATOS ====================
export async function obtenerCampeonatos() {
  return apiRequest('/campeonatos');
}

export async function crearCampeonato({ nombre, disciplinaId, fechaInicio, fechaFin, descripcion = '' }) {
  return apiRequest('/campeonatos', {
    method: 'POST',
    body: JSON.stringify({
      nombre,
      disciplinaId,
      fechaInicio,
      fechaFin,
      descripcion,
      estado: 'En preparación',
      equipos: [],
      fases: { grupos: null, eliminatorias: null },
      creadoEn: new Date().toISOString()
    })
  });
}

export async function actualizarCampeonato(id, datos) {
  return apiRequest(`/campeonatos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos)
  });
}

export async function eliminarCampeonato(id) {
  await apiRequest(`/campeonatos/${id}`, { method: 'DELETE' });
}

export async function obtenerCampeonatoId(id) {
  const encontrado = await apiRequest(`/campeonatos/${id}`);
  if (!encontrado) return undefined;
  return await sincronizarEquiposConClubes(encontrado);
}

// ==================== EQUIPOS EN CAMPEONATO ====================
export async function agregarEquipoACampeonato(idCampeonato, { nombre, color, entrenador }) {
  const campeonato = await obtenerCampeonatoId(idCampeonato);
  if (!campeonato) throw new Error('Campeonato no encontrado');
  
  const nuevoEquipo = {
    id: Date.now().toString(),
    nombre,
    color,
    entrenador,
    jugadores: [],
    estadisticas: {
      jugados: 0,
      ganados: 0,
      empatados: 0,
      perdidos: 0,
      golesAFavor: 0,
      golesEnContra: 0,
      puntos: 0
    }
  };
  
  campeonato.equipos.push(nuevoEquipo);
  await actualizarCampeonato(idCampeonato, { equipos: campeonato.equipos });
  return nuevoEquipo;
}

export async function eliminarEquipoDeCampeonato(idCampeonato, idEquipo) {
  const campeonato = await obtenerCampeonatoId(idCampeonato);
  if (!campeonato) throw new Error('Campeonato no encontrado');
  
  campeonato.equipos = campeonato.equipos.filter(t => t.id !== idEquipo);
  await actualizarCampeonato(idCampeonato, { equipos: campeonato.equipos });
}

export async function agregarJugadorAEquipo(idCampeonato, idEquipo, { nombre, numero, posicion }) {
  const campeonato = await obtenerCampeonatoId(idCampeonato);
  if (!campeonato) throw new Error('Campeonato no encontrado');
  
  const equipo = campeonato.equipos.find(t => t.id === idEquipo);
  if (!equipo) throw new Error('Equipo no encontrado');
  
  const nuevoJugador = {
    id: Date.now().toString(),
    nombre,
    numero: parseInt(numero),
    posicion,
    goles: 0,
    tarjetasAmarillas: 0,
    tarjetasRojas: 0
  };
  
  equipo.jugadores.push(nuevoJugador);
  await actualizarCampeonato(idCampeonato, { equipos: campeonato.equipos });
  return nuevoJugador;
}

export async function eliminarJugadorDeEquipo(idCampeonato, idEquipo, idJugador) {
  const campeonato = await obtenerCampeonatoId(idCampeonato);
  if (!campeonato) throw new Error('Campeonato no encontrado');
  
  const equipo = campeonato.equipos.find(t => t.id === idEquipo);
  if (!equipo) throw new Error('Equipo no encontrado');
  
  equipo.jugadores = equipo.jugadores.filter(p => p.id !== idJugador);
  await actualizarCampeonato(idCampeonato, { equipos: campeonato.equipos });
}

export async function obtenerEquiposDeCampeonato(idCampeonato) {
  const campeonato = await obtenerCampeonatoId(idCampeonato);
  return campeonato ? campeonato.equipos : [];
}

function normalizarNombre(nombre) {
  return String(nombre || '').trim().toLowerCase().replace(/^club\s+/, '');
}

function mapJugadoresEquipo(jugadoresBase = [], prefijoId) {
  return jugadoresBase.map((jugador, index) => ({
    id: jugador.id || `${prefijoId}-${index + 1}`,
    nombre: jugador.nombre,
    numero: index + 1,
    posicion: jugador.posicion,
    goles: 0,
    tarjetasAmarillas: 0,
    tarjetasRojas: 0
  }));
}

async function sincronizarEquiposConClubes(campeonato) {
  if (!campeonato || !Array.isArray(campeonato.equipos)) return campeonato;
  const clubes = await obtenerEquipos();
  let updated = false;
  const nextEquipos = campeonato.equipos.map(equipo => {
    const match = clubes.find(c => normalizarNombre(c.nombre) === normalizarNombre(equipo.nombre));
    if (!match) return equipo;
    const jugadoresBase = mapJugadoresEquipo(match.jugadores || [], equipo.id);
    const actuales = Array.isArray(equipo.jugadores) ? equipo.jugadores : [];
    const mismosNombres = actuales.length === jugadoresBase.length && actuales.every((j, i) => j.nombre === jugadoresBase[i].nombre);
    if (!mismosNombres) {
      updated = true;
      return { ...equipo, jugadores: jugadoresBase };
    }
    return equipo;
  });

  if (updated) {
    await actualizarCampeonato(campeonato.id, { equipos: nextEquipos });
    return { ...campeonato, equipos: nextEquipos };
  }
  return campeonato;
}

function buildDemoCampeonatos() {
  const equiposA = [
    { id: 'c1-e1', nombre: 'Club Alianza', color: '#ff2d2d', entrenador: 'DT: Carlos Vega', jugadores: [], estadisticas: baseStats() },
    { id: 'c1-e2', nombre: 'Club Desamparados', color: '#0066ff', entrenador: 'DT: Mateo Luna', jugadores: [], estadisticas: baseStats() },
    { id: 'c1-e3', nombre: 'Club San Martin', color: '#00aa00', entrenador: 'DT: Diego Rojas', jugadores: [], estadisticas: baseStats() },
    { id: 'c1-e4', nombre: 'Club Union', color: '#ffaa00', entrenador: 'DT: Leo Silva', jugadores: [], estadisticas: baseStats() }
  ];

  const equiposB = [
    { id: 'c2-e1', nombre: 'Club Santo Domingo', color: '#ff2d2d', entrenador: 'DT: Andres Soto', jugadores: [], estadisticas: baseStats() },
    { id: 'c2-e2', nombre: 'Club Rivadavia', color: '#0066ff', entrenador: 'DT: Franco Diaz', jugadores: [], estadisticas: baseStats() },
    { id: 'c2-e3', nombre: 'Club Rawson', color: '#00aa00', entrenador: 'DT: Julian Perez', jugadores: [], estadisticas: baseStats() },
    { id: 'c2-e4', nombre: 'Club Chimbas', color: '#ffaa00', entrenador: 'DT: Nicolas Gomez', jugadores: [], estadisticas: baseStats() }
  ];

  const gruposA = buildGroupPhase('Fase de Grupos', equiposA, 2, [
    { localId: 'c1-e1', visitanteId: 'c1-e2', golesLocal: 2, golesVisitante: 1 },
    { localId: 'c1-e3', visitanteId: 'c1-e4', golesLocal: 1, golesVisitante: 1 }
  ]);

  const gruposB = buildGroupPhase('Fase de Grupos', equiposB, 2, [
    { localId: 'c2-e1', visitanteId: 'c2-e2', golesLocal: 0, golesVisitante: 2 },
    { localId: 'c2-e3', visitanteId: 'c2-e4', golesLocal: 3, golesVisitante: 2 }
  ]);

  const eliminatoriasA = buildEliminatorias('Eliminatorias', gruposA.grupos, [
    { matchId: 'elim-1', golesLocal: 2, golesVisitante: 0 },
    { matchId: 'elim-2', golesLocal: 1, golesVisitante: 1 }
  ]);

  return [
    {
      id: 'c1',
      nombre: 'Campeonato San Juan Apertura',
      disciplinaId: 'd1',
      fechaInicio: '2026-03-01',
      fechaFin: '2026-06-15',
      descripcion: 'Campeonato con equipos de la provincia de San Juan.',
      estado: 'En curso',
      equipos: equiposA,
      fases: { grupos: gruposA, eliminatorias: eliminatoriasA },
      creadoEn: new Date().toISOString()
    },
    {
      id: 'c2',
      nombre: 'Copa San Juan Clausura',
      disciplinaId: 'd1',
      fechaInicio: '2026-08-01',
      fechaFin: '2026-11-20',
      descripcion: 'Segunda parte del calendario provincial.',
      estado: 'En preparación',
      equipos: equiposB,
      fases: { grupos: gruposB, eliminatorias: null },
      creadoEn: new Date().toISOString()
    }
  ];
}

function baseStats() {
  return {
    jugados: 0,
    ganados: 0,
    empatados: 0,
    perdidos: 0,
    golesAFavor: 0,
    golesEnContra: 0,
    puntos: 0
  };
}

function buildGroupPhase(nombre, equipos, cantidadGrupos, resultados) {
  const grupos = [];
  const equiposPorGrupo = Math.ceil(equipos.length / cantidadGrupos);
  let indice = 0;

  for (let i = 0; i < cantidadGrupos; i += 1) {
    const slice = equipos.slice(indice, indice + equiposPorGrupo).map(t => ({
      ...t,
      estadisticas: { ...baseStats() }
    }));
    if (slice.length === 0) continue;
    const grupo = {
      id: `grupo-${i + 1}`,
      nombre: `Grupo ${String.fromCharCode(65 + i)}`,
      equipos: slice,
      partidos: generarFixture(slice)
    };
    grupos.push(grupo);
    indice += equiposPorGrupo;
  }

  resultados.forEach(resultado => {
    const grupo = grupos.find(g => g.partidos.some(p => p.local.id === resultado.localId && p.visitante.id === resultado.visitanteId));
    if (!grupo) return;
    const partido = grupo.partidos.find(p => p.local.id === resultado.localId && p.visitante.id === resultado.visitanteId);
    if (!partido) return;
    partido.golesLocal = resultado.golesLocal;
    partido.golesVisitante = resultado.golesVisitante;
    partido.jugado = true;
    partido.resultado = resultado.golesLocal > resultado.golesVisitante ? 'local' : resultado.golesLocal < resultado.golesVisitante ? 'visitante' : 'empate';
    actualizarEstadisticas(grupo, partido);
  });

  grupos.forEach(grupo => ordenarTabla(grupo));

  return {
    id: `fase-${Date.now().toString()}`,
    nombre,
    tipo: 'grupos',
    cantidadGrupos,
    grupos,
    jornadaActual: 1,
    estado: 'En curso'
  };
}

function generarFixture(equipos) {
  const partidos = [];
  for (let i = 0; i < equipos.length; i += 1) {
    for (let j = i + 1; j < equipos.length; j += 1) {
      partidos.push({
        id: `partido-${equipos[i].id}-${equipos[j].id}`,
        local: equipos[i],
        visitante: equipos[j],
        golesLocal: null,
        golesVisitante: null,
        resultado: null,
        jugado: false
      });
    }
  }
  return partidos;
}

function actualizarEstadisticas(grupo, partido) {
  const local = grupo.equipos.find(t => t.id === partido.local.id);
  const visitante = grupo.equipos.find(t => t.id === partido.visitante.id);
  if (!local || !visitante) return;

  local.estadisticas.jugados += 1;
  visitante.estadisticas.jugados += 1;
  local.estadisticas.golesAFavor += partido.golesLocal;
  local.estadisticas.golesEnContra += partido.golesVisitante;
  visitante.estadisticas.golesAFavor += partido.golesVisitante;
  visitante.estadisticas.golesEnContra += partido.golesLocal;

  if (partido.resultado === 'local') {
    local.estadisticas.ganados += 1;
    visitante.estadisticas.perdidos += 1;
    local.estadisticas.puntos += 3;
  } else if (partido.resultado === 'visitante') {
    visitante.estadisticas.ganados += 1;
    local.estadisticas.perdidos += 1;
    visitante.estadisticas.puntos += 3;
  } else {
    local.estadisticas.empatados += 1;
    visitante.estadisticas.empatados += 1;
    local.estadisticas.puntos += 1;
    visitante.estadisticas.puntos += 1;
  }
}

function ordenarTabla(grupo) {
  grupo.equipos.sort((a, b) => {
    if (b.estadisticas.puntos !== a.estadisticas.puntos) {
      return b.estadisticas.puntos - a.estadisticas.puntos;
    }
    const diffA = a.estadisticas.golesAFavor - a.estadisticas.golesEnContra;
    const diffB = b.estadisticas.golesAFavor - b.estadisticas.golesEnContra;
    if (diffB !== diffA) return diffB - diffA;
    return b.estadisticas.golesAFavor - a.estadisticas.golesAFavor;
  });
}

function buildEliminatorias(nombre, grupos, resultados) {
  const clasificados = [];
  grupos.forEach(grupo => {
    ordenarTabla(grupo);
    if (grupo.equipos[0]) clasificados.push(grupo.equipos[0]);
    if (grupo.equipos[1]) clasificados.push(grupo.equipos[1]);
  });

  if (clasificados.length < 2) return null;

  const partidos = [];
  if (clasificados.length >= 4) {
    partidos.push({
      id: 'elim-1',
      nombre: 'Semifinal 1',
      local: clasificados[0],
      visitante: clasificados[3],
      golesLocal: null,
      golesVisitante: null,
      jugado: false,
      resultado: null
    });
    partidos.push({
      id: 'elim-2',
      nombre: 'Semifinal 2',
      local: clasificados[1],
      visitante: clasificados[2],
      golesLocal: null,
      golesVisitante: null,
      jugado: false,
      resultado: null
    });
  } else {
    partidos.push({
      id: 'elim-1',
      nombre: 'Final',
      local: clasificados[0],
      visitante: clasificados[1],
      golesLocal: null,
      golesVisitante: null,
      jugado: false,
      resultado: null
    });
  }

  resultados.forEach(res => {
    const match = partidos.find(p => p.id === res.matchId);
    if (!match) return;
    match.golesLocal = res.golesLocal;
    match.golesVisitante = res.golesVisitante;
    match.jugado = true;
    match.resultado = res.golesLocal > res.golesVisitante ? 'local' : res.golesLocal < res.golesVisitante ? 'visitante' : 'empate';
  });

  return {
    id: `elim-${Date.now().toString()}`,
    nombre,
    formato: clasificados.length >= 4 ? 'semifinales' : 'final',
    partidos
  };
}
