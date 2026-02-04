import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Button from '../components/Button';
import { AuthContext } from '../services/auth';

export default function HomeScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hola, {user?.name}</Text>
      <Text style={styles.subtitle}>Gestiona tus torneos y jugadores fácilmente</Text>
      <View style={{ marginTop: 20 }}>
        <Button onPress={() => navigation.navigate('Torneos')}>Ir a Torneos</Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 20, alignItems: 'center', justifyContent: 'center' },
  title: { color: '#fff', fontSize: 26, fontWeight: '800' },
  subtitle: { color: '#ddd', marginTop: 6 }
});
