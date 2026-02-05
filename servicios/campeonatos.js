import AsyncStorage from '@react-native-async-storage/async-storage';

const CHAMPIONSHIPS_KEY = 'CAMPEONATOS';
const DISCIPLINES_KEY = 'DISCIPLINAS';

// ==================== DISCIPLINAS ====================
export async function obtenerDisciplinas() {
  const json = await AsyncStorage.getItem(DISCIPLINES_KEY);
  let lista = json ? JSON.parse(json) : [];
  
  // Inicializar con disciplinas de ejemplo si no hay ninguna
  if (lista.length === 0) {
    const ejemplos = [
      { id: 'd1', nombre: 'Fútbol', icono: '⚽' },
      { id: 'd2', nombre: 'Voleibol', icono: '🏐' },
      { id: 'd3', nombre: 'Básquetbol', icono: '🏀' }
    ];
    await AsyncStorage.setItem(DISCIPLINES_KEY, JSON.stringify(ejemplos));
    lista = ejemplos;
  }
  return lista;
}

export async function crearDisciplina(nombre, icono = '⚽') {
  const lista = await obtenerDisciplinas();
  const nuevaD = { id: Date.now().toString(), nombre, icono };
  lista.push(nuevaD);
  await AsyncStorage.setItem(DISCIPLINES_KEY, JSON.stringify(lista));
  return nuevaD;
}

export async function eliminarDisciplina(id) {
  const lista = await obtenerDisciplinas();
  const filtrada = lista.filter(x => x.id !== id);
  await AsyncStorage.setItem(DISCIPLINES_KEY, JSON.stringify(filtrada));
}

// ==================== CAMPEONATOS ====================
export async function obtenerCampeonatos() {
  const json = await AsyncStorage.getItem(CHAMPIONSHIPS_KEY);
  let lista = json ? JSON.parse(json) : [];
  if (lista.length === 0) {
    lista = buildDemoCampeonatos();
    await AsyncStorage.setItem(CHAMPIONSHIPS_KEY, JSON.stringify(lista));
  }
  return lista;
}

export async function crearCampeonato({ nombre, disciplinaId, fechaInicio, fechaFin, descripcion = '' }) {
  const lista = await obtenerCampeonatos();
  const nuevoC = {
    id: Date.now().toString(),
    nombre,
    disciplinaId,
    fechaInicio,
    fechaFin,
    descripcion,
    estado: 'En preparación', // En preparación, En curso, Finalizado
    equipos: [],
    fases: {
      grupos: null,
      eliminatorias: null
    },
    creadoEn: new Date().toISOString()
  };
  lista.push(nuevoC);
  await AsyncStorage.setItem(CHAMPIONSHIPS_KEY, JSON.stringify(lista));
  return nuevoC;
}

export async function actualizarCampeonato(id, datos) {
  const lista = await obtenerCampeonatos();
  const idx = lista.findIndex(x => x.id === id);
  if (idx !== -1) {
    lista[idx] = { ...lista[idx], ...datos };
    await AsyncStorage.setItem(CHAMPIONSHIPS_KEY, JSON.stringify(lista));
    return lista[idx];
  }
  throw new Error('Campeonato no encontrado');
}

export async function eliminarCampeonato(id) {
  const lista = await obtenerCampeonatos();
  const filtrada = lista.filter(x => x.id !== id);
  await AsyncStorage.setItem(CHAMPIONSHIPS_KEY, JSON.stringify(filtrada));
}

export async function obtenerCampeonatoId(id) {
  const lista = await obtenerCampeonatos();
  return lista.find(x => x.id === id);
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

function buildDemoCampeonatos() {
  const equiposA = [
    { id: 'c1-e1', nombre: 'Club Alianza', color: '#ff2d2d', entrenador: 'Carlos Vega', jugadores: [], estadisticas: baseStats() },
    { id: 'c1-e2', nombre: 'Club Desamparados', color: '#0066ff', entrenador: 'Mateo Luna', jugadores: [], estadisticas: baseStats() },
    { id: 'c1-e3', nombre: 'Club San Martin', color: '#00aa00', entrenador: 'Diego Rojas', jugadores: [], estadisticas: baseStats() },
    { id: 'c1-e4', nombre: 'Club Union', color: '#ffaa00', entrenador: 'Leo Silva', jugadores: [], estadisticas: baseStats() }
  ];

  const equiposB = [
    { id: 'c2-e1', nombre: 'Club Santo Domingo', color: '#ff2d2d', entrenador: 'Andres Soto', jugadores: [], estadisticas: baseStats() },
    { id: 'c2-e2', nombre: 'Club Rivadavia', color: '#0066ff', entrenador: 'Franco Diaz', jugadores: [], estadisticas: baseStats() },
    { id: 'c2-e3', nombre: 'Club Rawson', color: '#00aa00', entrenador: 'Julian Perez', jugadores: [], estadisticas: baseStats() },
    { id: 'c2-e4', nombre: 'Club Chimbas', color: '#ffaa00', entrenador: 'Nicolas Gomez', jugadores: [], estadisticas: baseStats() }
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
