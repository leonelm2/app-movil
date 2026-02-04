import React, { useContext } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import Button from '../components/Button';
import { AuthContext } from '../services/auth';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);

  async function handleLogout() {
    await logout();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{user?.name}</Text>
      <Text style={{ color: '#ccc' }}>{user?.email}</Text>

      <View style={{ marginTop: 20 }}>
        <Button onPress={() => navigation.navigate('ChangePassword')}>Cambiar contraseña</Button>
      </View>

      <View style={{ marginTop: 12 }}>
        <Button onPress={handleLogout}>Cerrar sesión</Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 20, alignItems: 'center', justifyContent: 'center' },
  title: { color: '#fff', fontSize: 24, fontWeight: '800' },
});
