import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import Input from '../components/Input';
import Button from '../components/Button';
import { AuthContext } from '../services/auth';

export default function ChangePasswordScreen() {
  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const { user, changePassword } = useContext(AuthContext);

  async function handleChange() {
    if (!current || !newPass || !confirm) return Alert.alert('Error', 'Completa todos los campos');
    if (newPass !== confirm) return Alert.alert('Error', 'Las contraseñas no coinciden');
    try {
      await changePassword({ email: user.email, currentPassword: current, newPassword: newPass });
      Alert.alert('Éxito', 'Contraseña cambiada correctamente');
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  }

  return (
    <View style={styles.container}>
      <Input label="Contraseña actual" icon="lock-closed" value={current} onChangeText={setCurrent} secureTextEntry />
      <Input label="Nueva contraseña" icon="lock-closed" value={newPass} onChangeText={setNewPass} secureTextEntry />
      <Input label="Confirmar nueva contraseña" icon="lock-closed" value={confirm} onChangeText={setConfirm} secureTextEntry />
      <Button onPress={handleChange}>Cambiar contraseña</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 20 } 
});
