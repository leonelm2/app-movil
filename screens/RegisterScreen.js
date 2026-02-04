import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import Input from '../components/Input';
import Button from '../components/Button';
import { AuthContext } from '../services/auth';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const { register } = useContext(AuthContext);

  async function handleRegister() {
    if (!name || !email || !password || !confirm) return Alert.alert('Error', 'Completa todos los campos');
    if (password !== confirm) return Alert.alert('Error', 'Las contraseñas no coinciden');
    try {
      await register({ name, email, password });
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear cuenta</Text>
      <Input label="Nombre" icon="person" value={name} onChangeText={setName} />
      <Input label="Email" icon="mail" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <Input label="Contraseña" icon="lock-closed" value={password} onChangeText={setPassword} secureTextEntry />
      <Input label="Confirmar contraseña" icon="lock-closed" value={confirm} onChangeText={setConfirm} secureTextEntry />
      <Button onPress={handleRegister}>Registrarse</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 20, justifyContent: 'center' },
  title: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 24, textAlign: 'center' },
});
