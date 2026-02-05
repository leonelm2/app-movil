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
    if (!nextPlayers.t1) nextPlayers.t1 = seed.jugadoresSeed.t1;
    if (!nextPlayers.t2) nextPlayers.t2 = seed.jugadoresSeed.t2;
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
    estado: 'En curso',
    equiposDetalle: torneoDosEquipos,
    partidos: generarFixture(torneoDosEquipos, [
      { localId: 't2-e1', visitanteId: 't2-e2', golesLocal: 1, golesVisitante: 1 },
      { localId: 't2-e3', visitanteId: 't2-e4', golesLocal: 2, golesVisitante: 0 }
    ])
  };

  const jugadoresSeed = {
    t1: [
      { id: 't1-p1', nombre: 'Matias Molina', edad: 21, posicion: 'Delantero', equipo: 'Club San Juan Norte' },
      { id: 't1-p2', nombre: 'Julian Perez', edad: 24, posicion: 'Mediocampista', equipo: 'Club San Juan Norte' },
      { id: 't1-p3', nombre: 'Tomas Ramos', edad: 23, posicion: 'Defensa', equipo: 'Club Rawson' },
      { id: 't1-p4', nombre: 'Lucas Herrera', edad: 22, posicion: 'Portero', equipo: 'Club Rawson' },
      { id: 't1-p5', nombre: 'Santiago Diaz', edad: 25, posicion: 'Delantero', equipo: 'Club Rivadavia' },
      { id: 't1-p6', nombre: 'Franco Vega', edad: 20, posicion: 'Mediocampista', equipo: 'Club Rivadavia' },
      { id: 't1-p7', nombre: 'Nicolas Ruiz', edad: 24, posicion: 'Defensa', equipo: 'Club Chimbas' },
      { id: 't1-p8', nombre: 'Gonzalo Castro', edad: 21, posicion: 'Portero', equipo: 'Club Chimbas' }
    ],
    t2: [
      { id: 't2-p1', nombre: 'Agustin Lopez', edad: 22, posicion: 'Delantero', equipo: 'Club Pocito' },
      { id: 't2-p2', nombre: 'Brian Ortiz', edad: 23, posicion: 'Mediocampista', equipo: 'Club Pocito' },
      { id: 't2-p3', nombre: 'Facundo Morales', edad: 24, posicion: 'Defensa', equipo: 'Club Caucete' },
      { id: 't2-p4', nombre: 'Ivan Quiroga', edad: 21, posicion: 'Portero', equipo: 'Club Caucete' },
      { id: 't2-p5', nombre: 'Emanuel Fernandez', edad: 25, posicion: 'Delantero', equipo: 'Club Albardon' },
      { id: 't2-p6', nombre: 'Pablo Sanchez', edad: 20, posicion: 'Mediocampista', equipo: 'Club Albardon' },
      { id: 't2-p7', nombre: 'Diego Navarro', edad: 23, posicion: 'Defensa', equipo: 'Club Zonda' },
      { id: 't2-p8', nombre: 'Marcos Chavez', edad: 22, posicion: 'Portero', equipo: 'Club Zonda' }
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


