import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Entrada from '../componentes/Entrada';
import Boton from '../componentes/Boton';
import { AuthContext } from '../servicios/autenticacion';
import { normalizarCorreo, validarLogin } from '../utilidades/validaciones';

export default function LoginScreen({ navigation }) {
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mensajeError, setMensajeError] = useState('');
  const { iniciarSesion } = useContext(AuthContext);

  async function handleLogin() {
    const error = validarLogin({ correo, contraseña });
    if (error) {
      setMensajeError(error);
      return Alert.alert('Error', error);
    }
    setMensajeError('');
    setCargando(true);
    try {
      await iniciarSesion({ correo: normalizarCorreo(correo), contraseña });
    } catch (e) {
      const mensaje = e && e.message ? e.message : 'Error al iniciar sesión';
      setMensajeError(mensaje);
      Alert.alert('Error', mensaje);
    } finally {
      setCargando(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido a Potrero</Text>
      <Entrada
        label="Correo"
        icon="mail"
        value={correo}
        onChangeText={setCorreo}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Entrada
        label="Contraseña"
        icon="lock-closed"
        value={contraseña}
        onChangeText={setContraseña}
        secureTextEntry
        autoCorrect={false}
      />
      {mensajeError ? <Text style={styles.error}>{mensajeError}</Text> : null}
      <Boton onPress={handleLogin} disabled={cargando}>
        {cargando ? 'Ingresando...' : 'Ingresar'}
      </Boton>
      <TouchableOpacity onPress={() => navigation.navigate('Register')} style={{ marginTop: 16 }}>
        <Text style={{ color: '#ff2d2d' }}>¿No tienes cuenta? Regístrate</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 20, justifyContent: 'center' },
  title: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 24, textAlign: 'center' },
  error: { color: '#ff2d2d', marginBottom: 12, textAlign: 'center' },
});
