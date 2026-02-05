import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Modal, TextInput, Alert } from 'react-native';
import { obtenerEquipos, crearEquipo } from '../servicios/equipos';
import Boton from '../componentes/Boton';

export default function EquiposScreen() {
  const [equipos, setEquipos] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [nombreEquipo, setNombreEquipo] = useState('');

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    const data = await obtenerEquipos();
    setEquipos(data);
  }

  async function handleCrearEquipo() {
    const nombreLimpio = String(nombreEquipo || '').trim();
    if (!nombreLimpio) return Alert.alert('Error', 'Nombre requerido');
    try {
      await crearEquipo(nombreLimpio);
      setNombreEquipo('');
      setModalVisible(false);
      cargar();
    } catch (error) {
      Alert.alert('Error', error.message || 'No se pudo crear el equipo');
    }
  }

  if (seleccionado) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSeleccionado(null)} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{seleccionado.nombre}</Text>
        </View>

        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {seleccionado.jugadores.map(jugador => (
            <View key={jugador.id} style={styles.playerCard}>
              <Text style={styles.playerName}>{jugador.nombre}</Text>
              <Text style={styles.playerMeta}>
                {jugador.edad} anios • {jugador.posicion} • {jugador.nacionalidad}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerList}>
        <Text style={styles.headerTitle}>Equipos</Text>
        <Boton onPress={() => setModalVisible(true)} small>➕ Nuevo</Boton>
      </View>
      <FlatList
        data={equipos}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.teamCard} onPress={() => setSeleccionado(item)}>
            <Text style={styles.teamName}>{item.nombre}</Text>
            <Text style={styles.teamMeta}>{item.jugadores.length} jugadores</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No hay equipos cargados</Text>}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Nuevo equipo</Text>
            <TextInput
              placeholder="Nombre del equipo"
              placeholderTextColor="#666"
              style={styles.input}
              value={nombreEquipo}
              onChangeText={setNombreEquipo}
            />
            <View style={styles.modalActions}>
              <Boton onPress={handleCrearEquipo}>Crear</Boton>
              <View style={{ marginTop: 10 }}>
                <Boton onPress={() => setModalVisible(false)}>Cancelar</Boton>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
  headerList: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 20
  },
  modal: {
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333'
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center'
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
  modalActions: {
    marginTop: 4
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
  list: {
    paddingHorizontal: 16
  },
  teamCard: {
    backgroundColor: '#111',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ff2d2d',
    padding: 14
  },
  teamName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6
  },
  teamMeta: {
    color: '#aaa',
    fontSize: 12
  },
  emptyText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 20
  },
  playerCard: {
    backgroundColor: '#111',
    padding: 12,
    borderRadius: 8,
    marginTop: 10
  },
  playerName: {
    color: '#fff',
    fontWeight: '700'
  },
  playerMeta: {
    color: '#aaa',
    marginTop: 4,
    fontSize: 12
  }
});
