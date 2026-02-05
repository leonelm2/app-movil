import AsyncStorage from '@react-native-async-storage/async-storage';

const TORNEOS_KEY = 'TORNEOS';
const JUGADORES_KEY = 'JUGADORES';

export async function obtenerTorneos() {
  const json = await AsyncStorage.getItem(TORNEOS_KEY);
  let lista = json ? JSON.parse(json) : [];
  // inicializar con un torneo de ejemplo si no hay ninguno
  if (lista.length === 0) {
    const ejemplo = { id: 't1', nombre: 'Copa Estudiantil', equipos: 8, fecha: '2026-06-01', estado: 'En Preparación' };
    lista = [ejemplo];
    await AsyncStorage.setItem(TORNEOS_KEY, JSON.stringify(lista));
  }
  return lista;
}

export async function crearTorneo(t) {
  const lista = await obtenerTorneos();
  const nuevoT = { id: Date.now().toString(), ...t };
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


