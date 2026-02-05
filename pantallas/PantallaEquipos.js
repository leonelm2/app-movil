import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { obtenerEquipos } from '../servicios/equipos';

export default function EquiposScreen() {
  const [equipos, setEquipos] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    const data = await obtenerEquipos();
    setEquipos(data);
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
