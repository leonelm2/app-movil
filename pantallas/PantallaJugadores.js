import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Alert } from 'react-native';
import { obtenerJugadores, agregarJugador } from '../servicios/torneos';
import Boton from '../componentes/Boton';

export default function PlayersScreen({ route }) {
  const { id } = route.params;
  const [players, setPlayers] = useState([]);
  const [nombre, setNombre] = useState('');
  const [edad, setEdad] = useState('');
  const [posicion, setPosicion] = useState('');
  const [equipo, setEquipo] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    const p = await obtenerJugadores(id);
    setPlayers(p);
  }

  async function handleAdd() {
    if (!nombre || !edad || !posicion || !equipo) return Alert.alert('Error', 'Completa todos los campos');
    await agregarJugador(id, { nombre, edad: parseInt(edad, 10), posicion, equipo });
    setNombre(''); setEdad(''); setPosicion(''); setEquipo('');
    load();
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={players}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>{item.nombre}</Text>
            <Text style={{ color: '#ccc' }}>{item.edad} • {item.posicion} • {item.equipo}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: '#fff', textAlign: 'center' }}>No hay jugadores</Text>}
      />

      <Text style={{ color: '#fff', marginTop: 12, fontWeight: '700' }}>Agregar jugador</Text>
      <TextInput placeholder="Nombre" placeholderTextColor="#999" style={styles.input} value={nombre} onChangeText={setNombre} />
      <TextInput placeholder="Edad" placeholderTextColor="#999" style={styles.input} keyboardType="numeric" value={edad} onChangeText={setEdad} />
      <TextInput placeholder="Posición" placeholderTextColor="#999" style={styles.input} value={posicion} onChangeText={setPosicion} />
      <TextInput placeholder="Equipo" placeholderTextColor="#999" style={styles.input} value={equipo} onChangeText={setEquipo} />
      <Boton onPress={handleAdd}>Agregar</Boton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 16 },
  row: { backgroundColor: '#111', padding: 10, borderRadius: 8, marginBottom: 8 },
  input: { backgroundColor: '#111', color: '#fff', padding: 10, borderRadius: 8, marginTop: 8 }
});
