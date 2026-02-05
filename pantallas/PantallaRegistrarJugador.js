import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, FlatList, TouchableOpacity, Alert } from 'react-native';
import Boton from '../componentes/Boton';
import { obtenerTorneos, agregarJugador, obtenerJugadores } from '../servicios/torneos';

export default function RegisterPlayerScreen({ navigation }) {
  const [torneos, setTorneos] = useState([]);
  const [torneoSeleccionado, setTorneoSeleccionado] = useState(null);
  const [nombreJugador, setNombreJugador] = useState('');
  const [nombreEquipo, setNombreEquipo] = useState('');
  const [jugadores, setJugadores] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', cargarDatos);
    cargarDatos();
    return unsubscribe;
  }, [navigation]);

  async function cargarDatos() {
    const tLista = await obtenerTorneos();
    setTorneos(tLista);
  }

  async function seleccionarTorneo(torneo) {
    setTorneoSeleccionado(torneo);
    const pLista = await obtenerJugadores(torneo.id);
    setJugadores(pLista);
    setMostrarFormulario(true);
  }

  async function agregarNuevoJugador() {
    if (!nombreJugador || !nombreEquipo) {
      return Alert.alert('Error', 'Completa el nombre del jugador y el equipo');
    }
    
    if (!torneoSeleccionado) {
      return Alert.alert('Error', 'Selecciona un torneo primero');
    }

    try {
      await agregarJugador(torneoSeleccionado.id, { 
        nombre: nombreJugador, 
        equipo: nombreEquipo 
      });
      
      const pLista = await obtenerJugadores(torneoSeleccionado.id);
      setJugadores(pLista);
      setNombreJugador('');
      setNombreEquipo('');
      Alert.alert('Éxito', 'Jugador registrado correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo registrar el jugador');
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Registrar Jugador por Equipo</Text>

        {!mostrarFormulario ? (
          <>
            <Text style={styles.subtitle}>Selecciona un torneo</Text>
            <FlatList
              scrollEnabled={false}
              data={torneos}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.tournamentOption}
                  onPress={() => seleccionarTorneo(item)}
                >
                  <View>
                    <Text style={styles.tournamentName}>{item.nombre}</Text>
                    <Text style={styles.tournamentMeta}>{item.equipos} equipos</Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.noData}>No hay torneos disponibles</Text>
              }
            />
          </>
        ) : (
          <>
            <View style={styles.selectedTournament}>
              <Text style={styles.selectedLabel}>Torneo seleccionado:</Text>
              <Text style={styles.selectedName}>{torneoSeleccionado.nombre}</Text>
              <TouchableOpacity 
                style={styles.changeBtn}
                onPress={() => {
                  setMostrarFormulario(false);
                  setTorneoSeleccionado(null);
                  setJugadores([]);
                }}
              >
                <Text style={styles.changeBtnText}>Cambiar torneo</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <Text style={styles.formLabel}>Nombre del jugador</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Juan García"
                placeholderTextColor="#555"
                value={nombreJugador}
                onChangeText={setNombreJugador}
              />

              <Text style={styles.formLabel}>Equipo</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Equipo A"
                placeholderTextColor="#555"
                value={nombreEquipo}
                onChangeText={setNombreEquipo}
              />

              <Boton onPress={agregarNuevoJugador}>Registrar Jugador</Boton>
            </View>

            {jugadores.length > 0 && (
              <View style={styles.playersList}>
                <Text style={styles.playersTitle}>Jugadores Registrados</Text>
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
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  content: {
    flex: 1,
    padding: 20
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8
  },
  subtitle: {
    color: '#ff2d2d',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12
  },
  tournamentOption: {
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#ff2d2d'
  },
  tournamentName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4
  },
  tournamentMeta: {
    color: '#aaa',
    fontSize: 13
  },
  noData: {
    color: '#666',
    textAlign: 'center',
    paddingVertical: 20
  },
  selectedTournament: {
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ff2d2d'
  },
  selectedLabel: {
    color: '#aaa',
    fontSize: 12,
    marginBottom: 4
  },
  selectedName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12
  },
  changeBtn: {
    alignSelf: 'flex-start',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ff2d2d',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4
  },
  changeBtnText: {
    color: '#ff2d2d',
    fontSize: 12,
    fontWeight: '600'
  },
  form: {
    marginBottom: 24
  },
  formLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12
  },
  input: {
    backgroundColor: '#111',
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 14,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
    fontSize: 14,
    marginBottom: 12
  },
  playersList: {
    marginTop: 24
  },
  playersTitle: {
    color: '#ff2d2d',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12
  },
  playerCard: {
    backgroundColor: '#111',
    borderRadius: 6,
    padding: 12,
    marginBottom: 8
  },
  playerName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  playerTeam: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 4
  }
});
