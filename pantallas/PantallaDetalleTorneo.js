import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity } from 'react-native';
import { obtenerTorneoId, obtenerJugadores } from '../servicios/torneos';

export default function TournamentDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [tournament, setTournament] = useState(null);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    (async () => {
      const t = await getTournamentById(id);
      setTournament(t);
      const p = await obtenerJugadores(id);
      setPlayers(p);
    })();
  }, [id]);

  if (!tournament) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{tournament.name}</Text>
      <Text style={styles.meta}>{tournament.teams} equipos • {tournament.date}</Text>
      <Text style={{ color: '#fff', marginTop: 12 }}>{tournament.status}</Text>

      <View style={{ marginTop: 20 }}>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Jugadores', { id })}>
          <Text style={{ color: '#fff' }}>Ver jugadores ({players.length})</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 16 },
  title: { color: '#fff', fontSize: 24, fontWeight: '800' },
  meta: { color: '#ccc', marginTop: 6 },
  btn: { marginTop: 12, backgroundColor: '#ff2d2d', padding: 12, borderRadius: 8, alignItems: 'center' }
});
