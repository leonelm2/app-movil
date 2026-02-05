import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View, Alert, Platform } from 'react-native';
import AppNavigation from './navegacion';
import { AuthProvider } from './servicios/autenticacion';
import { obtenerTorneos } from './servicios/torneos';
import { obtenerEquipos } from './servicios/equipos';
import { obtenerCampeonatos } from './servicios/campeonatos';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RESET_KEY = 'RESET_DEMO_2026_02_05';

if (Platform.OS === 'web' && !Alert._webPatched) {
  const buildMessage = (title, message) => {
    const cleanTitle = title == null ? '' : String(title);
    const cleanMessage = message == null ? '' : String(message);
    if (cleanTitle && cleanMessage) return `${cleanTitle}\n\n${cleanMessage}`;
    return cleanTitle || cleanMessage;
  };

  Alert.alert = (title, message, buttons) => {
    const text = buildMessage(title, message);
    if (!buttons || buttons.length === 0) {
      if (text) window.alert(text);
      return;
    }

    const cancelButton = buttons.find(b => b && b.style === 'cancel');
    const okButton = buttons.find(b => b && b.style !== 'cancel') || buttons[0];
    const confirmed = window.confirm(text);
    if (confirmed) {
      okButton && okButton.onPress && okButton.onPress();
    } else {
      cancelButton && cancelButton.onPress && cancelButton.onPress();
    }
  };

  Alert._webPatched = true;
}

export default function App() {
  useEffect(() => {
    (async () => {
      const resetDone = await AsyncStorage.getItem(RESET_KEY);
      if (!resetDone) {
        await AsyncStorage.clear();
        await AsyncStorage.setItem(RESET_KEY, 'true');
      }
      await obtenerTorneos();
      await obtenerEquipos();
      await obtenerCampeonatos();
    })();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <View style={styles.container}>
          <AppNavigation />
          <StatusBar style="light" />
        </View>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
});
