import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { esCorreoValido, normalizarCorreo, limpiarTexto } from '../utilidades/validaciones';

export const AuthContext = createContext();

// Claves para almacenamiento
const USUARIOS_KEY = 'USUARIOS';
const SESION_KEY = 'SESION';

// Roles disponibles
export const ROLES = {
  ADMIN: 'administrador',
  ENTRENADOR: 'entrenador',
  COORDINADOR: 'coordinador'
};

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
    const usuariosJson = await AsyncStorage.getItem(USUARIOS_KEY);
    const usuarios = usuariosJson ? JSON.parse(usuariosJson) : [];

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
    
    if (usuarios.find(u => u.correo.toLowerCase() === correoNormalizado)) {
      throw new Error('El correo ya está registrado');
    }

    // El primer usuario es automáticamente administrador
    const esPrimerUsuario = usuarios.length === 0;
    const nuevoUsuario = { 
      id: Date.now().toString(), 
      nombre: nombreLimpio, 
      correo: correoNormalizado, 
      contraseña,
      rol: esPrimerUsuario ? ROLES.ADMIN : rol,
      activo: true,
      creadoEn: new Date().toISOString()
    };
    
    usuarios.push(nuevoUsuario);
    await AsyncStorage.setItem(USUARIOS_KEY, JSON.stringify(usuarios));
    await AsyncStorage.setItem(SESION_KEY, JSON.stringify(nuevoUsuario));
    setUsuario(nuevoUsuario);
    return nuevoUsuario;
  }

  async function iniciarSesion({ correo, contraseña }) {
    const usuariosJson = await AsyncStorage.getItem(USUARIOS_KEY);
    const usuarios = usuariosJson ? JSON.parse(usuariosJson) : [];
    const correoNormalizado = normalizarCorreo(correo);
    const encontrado = usuarios.find(u => u.correo.toLowerCase() === correoNormalizado);
    
    if (!encontrado) throw new Error('El usuario no existe');
    if (encontrado.contraseña !== contraseña) throw new Error('Contraseña incorrecta');
    if (!encontrado.activo) throw new Error('Usuario desactivado');
    
    await AsyncStorage.setItem(SESION_KEY, JSON.stringify(encontrado));
    setUsuario(encontrado);
    return encontrado;
  }

  async function cerrarSesion() {
    await AsyncStorage.removeItem(SESION_KEY);
    setUsuario(null);
  }

  async function cambiarContraseña({ correo, contraseñaActual, contraseñaNueva }) {
    const usuariosJson = await AsyncStorage.getItem(USUARIOS_KEY);
    const usuarios = usuariosJson ? JSON.parse(usuariosJson) : [];
    const idx = usuarios.findIndex(u => u.correo === correo && u.contraseña === contraseñaActual);
    
    if (idx === -1) throw new Error('Contraseña actual incorrecta');
    if (!contraseñaNueva || contraseñaNueva.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }
    
    usuarios[idx].contraseña = contraseñaNueva;
    await AsyncStorage.setItem(USUARIOS_KEY, JSON.stringify(usuarios));
    const sesion = JSON.parse(await AsyncStorage.getItem(SESION_KEY));
    
    if (sesion && sesion.correo === correo) {
      sesion.contraseña = contraseñaNueva;
      await AsyncStorage.setItem(SESION_KEY, JSON.stringify(sesion));
      setUsuario(sesion);
    }
    return true;
  }

  // Funciones administrativas
  async function obtenerTodosLosUsuarios() {
    const usuariosJson = await AsyncStorage.getItem(USUARIOS_KEY);
    return usuariosJson ? JSON.parse(usuariosJson) : [];
  }

  async function crearUsuario({ nombre, correo, contraseña, rol }) {
    const usuariosJson = await AsyncStorage.getItem(USUARIOS_KEY);
    const usuarios = usuariosJson ? JSON.parse(usuariosJson) : [];
    const correoNormalizado = normalizarCorreo(correo);
    if (!esCorreoValido(correoNormalizado)) {
      throw new Error('Correo inválido');
    }
    if (usuarios.find(u => u.correo === correoNormalizado)) {
      throw new Error('El correo ya está registrado');
    }
    const nombreLimpio = limpiarTexto(nombre);
    if (!nombreLimpio) {
      throw new Error('Nombre y correo son requeridos');
    }
    if (!contraseña || contraseña.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    const nuevoUsuario = { 
      id: Date.now().toString(), 
      nombre: nombreLimpio, 
      correo: correoNormalizado, 
      contraseña,
      rol: rol || ROLES.ENTRENADOR,
      activo: true,
      creadoEn: new Date().toISOString()
    };
    
    usuarios.push(nuevoUsuario);
    await AsyncStorage.setItem(USUARIOS_KEY, JSON.stringify(usuarios));
    return nuevoUsuario;
  }

  async function actualizarUsuario(idUsuario, { nombre, correo, rol, activo }) {
    const usuariosJson = await AsyncStorage.getItem(USUARIOS_KEY);
    const usuarios = usuariosJson ? JSON.parse(usuariosJson) : [];
    const idx = usuarios.findIndex(u => u.id === idUsuario);
    
    if (idx === -1) throw new Error('Usuario no encontrado');
    const correoNormalizado = normalizarCorreo(correo);
    if (!esCorreoValido(correoNormalizado)) {
      throw new Error('Correo inválido');
    }
    const nombreLimpio = limpiarTexto(nombre);
    if (!nombreLimpio) {
      throw new Error('Nombre y correo son requeridos');
    }
    usuarios[idx] = { ...usuarios[idx], nombre: nombreLimpio, correo: correoNormalizado, rol, activo };
    await AsyncStorage.setItem(USUARIOS_KEY, JSON.stringify(usuarios));
    
    // Si es el usuario en sesión, actualizar también
    if (usuario && usuario.id === idUsuario) {
      setUsuario(usuarios[idx]);
      await AsyncStorage.setItem(SESION_KEY, JSON.stringify(usuarios[idx]));
    }
    
    return usuarios[idx];
  }

  async function eliminarUsuario(idUsuario) {
    const usuariosJson = await AsyncStorage.getItem(USUARIOS_KEY);
    const usuarios = usuariosJson ? JSON.parse(usuariosJson) : [];
    const filtrados = usuarios.filter(u => u.id !== idUsuario);
    await AsyncStorage.setItem(USUARIOS_KEY, JSON.stringify(filtrados));
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
