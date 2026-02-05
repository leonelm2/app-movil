import AsyncStorage from '@react-native-async-storage/async-storage';

const TORNEOS_KEY = 'TORNEOS';
const JUGADORES_KEY = 'JUGADORES';

export async function obtenerTorneos() {
  const json = await AsyncStorage.getItem(TORNEOS_KEY);
  let lista = json ? JSON.parse(json) : [];
  const seed = buildSeedData();
  const hasT1 = lista.some(t => t.id === seed.torneoUno.id);
  const hasT2 = lista.some(t => t.id === seed.torneoDos.id);
  if (!hasT1 || !hasT2) {
    const next = [...lista];
    if (!hasT1) next.push(seed.torneoUno);
    if (!hasT2) next.push(seed.torneoDos);
    lista = next;
    await AsyncStorage.setItem(TORNEOS_KEY, JSON.stringify(lista));
  }

  const playersJson = await AsyncStorage.getItem(JUGADORES_KEY);
  if (!playersJson) {
    await AsyncStorage.setItem(JUGADORES_KEY, JSON.stringify(seed.jugadoresSeed));
  } else {
    const currentPlayers = JSON.parse(playersJson);
    const nextPlayers = { ...currentPlayers };
    nextPlayers.t1 = normalizarPlayers(currentPlayers.t1, seed.jugadoresSeed.t1);
    nextPlayers.t2 = normalizarPlayers(currentPlayers.t2, seed.jugadoresSeed.t2);
    await AsyncStorage.setItem(JUGADORES_KEY, JSON.stringify(nextPlayers));
  }
  return lista;
}

export async function crearTorneo(t) {
  const lista = await obtenerTorneos();
  const nuevoT = { id: Date.now().toString(), equiposDetalle: [], partidos: [], ...t };
  lista.push(nuevoT);
  await AsyncStorage.setItem(TORNEOS_KEY, JSON.stringify(lista));
  return nuevoT;
}

export async function actualizarTorneo(id, datos) {
  const lista = await obtenerTorneos();
  const idx = lista.findIndex(x => x.id === id);
  if (idx !== -1) {
    lista[idx] = { ...lista[idx], ...datos };
    await AsyncStorage.setItem(TORNEOS_KEY, JSON.stringify(lista));
    return lista[idx];
  }
  throw new Error('Torneo no encontrado');
}

export async function eliminarTorneo(id) {
  const lista = await obtenerTorneos();
  const filtrada = lista.filter(x => x.id !== id);
  await AsyncStorage.setItem(TORNEOS_KEY, JSON.stringify(filtrada));
}

export async function obtenerTorneoId(id) {
  const lista = await obtenerTorneos();
  return lista.find(x => x.id === id);
}

function generarFixture(equipos, resultadosIniciales = []) {
  const partidos = [];
  for (let i = 0; i < equipos.length; i++) {
    for (let j = i + 1; j < equipos.length; j++) {
      partidos.push({
        id: `m-${equipos[i].id}-${equipos[j].id}`,
        localId: equipos[i].id,
        visitanteId: equipos[j].id,
        golesLocal: null,
        golesVisitante: null,
        jugado: false
      });
    }
  }

  resultadosIniciales.forEach(resultado => {
    const match = partidos.find(p => p.localId === resultado.localId && p.visitanteId === resultado.visitanteId);
    if (match) {
      match.golesLocal = resultado.golesLocal;
      match.golesVisitante = resultado.golesVisitante;
      match.jugado = true;
    }
  });

  return partidos;
}

const plantillaBase = [
  { nombre: 'Lucas Fernandez', posicion: 'Portero' },
  { nombre: 'Sergio Molina', posicion: 'Portero' },
  { nombre: 'Nicolas Gomez', posicion: 'Defensa' },
  { nombre: 'Matias Vega', posicion: 'Defensa' },
  { nombre: 'Bruno Diaz', posicion: 'Defensa' },
  { nombre: 'Pablo Rojas', posicion: 'Defensa' },
  { nombre: 'Franco Silva', posicion: 'Mediocampista' },
  { nombre: 'Agustin Castro', posicion: 'Mediocampista' },
  { nombre: 'Diego Torres', posicion: 'Mediocampista' },
  { nombre: 'Julian Perez', posicion: 'Delantero' },
  { nombre: 'Emanuel Lopez', posicion: 'Delantero' }
];

function buildJugadoresEquipo(prefijoId, equipoNombre) {
  return plantillaBase.map((jugador, index) => ({
    id: `${prefijoId}-p${index + 1}`,
    nombre: jugador.nombre,
    edad: 19 + index,
    posicion: jugador.posicion,
    equipo: equipoNombre
  }));
}

function normalizarPlayers(actuales = [], base = []) {
  if (!Array.isArray(actuales) || actuales.length !== base.length) return base;
  return actuales;
}

function buildSeedData() {
  const torneoUnoEquipos = [
    { id: 't1-e1', nombre: 'Club San Juan Norte', localidad: 'Capital' },
    { id: 't1-e2', nombre: 'Club Rawson', localidad: 'Rawson' },
    { id: 't1-e3', nombre: 'Club Rivadavia', localidad: 'Rivadavia' },
    { id: 't1-e4', nombre: 'Club Chimbas', localidad: 'Chimbas' }
  ];

  const torneoDosEquipos = [
    { id: 't2-e1', nombre: 'Club Pocito', localidad: 'Pocito' },
    { id: 't2-e2', nombre: 'Club Caucete', localidad: 'Caucete' },
    { id: 't2-e3', nombre: 'Club Albardon', localidad: 'Albardon' },
    { id: 't2-e4', nombre: 'Club Zonda', localidad: 'Zonda' }
  ];

  const torneoUno = {
    id: 't1',
    nombre: 'Liga Sanjuanina Apertura',
    equipos: torneoUnoEquipos.length,
    fecha: '2026-03-15',
    disciplina: 'futbol',
    estado: 'En curso',
    equiposDetalle: torneoUnoEquipos,
    partidos: generarFixture(torneoUnoEquipos, [
      { localId: 't1-e1', visitanteId: 't1-e2', golesLocal: 2, golesVisitante: 1 },
      { localId: 't1-e3', visitanteId: 't1-e4', golesLocal: 0, golesVisitante: 0 },
      { localId: 't1-e2', visitanteId: 't1-e3', golesLocal: 1, golesVisitante: 3 }
    ])
  };

  const torneoDos = {
    id: 't2',
    nombre: 'Copa Valle de Tulum',
    equipos: torneoDosEquipos.length,
    fecha: '2026-04-01',
    disciplina: 'futbol',
    estado: 'En curso',
    equiposDetalle: torneoDosEquipos,
    partidos: generarFixture(torneoDosEquipos, [
      { localId: 't2-e1', visitanteId: 't2-e2', golesLocal: 1, golesVisitante: 1 },
      { localId: 't2-e3', visitanteId: 't2-e4', golesLocal: 2, golesVisitante: 0 }
    ])
  };

  const jugadoresSeed = {
    t1: [
      ...buildJugadoresEquipo('t1-e1', 'Club San Juan Norte'),
      ...buildJugadoresEquipo('t1-e2', 'Club Rawson'),
      ...buildJugadoresEquipo('t1-e3', 'Club Rivadavia'),
      ...buildJugadoresEquipo('t1-e4', 'Club Chimbas')
    ],
    t2: [
      ...buildJugadoresEquipo('t2-e1', 'Club Pocito'),
      ...buildJugadoresEquipo('t2-e2', 'Club Caucete'),
      ...buildJugadoresEquipo('t2-e3', 'Club Albardon'),
      ...buildJugadoresEquipo('t2-e4', 'Club Zonda')
    ]
  };

  return { torneoUno, torneoDos, jugadoresSeed };
}

export async function obtenerTablaTorneo(idTorneo) {
  const torneo = await obtenerTorneoId(idTorneo);
  if (!torneo) throw new Error('Torneo no encontrado');

  const equipos = torneo.equiposDetalle || [];
  const partidos = torneo.partidos || [];

  const tabla = equipos.map(team => ({
    id: team.id,
    nombre: team.nombre,
    localidad: team.localidad,
    jugados: 0,
    ganados: 0,
    empatados: 0,
    perdidos: 0,
    golesAFavor: 0,
    golesEnContra: 0,
    puntos: 0
  }));

  const statsById = new Map(tabla.map(t => [t.id, t]));

  partidos.filter(p => p.jugado).forEach(partido => {
    const local = statsById.get(partido.localId);
    const visitante = statsById.get(partido.visitanteId);
    if (!local || !visitante) return;

    local.jugados += 1;
    visitante.jugados += 1;
    local.golesAFavor += partido.golesLocal;
    local.golesEnContra += partido.golesVisitante;
    visitante.golesAFavor += partido.golesVisitante;
    visitante.golesEnContra += partido.golesLocal;

    if (partido.golesLocal > partido.golesVisitante) {
      local.ganados += 1;
      visitante.perdidos += 1;
      local.puntos += 3;
    } else if (partido.golesLocal < partido.golesVisitante) {
      visitante.ganados += 1;
      local.perdidos += 1;
      visitante.puntos += 3;
    } else {
      local.empatados += 1;
      visitante.empatados += 1;
      local.puntos += 1;
      visitante.puntos += 1;
    }
  });

  return tabla.sort((a, b) => {
    if (b.puntos !== a.puntos) return b.puntos - a.puntos;
    const aDiff = a.golesAFavor - a.golesEnContra;
    const bDiff = b.golesAFavor - b.golesEnContra;
    if (bDiff !== aDiff) return bDiff - aDiff;
    return b.golesAFavor - a.golesAFavor;
  });
}

export async function registrarResultado(idTorneo, partidoId, { golesLocal, golesVisitante }) {
  const lista = await obtenerTorneos();
  const idx = lista.findIndex(x => x.id === idTorneo);
  if (idx === -1) throw new Error('Torneo no encontrado');

  const torneo = lista[idx];
  const partidos = torneo.partidos || [];
  const match = partidos.find(p => p.id === partidoId);
  if (!match) throw new Error('Partido no encontrado');

  match.golesLocal = parseInt(golesLocal, 10);
  match.golesVisitante = parseInt(golesVisitante, 10);
  match.jugado = true;

  lista[idx] = { ...torneo, partidos };
  await AsyncStorage.setItem(TORNEOS_KEY, JSON.stringify(lista));
  return match;
}

export async function forzarDatosDemo() {
  const seed = buildSeedData();
  const lista = [seed.torneoUno, seed.torneoDos];
  await AsyncStorage.setItem(TORNEOS_KEY, JSON.stringify(lista));
  await AsyncStorage.setItem(JUGADORES_KEY, JSON.stringify(seed.jugadoresSeed));
  return lista;
}

export async function obtenerJugadores(idTorneo) {
  const json = await AsyncStorage.getItem(JUGADORES_KEY);
  const obj = json ? JSON.parse(json) : {};
  return obj[idTorneo] || [];
}

export async function agregarJugador(idTorneo, jugador) {
  const json = await AsyncStorage.getItem(JUGADORES_KEY);
  const obj = json ? JSON.parse(json) : {};
  if (!obj[idTorneo]) obj[idTorneo] = [];
  obj[idTorneo].push({ id: Date.now().toString(), ...jugador });
  await AsyncStorage.setItem(JUGADORES_KEY, JSON.stringify(obj));
  return obj[idTorneo];
}


