import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { obtenerJugadores, agregarJugador } from '../servicios/torneos';
import Boton from '../componentes/Boton';

export default function PlayersScreen({ route }) {
  const { id } = route.params;
  const [players, setPlayers] = useState([]);
  const [nombre, setNombre] = useState('');
  const [edad, setEdad] = useState('');
  const [posicion, setPosicion] = useState('');
  const [equipo, setEquipo] = useState('');
  const [nacionalidad, setNacionalidad] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    const p = await obtenerJugadores(id);
    setPlayers(p);
  }

  async function handleAdd() {
    if (!nombre || !edad || !posicion || !equipo || !nacionalidad) return Alert.alert('Error', 'Completa todos los campos');
    await agregarJugador(id, {
      nombre,
      edad: parseInt(edad, 10),
      posicion,
      equipo,
      nacionalidad
    });
    setNombre(''); setEdad(''); setPosicion(''); setEquipo(''); setNacionalidad('');
    load();
  }

  const edades = ['15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'];
  const clubes = ['Alianza', 'Desamparados', 'San Martin', 'Union', 'Santo Domingo'];
  const posiciones = ['Portero', 'Defensa', 'Mediocampista', 'Delantero'];
  const nacionalidades = ['Argentina', 'Chile', 'Uruguay', 'Brasil', 'Paraguay', 'Bolivia'];

  return (
    <View style={styles.container}>
      <FlatList
        data={players}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>{item.nombre}</Text>
            <Text style={{ color: '#ccc' }}>{item.edad} • {item.posicion} • {item.equipo} • {item.nacionalidad}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: '#fff', textAlign: 'center' }}>No hay jugadores</Text>}
      />

      <Text style={styles.formTitle}>Agregar jugador</Text>
      <TextInput placeholder="Nombre" placeholderTextColor="#999" style={styles.input} value={nombre} onChangeText={setNombre} />

      <Text style={styles.fieldLabel}>Edad</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionRow}>
        {edades.map(op => (
          <TouchableOpacity key={op} style={[styles.option, edad === op && styles.optionActive]} onPress={() => setEdad(op)}>
            <Text style={[styles.optionText, edad === op && styles.optionTextActive]}>{op}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.fieldLabel}>Club</Text>
      <View style={styles.optionGrid}>
        {clubes.map(op => (
          <TouchableOpacity key={op} style={[styles.option, equipo === op && styles.optionActive]} onPress={() => setEquipo(op)}>
            <Text style={[styles.optionText, equipo === op && styles.optionTextActive]}>{op}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.fieldLabel}>Posicion</Text>
      <View style={styles.optionGrid}>
        {posiciones.map(op => (
          <TouchableOpacity key={op} style={[styles.option, posicion === op && styles.optionActive]} onPress={() => setPosicion(op)}>
            <Text style={[styles.optionText, posicion === op && styles.optionTextActive]}>{op}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.fieldLabel}>Nacionalidad</Text>
      <View style={styles.optionGrid}>
        {nacionalidades.map(op => (
          <TouchableOpacity key={op} style={[styles.option, nacionalidad === op && styles.optionActive]} onPress={() => setNacionalidad(op)}>
            <Text style={[styles.optionText, nacionalidad === op && styles.optionTextActive]}>{op}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Boton onPress={handleAdd}>Agregar</Boton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 16 },
  row: { backgroundColor: '#111', padding: 10, borderRadius: 8, marginBottom: 8 },
  input: { backgroundColor: '#111', color: '#fff', padding: 10, borderRadius: 8, marginTop: 8 },
  formTitle: { color: '#fff', marginTop: 12, fontWeight: '700' },
  fieldLabel: { color: '#ff2d2d', marginTop: 12, marginBottom: 6, fontWeight: '600' },
  optionRow: { marginBottom: 4 },
  optionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { backgroundColor: '#111', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: '#333' },
  optionActive: { borderColor: '#ff2d2d', backgroundColor: 'rgba(255,45,45,0.1)' },
  optionText: { color: '#aaa', fontSize: 12, fontWeight: '600' },
  optionTextActive: { color: '#ff2d2d' }
});
