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
  return json ? JSON.parse(json) : [];
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
      grupos: [],
      eliminatorias: []
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
      golesEnContra: 0
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
