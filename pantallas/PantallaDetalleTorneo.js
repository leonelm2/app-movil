import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView } from 'react-native';
import { obtenerTorneoId, obtenerJugadores, obtenerTablaTorneo, registrarResultado } from '../servicios/torneos';

export default function TournamentDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [tournament, setTournament] = useState(null);
  const [players, setPlayers] = useState([]);
  const [tabla, setTabla] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [golesLocal, setGolesLocal] = useState('');
  const [golesVisitante, setGolesVisitante] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    const t = await obtenerTorneoId(id);
    setTournament(t);
    const p = await obtenerJugadores(id);
    setPlayers(p);
    const tablaData = await obtenerTablaTorneo(id);
    setTabla(tablaData);
  }

  function getTeamName(teamId) {
    return tournament?.equiposDetalle?.find(t => t.id === teamId)?.nombre || 'Equipo';
  }

  function openResultModal(match) {
    setSelectedMatch(match);
    setGolesLocal(match.golesLocal !== null && match.golesLocal !== undefined ? String(match.golesLocal) : '');
    setGolesVisitante(match.golesVisitante !== null && match.golesVisitante !== undefined ? String(match.golesVisitante) : '');
    setModalVisible(true);
  }

  async function handleSaveResult() {
    if (!selectedMatch) return;
    if (golesLocal === '' || golesVisitante === '') return;
    await registrarResultado(id, selectedMatch.id, { golesLocal, golesVisitante });
    setModalVisible(false);
    setSelectedMatch(null);
    setGolesLocal('');
    setGolesVisitante('');
    loadData();
  }

  if (!tournament) return null;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{tournament.nombre}</Text>
        <Text style={styles.meta}>{tournament.equipos} equipos • {tournament.fecha}</Text>
        <Text style={styles.status}>{tournament.estado}</Text>

        <View style={{ marginTop: 16 }}>
          <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Jugadores', { id })}>
            <Text style={styles.btnText}>Ver jugadores ({players.length})</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Equipos</Text>
          {tournament.equiposDetalle?.map(team => (
            <View key={team.id} style={styles.teamRow}>
              <Text style={styles.teamName}>{team.nombre}</Text>
              <Text style={styles.teamCity}>{team.localidad}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Partidos y resultados</Text>
          {tournament.partidos?.map(match => (
            <View key={match.id} style={styles.matchRow}>
              <View style={styles.matchInfo}>
                <Text style={styles.matchTeams}>
                  {getTeamName(match.localId)} vs {getTeamName(match.visitanteId)}
                </Text>
                <Text style={styles.matchScore}>
                  {match.jugado ? `${match.golesLocal} - ${match.golesVisitante}` : 'Sin resultado'}
                </Text>
              </View>
              <TouchableOpacity style={styles.matchBtn} onPress={() => openResultModal(match)}>
                <Text style={styles.matchBtnText}>{match.jugado ? 'Editar' : 'Cargar'}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tabla de posiciones</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, styles.tableTeam]}>Equipo</Text>
            <Text style={styles.tableCell}>PJ</Text>
            <Text style={styles.tableCell}>G</Text>
            <Text style={styles.tableCell}>E</Text>
            <Text style={styles.tableCell}>P</Text>
            <Text style={styles.tableCell}>GF</Text>
            <Text style={styles.tableCell}>GC</Text>
            <Text style={styles.tableCell}>Pts</Text>
          </View>
          {tabla.map(team => (
            <View key={team.id} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tableTeam]}>{team.nombre}</Text>
              <Text style={styles.tableCell}>{team.jugados}</Text>
              <Text style={styles.tableCell}>{team.ganados}</Text>
              <Text style={styles.tableCell}>{team.empatados}</Text>
              <Text style={styles.tableCell}>{team.perdidos}</Text>
              <Text style={styles.tableCell}>{team.golesAFavor}</Text>
              <Text style={styles.tableCell}>{team.golesEnContra}</Text>
              <Text style={styles.tableCell}>{team.puntos}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Cargar resultado</Text>
            <Text style={styles.modalSubtitle}>
              {selectedMatch ? `${getTeamName(selectedMatch.localId)} vs ${getTeamName(selectedMatch.visitanteId)}` : ''}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Goles local"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={golesLocal}
              onChangeText={setGolesLocal}
            />
            <TextInput
              style={styles.input}
              placeholder="Goles visitante"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={golesVisitante}
              onChangeText={setGolesVisitante}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btn} onPress={handleSaveResult}>
                <Text style={styles.btnText}>Guardar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={() => setModalVisible(false)}>
                <Text style={styles.btnText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 16 },
  title: { color: '#fff', fontSize: 24, fontWeight: '800' },
  meta: { color: '#ccc', marginTop: 6 },
  status: { color: '#fff', marginTop: 12 },
  btn: { backgroundColor: '#ff2d2d', padding: 12, borderRadius: 8, alignItems: 'center' },
  btnSecondary: { backgroundColor: '#333' },
  btnText: { color: '#fff', fontWeight: '700' },
  section: { marginTop: 22 },
  sectionTitle: { color: '#ff2d2d', fontSize: 16, fontWeight: '700', marginBottom: 12 },
  teamRow: { backgroundColor: '#111', padding: 12, borderRadius: 8, marginBottom: 8 },
  teamName: { color: '#fff', fontWeight: '700' },
  teamCity: { color: '#aaa', marginTop: 4 },
  matchRow: { backgroundColor: '#111', padding: 12, borderRadius: 8, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  matchInfo: { flex: 1 },
  matchTeams: { color: '#fff', fontWeight: '700' },
  matchScore: { color: '#aaa', marginTop: 4 },
  matchBtn: { backgroundColor: '#222', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6 },
  matchBtnText: { color: '#fff', fontWeight: '600' },
  tableHeader: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#222' },
  tableRow: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#111' },
  tableCell: { color: '#ccc', fontSize: 11, width: 28, textAlign: 'center' },
  tableTeam: { flex: 1, width: 'auto', textAlign: 'left' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', padding: 16 },
  modal: { backgroundColor: '#111', borderRadius: 8, padding: 20 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '700', textAlign: 'center' },
  modalSubtitle: { color: '#aaa', textAlign: 'center', marginTop: 6, marginBottom: 16 },
  input: { backgroundColor: '#000', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#333' },
  modalActions: { gap: 10 }
});
