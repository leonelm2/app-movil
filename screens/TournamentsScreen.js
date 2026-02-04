import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { getTournaments, createTournament } from '../services/tournaments';
import Button from '../components/Button';

export default function TournamentsScreen({ navigation }) {
  const [tournaments, setTournaments] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [teams, setTeams] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', load);
    load();
    return unsubscribe;
  }, [navigation]);

  async function load() {
    const list = await getTournaments();
    setTournaments(list);
  }

  async function handleCreate() {
    if (!name || !teams || !date) return Alert.alert('Error', 'Completa todos los campos');
    const t = { name, teams: parseInt(teams, 10), date, status: 'Pendiente' };
    await createTournament(t);
    setModalVisible(false);
    setName(''); setTeams(''); setDate('');
    load();
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={tournaments}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('DetalleTorneo', { id: item.id })}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>{item.teams} equipos • {item.date}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ color: '#fff', textAlign: 'center' }}>No hay torneos</Text>}
      />
      <View style={{ marginTop: 12 }}>
        <Button onPress={() => setModalVisible(true)}>Crear Torneo</Button>
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modal}>
            <Text style={{ color: '#fff', fontSize: 18, marginBottom: 8 }}>Nuevo Torneo</Text>
            <TextInput placeholder="Nombre" placeholderTextColor="#999" style={styles.input} value={name} onChangeText={setName} />
            <TextInput placeholder="Cantidad de equipos" placeholderTextColor="#999" style={styles.input} keyboardType="numeric" value={teams} onChangeText={setTeams} />
            <TextInput placeholder="Fecha" placeholderTextColor="#999" style={styles.input} value={date} onChangeText={setDate} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button small onPress={handleCreate}>Guardar</Button>
              <Button small onPress={() => setModalVisible(false)}>Cancelar</Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 16 },
  card: { backgroundColor: '#111', padding: 12, borderRadius: 8, marginBottom: 8 },
  name: { color: '#fff', fontWeight: '700' },
  meta: { color: '#ccc', marginTop: 6 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modal: { backgroundColor: '#111', padding: 16, borderRadius: 8 },
  input: { backgroundColor: '#000', color: '#fff', padding: 10, borderRadius: 8, marginBottom: 10 }
});
