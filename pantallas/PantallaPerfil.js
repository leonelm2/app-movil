import React, { useContext } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import Boton from '../componentes/Boton';
import { AuthContext } from '../servicios/autenticacion';

export default function ProfileScreen({ navigation }) {
  const { usuario, cerrarSesion } = useContext(AuthContext);

  async function handleLogout() {
    await cerrarSesion();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{usuario?.nombre}</Text>
      <Text style={{ color: '#ccc' }}>{usuario?.correo}</Text>

              <View style={{ marginTop: 20 }}>
        <Boton onPress={() => navigation.navigate('ChangePassword')}>Cambiar contraseña</Boton>
      </View>

      <View style={{ marginTop: 12 }}>
        <Boton onPress={handleLogout}>Cerrar sesión</Boton>
      </View> 
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 20, alignItems: 'center', justifyContent: 'center' },
  title: { color: '#fff', fontSize: 24, fontWeight: '800' },
});
