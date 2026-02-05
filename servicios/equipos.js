import AsyncStorage from '@react-native-async-storage/async-storage';

const EQUIPOS_KEY = 'EQUIPOS';

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

function buildPlantel(prefijoId) {
  return plantillaBase.map((jugador, index) => ({
    id: `${prefijoId}-${index + 1}`,
    nombre: jugador.nombre,
    edad: 19 + index,
    posicion: jugador.posicion,
    nacionalidad: 'Argentina'
  }));
}

function normalizarJugadores(actuales = [], base = []) {
  if (!Array.isArray(actuales) || actuales.length !== base.length) return base;
  return actuales;
}

const seedEquipos = [
  {
    id: 'eq-alianza',
    nombre: 'Alianza',
    jugadores: buildPlantel('eq-ali')
  },
  {
    id: 'eq-desamparados',
    nombre: 'Desamparados',
    jugadores: buildPlantel('eq-des')
  },
  {
    id: 'eq-san-martin',
    nombre: 'San Martin',
    jugadores: buildPlantel('eq-sm')
  },
  {
    id: 'eq-union',
    nombre: 'Union',
    jugadores: buildPlantel('eq-uni')
  },
  {
    id: 'eq-santo-domingo',
    nombre: 'Santo Domingo',
    jugadores: buildPlantel('eq-sd')
  }
];

export async function obtenerEquipos() {
  const json = await AsyncStorage.getItem(EQUIPOS_KEY);
  let lista = json ? JSON.parse(json) : [];
  if (lista.length === 0) {
    lista = seedEquipos;
    await AsyncStorage.setItem(EQUIPOS_KEY, JSON.stringify(lista));
    return lista;
  }

  let updated = false;
  const next = lista.map(team => {
    const seed = seedEquipos.find(s => s.id === team.id);
    if (!seed) return team;
    const actuales = Array.isArray(team.jugadores) ? team.jugadores : [];
    const normalized = normalizarJugadores(actuales, seed.jugadores);
    if (normalized !== actuales) {
      updated = true;
      return { ...team, jugadores: normalized };
    }
    return team;
  });

  if (updated) {
    await AsyncStorage.setItem(EQUIPOS_KEY, JSON.stringify(next));
    return next;
  }
  return lista;
}

export async function obtenerEquipoPorId(id) {
  const lista = await obtenerEquipos();
  return lista.find(e => e.id === id);
}

export async function crearEquipo(nombre) {
  const lista = await obtenerEquipos();
  const nombreLimpio = String(nombre || '').trim();
  if (!nombreLimpio) throw new Error('Nombre requerido');
  const id = `eq-${Date.now()}`;
  const nuevo = {
    id,
    nombre: nombreLimpio,
    jugadores: buildPlantel(id)
  };
  const next = [...lista, nuevo];
  await AsyncStorage.setItem(EQUIPOS_KEY, JSON.stringify(next));
  return nuevo;
}
