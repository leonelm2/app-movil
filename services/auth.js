import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export const AuthContext = createContext();

// Keys for storage
const USERS_KEY = 'USERS';
const SESSION_KEY = 'SESSION';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const session = await AsyncStorage.getItem(SESSION_KEY);
        if (session) setUser(JSON.parse(session));
      } catch (e) {
        console.warn('Failed to load session', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function register({ name, email, password }) {
    const usersJson = await AsyncStorage.getItem(USERS_KEY);
    const users = usersJson ? JSON.parse(usersJson) : [];
    if (users.find(u => u.email === email)) {
      throw new Error('El email ya está registrado');
    }
    const newUser = { id: Date.now().toString(), name, email, password };
    users.push(newUser);
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    setUser(newUser);
    return newUser;
  }

  async function login({ email, password }) {
    const usersJson = await AsyncStorage.getItem(USERS_KEY);
    const users = usersJson ? JSON.parse(usersJson) : [];
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) throw new Error('Credenciales inválidas');
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(found));
    setUser(found);
    return found;
  }

  async function logout() {
    await AsyncStorage.removeItem(SESSION_KEY);
    setUser(null);
  }

  async function changePassword({ email, currentPassword, newPassword }) {
    const usersJson = await AsyncStorage.getItem(USERS_KEY);
    const users = usersJson ? JSON.parse(usersJson) : [];
    const idx = users.findIndex(u => u.email === email && u.password === currentPassword);
    if (idx === -1) throw new Error('Contraseña actual incorrecta');
    users[idx].password = newPassword;
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    const session = JSON.parse(await AsyncStorage.getItem(SESSION_KEY));
    if (session && session.email === email) {
      session.password = newPassword;
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
      setUser(session);
    }
    return true;
  }

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}
