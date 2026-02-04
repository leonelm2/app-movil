import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Alert } from 'react-native';
import { getPlayers, addPlayer } from '../services/tournaments';
import Button from '../components/Button';

export default function PlayersScreen({ route }) {
  const { id } = route.params;
  const [players, setPlayers] = useState([]);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [position, setPosition] = useState('');
  const [team, setTeam] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    const p = await getPlayers(id);
    setPlayers(p);
  }

  async function handleAdd() {
    if (!name || !age || !position || !team) return Alert.alert('Error', 'Completa todos los campos');
    await addPlayer(id, { name, age: parseInt(age, 10), position, team });
    setName(''); setAge(''); setPosition(''); setTeam('');
    load();
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={players}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>{item.name}</Text>
            <Text style={{ color: '#ccc' }}>{item.age} • {item.position} • {item.team}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: '#fff', textAlign: 'center' }}>No hay jugadores</Text>}
      />

      <Text style={{ color: '#fff', marginTop: 12, fontWeight: '700' }}>Agregar jugador</Text>
      <TextInput placeholder="Nombre" placeholderTextColor="#999" style={styles.input} value={name} onChangeText={setName} />
      <TextInput placeholder="Edad" placeholderTextColor="#999" style={styles.input} keyboardType="numeric" value={age} onChangeText={setAge} />
      <TextInput placeholder="Posición" placeholderTextColor="#999" style={styles.input} value={position} onChangeText={setPosition} />
      <TextInput placeholder="Equipo" placeholderTextColor="#999" style={styles.input} value={team} onChangeText={setTeam} />
      <Button onPress={handleAdd}>Agregar</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 16 },
  row: { backgroundColor: '#111', padding: 10, borderRadius: 8, marginBottom: 8 },
  input: { backgroundColor: '#111', color: '#fff', padding: 10, borderRadius: 8, marginTop: 8 }
});
