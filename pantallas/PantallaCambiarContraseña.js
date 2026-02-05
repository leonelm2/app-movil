import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import Entrada from '../componentes/Entrada';
import Boton from '../componentes/Boton';
import { AuthContext } from '../servicios/autenticacion';
import { validarCambioContraseña } from '../utilidades/validaciones';

export default function ChangePasswordScreen() {
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mensajeError, setMensajeError] = useState('');
  const { usuario, cambiarContraseña } = useContext(AuthContext);

  async function handleChange() {
    const error = validarCambioContraseña({ actual, nueva, confirmar });
    if (error) {
      setMensajeError(error);
      return Alert.alert('Error', error);
    }
    setMensajeError('');
    setCargando(true);
    try {
      await cambiarContraseña({ correo: usuario.correo, contraseñaActual: actual, contraseñaNueva: nueva });
      Alert.alert('Éxito', 'Contraseña cambiada correctamente');
    } catch (e) {
      const mensaje = e && e.message ? e.message : 'Error al cambiar la contraseña';
      setMensajeError(mensaje);
      Alert.alert('Error', mensaje);
    } finally {
      setCargando(false);
    }
  }

  return (
    <View style={styles.container}>
      <Entrada label="Contraseña actual" icon="lock-closed" value={actual} onChangeText={setActual} secureTextEntry autoCorrect={false} />
      <Entrada label="Nueva contraseña" icon="lock-closed" value={nueva} onChangeText={setNueva} secureTextEntry autoCorrect={false} />
      <Entrada label="Confirmar nueva contraseña" icon="lock-closed" value={confirmar} onChangeText={setConfirmar} secureTextEntry autoCorrect={false} />
      {mensajeError ? <Text style={styles.error}>{mensajeError}</Text> : null}
      <Boton onPress={handleChange} disabled={cargando}>
        {cargando ? 'Guardando...' : 'Cambiar contraseña'}
      </Boton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 20 },
  error: { color: '#ff2d2d', marginBottom: 12, textAlign: 'center' }
});
