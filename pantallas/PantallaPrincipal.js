import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import Boton from '../componentes/Boton';
import { AuthContext, ROLES } from '../servicios/autenticacion';
import { obtenerTorneos } from '../servicios/torneos';

export default function HomeScreen({ navigation }) {
  const { usuario } = useContext(AuthContext);
  const [torneos, setTorneos] = useState([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', cargarTorneos);
    cargarTorneos();
    return unsubscribe;
  }, [navigation]);

  async function cargarTorneos() {
    const lista = await obtenerTorneos();
    setTorneos(lista);
  }

  const esAdmin = usuario?.rol === ROLES.ADMIN;

  return (
    <View style={styles.container}>
      {/* Encabezado con "Potrero" */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>Potrero</Text>
          <Text style={styles.roleText}>
            {usuario?.rol === ROLES.ADMIN && '👨‍💼 Administrador'}
            {usuario?.rol === ROLES.ENTRENADOR && '🏋️ Entrenador'}
            {usuario?.rol === ROLES.COORDINADOR && '📋 Coordinador'}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Saludo */}
        <Text style={styles.greeting}>¡Bienvenido, {usuario?.nombre}!</Text>

        {esAdmin ? (
          // Vista para Administrador
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Administración</Text>
              <Boton onPress={() => navigation.navigate('Usuarios')}>
                👥 Gestionar Usuarios
              </Boton>
              <View style={{ marginTop: 12 }}>
                <Boton onPress={() => navigation.navigate('Perfil')}>
                  👤 Mi Perfil
                </Boton>
              </View>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Control Total</Text>
              <Text style={styles.infoText}>
                Como administrador, tienes acceso a la gestión completa de usuarios, asignación de roles y permisos.
              </Text>
            </View>
          </>
        ) : (
          // Vista para Entrenador y Coordinador
          <>
            {/* Sección de Torneos en los que participo */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mis Torneos</Text>
              {torneos.length > 0 ? (
                <FlatList
                  scrollEnabled={false}
                  data={torneos}
                  keyExtractor={item => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      style={styles.tournamentCard}
                      onPress={() => navigation.navigate('Torneos')}
                    >
                      <View style={styles.tournamentInfo}>
                        <Text style={styles.tournamentName}>{item.nombre}</Text>
                        <Text style={styles.tournamentMeta}>{item.equipos} equipos • {item.fecha}</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              ) : (
                <Text style={styles.noData}>No hay torneos disponibles</Text>
              )}
            </View>

            {/* Opciones principales */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Opciones</Text>
              <Boton onPress={() => navigation.navigate('Torneos')}>
                ⚽ Gestionar Torneos
              </Boton>
              <View style={{ marginTop: 12 }}>
                <Boton onPress={() => navigation.navigate('RegistrarJugador')}>
                  👥 Registrar Jugador por Equipo
                </Boton>
              </View>
              <View style={{ marginTop: 12 }}>
                <Boton onPress={() => navigation.navigate('Perfil')}>
                  👤 Mi Perfil
                </Boton>
              </View>
            </View>
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
  header: {
    paddingTop: 12,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ff2d2d'
  },
  logo: {
    color: '#ff2d2d',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1
  },
  roleText: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500'
  },
  content: {
    flex: 1,
    padding: 20
  },
  greeting: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    color: '#ff2d2d',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12
  },
  tournamentCard: {
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#ff2d2d'
  },
  tournamentInfo: {
    flex: 1
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
  infoCard: {
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ff2d2d',
    marginBottom: 24
  },
  infoTitle: {
    color: '#ff2d2d',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8
  },
  infoText: {
    color: '#aaa',
    fontSize: 13,
    lineHeight: 20
  }
});
