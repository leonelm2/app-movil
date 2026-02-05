import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import Entrada from '../componentes/Entrada';
import Boton from '../componentes/Boton';
import { AuthContext } from '../servicios/autenticacion';

export default function ChangePasswordScreen() {
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const { usuario, cambiarContraseña } = useContext(AuthContext);

  async function handleChange() {
    if (!actual || !nueva || !confirmar) return Alert.alert('Error', 'Completa todos los campos');
    if (nueva !== confirmar) return Alert.alert('Error', 'Las contraseñas no coinciden');
    try {
      await cambiarContraseña({ correo: usuario.correo, contraseñaActual: actual, contraseñaNueva: nueva });
      Alert.alert('Éxito', 'Contraseña cambiada correctamente');
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  }

  return (
    <View style={styles.container}>
      <Entrada label="Contraseña actual" icon="lock-closed" value={actual} onChangeText={setActual} secureTextEntry />
      <Entrada label="Nueva contraseña" icon="lock-closed" value={nueva} onChangeText={setNueva} secureTextEntry />
      <Entrada label="Confirmar nueva contraseña" icon="lock-closed" value={confirmar} onChangeText={setConfirmar} secureTextEntry />
      <Boton onPress={handleChange}>Cambiar contraseña</Boton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 20 } 
});
