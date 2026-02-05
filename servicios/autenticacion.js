import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { esCorreoValido, normalizarCorreo, limpiarTexto } from '../utilidades/validaciones';
import { apiRequest } from './api';

export const AuthContext = createContext();

// Claves para almacenamiento
const SESION_KEY = 'SESION';

// Roles disponibles
export const ROLES = {
  ADMIN: 'administrador',
  ENTRENADOR: 'entrenador',
  COORDINADOR: 'coordinador'
};

const HASH_PREFIX = 'h1:';

function hashPassword(texto) {
  const input = String(texto || '');
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return `${HASH_PREFIX}${(hash >>> 0).toString(16)}`;
}


export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const sesion = await AsyncStorage.getItem(SESION_KEY);
        if (sesion) setUsuario(JSON.parse(sesion));
      } catch (e) {
        console.warn('Error al cargar la sesión', e);
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  async function registrar({ nombre, correo, contraseña, rol = ROLES.ENTRENADOR }) {
    const correoNormalizado = normalizarCorreo(correo);
    if (!esCorreoValido(correoNormalizado)) {
      throw new Error('Correo inválido');
    }
    if (!contraseña || contraseña.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }
    const nombreLimpio = limpiarTexto(nombre);
    if (!nombreLimpio) {
      throw new Error('Completa todos los campos');
    }

    const nuevoUsuario = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        nombre: nombreLimpio,
        correo: correoNormalizado,
        contrasena: hashPassword(contraseña),
        rol
      })
    });

    await AsyncStorage.setItem(SESION_KEY, JSON.stringify(nuevoUsuario));
    setUsuario(nuevoUsuario);
    return nuevoUsuario;
  }

  async function iniciarSesion({ correo, contraseña }) {
    const correoNormalizado = normalizarCorreo(correo);
    const encontrado = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        correo: correoNormalizado,
        contrasena: hashPassword(contraseña)
      })
    });

    await AsyncStorage.setItem(SESION_KEY, JSON.stringify(encontrado));
    setUsuario(encontrado);
    return encontrado;
  }

  async function cerrarSesion() {
    await AsyncStorage.removeItem(SESION_KEY);
    setUsuario(null);
  }

  async function cambiarContraseña({ correo, contraseñaActual, contraseñaNueva }) {
    if (!contraseñaNueva || contraseñaNueva.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    const actualizado = await apiRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({
        correo,
        contrasenaActual: hashPassword(contraseñaActual),
        contrasenaNueva: hashPassword(contraseñaNueva)
      })
    });

    const sesion = JSON.parse(await AsyncStorage.getItem(SESION_KEY));
    if (sesion && sesion.correo === correo) {
      await AsyncStorage.setItem(SESION_KEY, JSON.stringify(actualizado));
      setUsuario(actualizado);
    }
    return true;
  }

  // Funciones administrativas
  async function obtenerTodosLosUsuarios() {
    return apiRequest('/users');
  }

  async function crearUsuario({ nombre, correo, contraseña, rol }) {
    const correoNormalizado = normalizarCorreo(correo);
    if (!esCorreoValido(correoNormalizado)) {
      throw new Error('Correo inválido');
    }
    const nombreLimpio = limpiarTexto(nombre);
    if (!nombreLimpio) {
      throw new Error('Nombre y correo son requeridos');
    }
    if (!contraseña || contraseña.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    return apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify({
        nombre: nombreLimpio,
        correo: correoNormalizado,
        contrasena: hashPassword(contraseña),
        rol: rol || ROLES.ENTRENADOR,
        activo: true
      })
    });
  }

  async function actualizarUsuario(idUsuario, { nombre, correo, rol, activo }) {
    const correoNormalizado = normalizarCorreo(correo);
    if (!esCorreoValido(correoNormalizado)) {
      throw new Error('Correo inválido');
    }
    const nombreLimpio = limpiarTexto(nombre);
    if (!nombreLimpio) {
      throw new Error('Nombre y correo son requeridos');
    }

    const actualizado = await apiRequest(`/users/${idUsuario}`, {
      method: 'PUT',
      body: JSON.stringify({
        nombre: nombreLimpio,
        correo: correoNormalizado,
        rol,
        activo
      })
    });

    if (usuario && usuario.id === idUsuario) {
      setUsuario(actualizado);
      await AsyncStorage.setItem(SESION_KEY, JSON.stringify(actualizado));
    }
    return actualizado;
  }

  async function eliminarUsuario(idUsuario) {
    await apiRequest(`/users/${idUsuario}`, { method: 'DELETE' });
  }

  return (
    <AuthContext.Provider value={{ 
      usuario, 
      cargando, 
      registrar, 
      iniciarSesion, 
      cerrarSesion, 
      cambiarContraseña,
      // Funciones administrativas
      obtenerTodosLosUsuarios,
      crearUsuario,
      actualizarUsuario,
      eliminarUsuario,
      ROLES
    }}>
      {children}
    </AuthContext.Provider>
  );
} 
