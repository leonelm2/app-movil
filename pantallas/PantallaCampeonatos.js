import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import Boton from '../componentes/Boton';
import { obtenerCampeonatos, crearCampeonato, actualizarCampeonato, eliminarCampeonato, obtenerDisciplinas } from '../servicios/campeonatos';
import { AuthContext, ROLES } from '../servicios/autenticacion';

export default function ChampionshipsScreen({ navigation }) {
  const { usuario } = useContext(AuthContext);
  const [championships, setChampionships] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingChamp, setEditingChamp] = useState(null);
  const esAdmin = usuario?.rol === ROLES.ADMIN;
  
  // Formulario
  const [name, setName] = useState('');
  const [disciplineId, setDisciplineId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const champsData = await obtenerCampeonatos();
      const discData = await obtenerDisciplinas();
      setChampionships(champsData);
      setDisciplines(discData);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los datos');
    }
  }

  function openCreateModal() {
    if (!esAdmin) return;
    setEditingChamp(null);
    setName('');
    setDisciplineId(disciplines[0]?.id || '');
    setStartDate('');
    setEndDate('');
    setDescription('');
    setModalVisible(true);
  }

  function openEditModal(champ) {
    if (!esAdmin) return;
    setEditingChamp(champ);
    setName(champ.nombre);
    setDisciplineId(champ.disciplinaId);
    setStartDate(champ.fechaInicio);
    setEndDate(champ.fechaFin);
    setDescription(champ.descripcion);
    setModalVisible(true);
  }

  async function handleSave() {
    if (!name || !disciplineId || !startDate || !endDate) {
      return Alert.alert('Error', 'Completa todos los campos requeridos');
    }

    try {
      if (editingChamp) {
        await actualizarCampeonato(editingChamp.id, {
          nombre: name,
          disciplinaId: disciplineId,
          fechaInicio: startDate,
          fechaFin: endDate,
          descripcion: description
        });
        Alert.alert('Éxito', 'Campeonato actualizado');
      } else {
        await crearCampeonato({
          nombre: name,
          disciplinaId: disciplineId,
          fechaInicio: startDate,
          fechaFin: endDate,
          descripcion: description
        });
        Alert.alert('Éxito', 'Campeonato creado');
      }
      setModalVisible(false);
      loadData();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  }

  function handleDelete(champ) {
    if (!esAdmin) return;
    Alert.alert('Confirmar', `¿Eliminar "${champ.nombre}"?`, [
      { text: 'Cancelar' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await eliminarCampeonato(champ.id);
            Alert.alert('Éxito', 'Campeonato eliminado');
            loadData();
          } catch (error) {
            Alert.alert('Error', error.message);
          }
        }
      }
    ]);
  }

  const getDisciplineName = (disciplineId) => {
    const disc = disciplines.find(d => d.id === disciplineId);
    return disc ? `${disc.icon} ${disc.name}` : 'Desconocido';
  };

  const statusColors = {
    'En preparación': '#ff6b00',
    'En curso': '#00cc00',
    'Finalizado': '#666'
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Campeonatos</Text>
        {esAdmin && <Boton onPress={openCreateModal}>➕ Nuevo</Boton>}
      </View>

      <FlatList
        data={championships}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.champCard}>
            <View style={styles.champInfo}>
              <Text style={styles.champName}>{item.nombre}</Text>
              <Text style={styles.discipline}>{getDisciplineName(item.disciplinaId)}</Text>
              <View style={styles.dates}>
                <Text style={styles.dateText}>📅 {item.fechaInicio} - {item.fechaFin}</Text>
              </View>
              {item.descripcion ? (
                <Text style={styles.description}>{item.descripcion}</Text>
              ) : null}
              <View style={[styles.statusBadge, { backgroundColor: statusColors[item.estado] || '#ff2d2d' }]}>
                <Text style={styles.statusText}>{item.estado}</Text>
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => navigation.navigate('ChampionshipDetail', { id: item.id })}
              >
                <Text style={styles.actionBtnText}>Detalles</Text>
              </TouchableOpacity>
              {esAdmin && (
                <>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => openEditModal(item)}
                  >
                    <Text style={styles.actionBtnText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.deleteBtn]}
                    onPress={() => handleDelete(item)}
                  >
                    <Text style={styles.actionBtnText}>Eliminar</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay campeonatos creados</Text>
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <ScrollView style={styles.modal} showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>
              {editingChamp ? 'Editar Campeonato' : 'Crear Campeonato'}
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Nombre del campeonato</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Copa Intercolegial 2026"
                placeholderTextColor="#666"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Disciplina</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.disciplinesList}>
                {disciplines.map(disc => (
                  <TouchableOpacity
                    key={disc.id}
                    style={[
                      styles.discButton,
                      disciplineId === disc.id && styles.discButtonActive
                    ]}
                    onPress={() => setDisciplineId(disc.id)}
                  >
                    <Text style={styles.discButtonText}>{disc.icon} {disc.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Fecha de inicio (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                placeholder="2026-03-01"
                placeholderTextColor="#666"
                value={startDate}
                onChangeText={setStartDate}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Fecha de fin (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                placeholder="2026-12-31"
                placeholderTextColor="#666"
                value={endDate}
                onChangeText={setEndDate}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Descripción (opcional)</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                placeholder="Detalles sobre el campeonato..."
                placeholderTextColor="#666"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.modalActions}>
              <Boton onPress={handleSave}>
                {editingChamp ? 'Actualizar' : 'Crear'}
              </Boton>
              <View style={{ marginTop: 10 }}>
                <Boton onPress={() => setModalVisible(false)}>Cancelar</Boton>
              </View>
            </View>
          </ScrollView>
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
    borderBottomColor: '#333'
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12
  },
  champCard: {
    backgroundColor: '#111',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ff2d2d'
  },
  champInfo: {
    marginBottom: 12
  },
  champName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4
  },
  discipline: {
    color: '#ff2d2d',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8
  },
  dates: {
    marginBottom: 8
  },
  dateText: {
    color: '#aaa',
    fontSize: 12
  },
  description: {
    color: '#ddd',
    fontSize: 12,
    marginBottom: 8,
    lineHeight: 16
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginBottom: 8
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600'
  },
  actions: {
    flexDirection: 'row',
    gap: 8
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#ff2d2d',
    paddingVertical: 8,
    borderRadius: 4,
    alignItems: 'center'
  },
  deleteBtn: {
    backgroundColor: '#a00'
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600'
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 14
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    paddingTop: 60
  },
  modal: {
    backgroundColor: '#111',
    marginHorizontal: 16,
    borderRadius: 8,
    padding: 20,
    marginBottom: 20
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center'
  },
  formGroup: {
    marginBottom: 16
  },
  label: {
    color: '#ff2d2d',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8
  },
  input: {
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 6,
    color: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 14
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 12
  },
  disciplinesList: {
    marginBottom: 8
  },
  discButton: {
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8
  },
  discButtonActive: {
    borderColor: '#ff2d2d',
    backgroundColor: 'rgba(255,45,45,0.1)'
  },
  discButtonText: {
    color: '#aaa',
    fontSize: 12,
    fontWeight: '600'
  },
  modalActions: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#333'
  }
});
