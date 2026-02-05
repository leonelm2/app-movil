import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { obtenerTorneos, crearTorneo, actualizarTorneo, eliminarTorneo, obtenerJugadores } from '../servicios/torneos';
import { AuthContext } from '../servicios/autenticacion';
import Boton from '../componentes/Boton';

export default function TournamentsScreen({ navigation }) {
  const { usuario } = useContext(AuthContext);
  const [torneos, setTorneos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editando, setEditando] = useState(null);
  const [nombre, setNombre] = useState('');
  const [equipos, setEquipos] = useState('');
  const [fecha, setFecha] = useState('');
  const [disciplina, setDisciplina] = useState('futbol');
  const [seleccionadoPara, setSeleccionadoPara] = useState(null);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', cargar);
    cargar();
    return unsubscribe;
  }, [navigation]);

  async function cargar() {
    const lista = await obtenerTorneos();
    setTorneos(lista);
  }


  async function crearOActualizar() {
    if (!nombre || !equipos || !fecha || !disciplina) return Alert.alert('Error', 'Completa todos los campos');
    if (editando) {
      await actualizarTorneo(editando.id, { nombre, equipos: parseInt(equipos, 10), fecha, disciplina });
    } else {
      const t = { nombre, equipos: parseInt(equipos, 10), fecha, disciplina, estado: 'Pendiente' };
      await crearTorneo(t);
    }
    setModalVisible(false);
    setEditando(null);
    setNombre(''); setEquipos(''); setFecha(''); setDisciplina('futbol');
    cargar();
  }

  async function editar(item) {
    setEditando(item);
    setNombre(item.nombre);
    setEquipos(String(item.equipos));
    setFecha(item.fecha);
    setDisciplina(item.disciplina || 'futbol');
    setModalVisible(true);
  }

  async function eliminar(item) {
    Alert.alert('Confirmar', '¿Eliminar este torneo?', [
      { text: 'Cancelar' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => { await eliminarTorneo(item.id); cargar(); } }
    ]);
  }

  async function verJugadores(torneo) {
    setSeleccionadoPara(torneo);
  }

  const puedeGestionar = usuario && (usuario.rol === 'organizador' || usuario.rol === 'profesor');
  const disciplinas = [
    { clave: 'futbol', etiqueta: 'FUTBOL' },
    { clave: 'basquet', etiqueta: 'BASQUET' },
    { clave: 'voley', etiqueta: 'VOLEY' }
  ];

  return (
    <View style={styles.container}>
      {!seleccionadoPara ? (
        <>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Gestionar Torneos</Text>
          </View>
          
          <FlatList
            data={torneos}
            keyExtractor={i => i.id}
            renderItem={({ item }) => (
              <View style={styles.tournamentCard}>
                <TouchableOpacity style={styles.cardContent} onPress={() => navigation.navigate('DetalleTorneo', { id: item.id })}>
                  <View style={styles.cardInfo}>
                    <Text style={styles.tournamentName}>{item.nombre}</Text>
                    <Text style={styles.meta}>{item.equipos} equipos • {item.fecha} • {item.disciplina || 'futbol'}</Text>
                  </View>
                </TouchableOpacity>
                <View style={styles.cardActions}>
                  <TouchableOpacity 
                    style={styles.actionBtn}
                    onPress={() => verJugadores(item)}
                  >
                    <Text style={styles.actionBtnText}>Jugadores</Text>
                  </TouchableOpacity>
                  {puedeGestionar && (
                    <>
                      <TouchableOpacity 
                        style={styles.actionBtn}
                        onPress={() => editar(item)}
                      >
                        <Text style={styles.actionBtnText}>Editar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.actionBtn, { backgroundColor: '#a00' }]}
                        onPress={() => eliminar(item)}
                      >
                        <Text style={styles.actionBtnText}>Eliminar</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            )}
            ListEmptyComponent={<Text style={{ color: '#fff', textAlign: 'center', marginTop: 20 }}>No hay torneos</Text>}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
          
          {puedeGestionar && (
            <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
              <Boton onPress={() => setModalVisible(true)}>➕ Crear Torneo</Boton>
            </View>
          )}
        </>
      ) : (
        <>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setSeleccionadoPara(null)} style={styles.backBtn}>
              <Text style={styles.backBtnText}>← Atrás</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Jugadores - {seleccionadoPara.nombre}</Text>
          </View>
          <ListaJugadores idTorneo={seleccionadoPara.id} />
        </>
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modal}>
            <Text style={{ color: '#fff', fontSize: 18, marginBottom: 16, fontWeight: '700' }}>
              {editando ? 'Editar Torneo' : 'Nuevo Torneo'}
            </Text>
            <TextInput 
              placeholder="Nombre del torneo" 
              placeholderTextColor="#666" 
              style={styles.input} 
              value={nombre} 
              onChangeText={setNombre} 
            />
            <TextInput 
              placeholder="Cantidad de equipos" 
              placeholderTextColor="#666" 
              style={styles.input} 
              keyboardType="numeric" 
              value={equipos} 
              onChangeText={setEquipos} 
            />
            <TextInput 
              placeholder="Fecha (YYYY-MM-DD)" 
              placeholderTextColor="#666" 
              style={styles.input} 
              value={fecha} 
              onChangeText={setFecha} 
            />
            <Text style={styles.modalLabel}>Disciplina</Text>
            <View style={styles.disciplinaRow}>
              {disciplinas.map(opcion => (
                <TouchableOpacity
                  key={opcion.clave}
                  style={[
                    styles.disciplinaBtn,
                    disciplina === opcion.clave && styles.disciplinaBtnActive
                  ]}
                  onPress={() => setDisciplina(opcion.clave)}
                >
                  <Text
                    style={[
                      styles.disciplinaText,
                      disciplina === opcion.clave && styles.disciplinaTextActive
                    ]}
                  >
                    {opcion.etiqueta}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <View style={{ flex: 1 }}>
                <Boton onPress={crearOActualizar}>Guardar</Boton>
              </View>
              <View style={{ flex: 1 }}>
                <Boton onPress={() => { setModalVisible(false); setEditando(null); }}>Cancelar</Boton>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function ListaJugadores({ idTorneo }) {
  const [jugadores, setJugadores] = useState([]);

  useEffect(() => {
    cargarJugadores();
  }, [idTorneo]);

  async function cargarJugadores() {
    const pList = await obtenerJugadores(idTorneo);
    setJugadores(pList);
  }

  return (
    <ScrollView style={styles.playerListContainer}>
      {jugadores.length > 0 ? (
        <FlatList
          scrollEnabled={false}
          data={jugadores}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.playerCard}>
              <Text style={styles.playerName}>{item.nombre}</Text>
              <Text style={styles.playerTeam}>{item.equipo}</Text>
            </View>
          )}
        />
      ) : (
        <Text style={{ color: '#666', textAlign: 'center', marginTop: 20 }}>No hay jugadores registrados</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000'
  },
  header: {
    backgroundColor: '#111',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    flexDirection: 'row',
    alignItems: 'center'
  },
  backBtn: {
    marginRight: 12,
    paddingVertical: 6,
    paddingHorizontal: 10
  },
  backBtnText: {
    color: '#ff2d2d',
    fontSize: 14,
    fontWeight: '600'
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    flex: 1
  },
  tournamentCard: {
    backgroundColor: '#111',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ff2d2d',
    overflow: 'hidden'
  },
  cardContent: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222'
  },
  cardInfo: {
    marginBottom: 8
  },
  tournamentName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6
  },
  meta: {
    color: '#aaa',
    fontSize: 13
  },
  cardActions: {
    flexDirection: 'row',
    padding: 12,
    gap: 8
  },
  actionBtn: {
    backgroundColor: '#ff2d2d',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    flex: 1,
    alignItems: 'center'
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  },
  playerListContainer: {
    flex: 1,
    padding: 16
  },
  playerCard: {
    backgroundColor: '#111',
    borderRadius: 6,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#ff2d2d'
  },
  playerName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4
  },
  playerTeam: {
    color: '#aaa',
    fontSize: 12
  },
  modalBg: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.8)', 
    justifyContent: 'center', 
    padding: 20 
  },
  modal: { 
    backgroundColor: '#111', 
    padding: 20, 
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333'
  },
  input: { 
    backgroundColor: '#000', 
    color: '#fff', 
    padding: 12, 
    borderRadius: 6, 
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333'
  },
  modalLabel: {
    color: '#aaa',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8
  },
  disciplinaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12
  },
  disciplinaBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#000',
    alignItems: 'center'
  },
  disciplinaBtnActive: {
    borderColor: '#ff2d2d',
    backgroundColor: 'rgba(255, 45, 45, 0.1)'
  },
  disciplinaText: {
    color: '#aaa',
    fontSize: 12,
    fontWeight: '600'
  },
  disciplinaTextActive: {
    color: '#ff2d2d'
  }
});
