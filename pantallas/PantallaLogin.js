import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Entrada from '../componentes/Entrada';
import Boton from '../componentes/Boton';
import { AuthContext } from '../servicios/autenticacion';

export default function LoginScreen({ navigation }) {
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [cargando, setCargando] = useState(false);
  const { iniciarSesion } = useContext(AuthContext);

  async function handleLogin() {
    if (!correo || !contraseña) return Alert.alert('Error', 'Completa todos los campos');
    setCargando(true);
    try {
      await iniciarSesion({ correo, contraseña });
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido a TorneosApp</Text>
      <Entrada label="Correo" icon="mail" value={correo} onChangeText={setCorreo} keyboardType="email-address" />
      <Entrada label="Contraseña" icon="lock-closed" value={contraseña} onChangeText={setContraseña} secureTextEntry />
      <Boton onPress={handleLogin}>{cargando ? 'Ingresando...' : 'Ingresar'}</Boton>
      <TouchableOpacity onPress={() => navigation.navigate('Register')} style={{ marginTop: 16 }}>
        <Text style={{ color: '#ff2d2d' }}>¿No tienes cuenta? Regístrate</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 20, justifyContent: 'center' },
  title: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 24, textAlign: 'center' },
});
