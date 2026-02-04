import AsyncStorage from '@react-native-async-storage/async-storage';

const TOURNAMENTS_KEY = 'TOURNAMENTS';
const PLAYERS_KEY = 'PLAYERS';

export async function getTournaments() {
  const json = await AsyncStorage.getItem(TOURNAMENTS_KEY);
  let list = json ? JSON.parse(json) : [];
  // inicializar con un torneo de ejemplo si no hay ninguno
  if (list.length === 0) {
    const example = { id: 't1', name: 'Copa Estudiantil', teams: 8, date: '2026-06-01', status: 'En Preparación' };
    list = [example];
    await AsyncStorage.setItem(TOURNAMENTS_KEY, JSON.stringify(list));
  }
  return list;
}

export async function createTournament(t) {
  const list = await getTournaments();
  const newT = { id: Date.now().toString(), ...t };
  list.push(newT);
  await AsyncStorage.setItem(TOURNAMENTS_KEY, JSON.stringify(list));
  return newT;
}

export async function getTournamentById(id) {
  const list = await getTournaments();
  return list.find(x => x.id === id);
}

export async function getPlayers(tournamentId) {
  const json = await AsyncStorage.getItem(PLAYERS_KEY);
  const obj = json ? JSON.parse(json) : {};
  return obj[tournamentId] || [];
}

export async function addPlayer(tournamentId, player) {
  const json = await AsyncStorage.getItem(PLAYERS_KEY);
  const obj = json ? JSON.parse(json) : {};
  if (!obj[tournamentId]) obj[tournamentId] = [];
  obj[tournamentId].push({ id: Date.now().toString(), ...player });
  await AsyncStorage.setItem(PLAYERS_KEY, JSON.stringify(obj));
  return obj[tournamentId];
}
