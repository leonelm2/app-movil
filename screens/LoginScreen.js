import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Input from '../components/Input';
import Button from '../components/Button';
import { AuthContext } from '../services/auth';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  async function handleLogin() {
    if (!email || !password) return Alert.alert('Error', 'Completa todos los campos');
    setLoading(true);
    try {
      await login({ email, password });
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido a TorneosApp</Text>
      <Input label="Email" icon="mail" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <Input label="Contraseña" icon="lock-closed" value={password} onChangeText={setPassword} secureTextEntry />
      <Button onPress={handleLogin}>{loading ? 'Ingresando...' : 'Ingresar'}</Button>
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
