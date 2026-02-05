import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import Entrada from '../componentes/Entrada';
import Boton from '../componentes/Boton';
import { AuthContext, ROLES } from '../servicios/autenticacion';
import { limpiarTexto, normalizarCorreo, validarRegistro } from '../utilidades/validaciones';

export default function RegisterScreen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [rol, setRol] = useState(ROLES.ENTRENADOR);
  const [cargando, setCargando] = useState(false);
  const [mensajeError, setMensajeError] = useState('');
  const { registrar } = useContext(AuthContext);

  async function handleRegister() {
    const error = validarRegistro({ nombre, correo, contraseña, confirmar });
    if (error) {
      setMensajeError(error);
      return Alert.alert('Error', error);
    }
    setMensajeError('');
    setCargando(true);
    try {
      await registrar({
        nombre: limpiarTexto(nombre),
        correo: normalizarCorreo(correo),
        contraseña,
        rol
      });
      Alert.alert('Éxito', 'Cuenta creada exitosamente');
    } catch (e) {
      const mensaje = e && e.message ? e.message : 'Error al crear la cuenta';
      setMensajeError(mensaje);
      Alert.alert('Error', mensaje);
    } finally {
      setCargando(false);
    }
  }

  const opcionesRol = [
    { clave: ROLES.ENTRENADOR, etiqueta: 'Entrenador' },
    { clave: ROLES.COORDINADOR, etiqueta: 'Coordinador' }
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text style={styles.title}>Crear cuenta</Text>
        
        <Entrada 
          label="Nombre completo" 
          icon="person" 
          value={nombre} 
          onChangeText={setNombre}
          placeholder="Tu nombre"
          autoCapitalize="words"
        />
        
        <Entrada 
          label="Correo" 
          icon="mail" 
          value={correo} 
          onChangeText={setCorreo} 
          keyboardType="email-address"
          placeholder="tu@correo.com"
          autoCapitalize="none"
          autoCorrect={false}
        />
        
        <Entrada 
          label="Contraseña" 
          icon="lock-closed" 
          value={contraseña} 
          onChangeText={setContraseña} 
          secureTextEntry
          placeholder="Mínimo 6 caracteres"
          autoCorrect={false}
        />
        
        <Entrada 
          label="Confirmar contraseña" 
          icon="lock-closed" 
          value={confirmar} 
          onChangeText={setConfirmar} 
          secureTextEntry
          placeholder="Repite tu contraseña"
          autoCorrect={false}
        />

        <View style={styles.roleSection}>
          <Text style={styles.roleLabel}>Selecciona tu rol:</Text>
          <View style={styles.roleOptions}>
            {opcionesRol.map(opcion => (
              <TouchableOpacity
                key={opcion.clave}
                style={[
                  styles.roleButton,
                  rol === opcion.clave && styles.roleButtonActive
                ]}
                onPress={() => setRol(opcion.clave)}
              >
                <Text style={[
                  styles.roleButtonText,
                  rol === opcion.clave && styles.roleButtonTextActive
                ]}>
                  {opcion.etiqueta}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {mensajeError ? <Text style={styles.error}>{mensajeError}</Text> : null}
        <Boton onPress={handleRegister} disabled={cargando}>
          {cargando ? 'Creando...' : 'Registrarse'}
        </Boton>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000'
  },
  content: {
    padding: 20,
    paddingVertical: 40
  },
  title: { 
    color: '#fff', 
    fontSize: 24, 
    fontWeight: '800', 
    marginBottom: 24, 
    textAlign: 'center'
  },
  roleSection: {
    marginVertical: 20
  },
  roleLabel: {
    color: '#ff2d2d',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12
  },
  roleOptions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20
  },
  roleButton: {
    flex: 1,
    backgroundColor: '#111',
    borderRadius: 6,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#333'
  },
  roleButtonActive: {
    borderColor: '#ff2d2d',
    backgroundColor: 'rgba(255, 45, 45, 0.1)'
  },
  roleButtonText: {
    color: '#aaa',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 12
  },
  roleButtonTextActive: {
    color: '#ff2d2d'
  },
  error: {
    color: '#ff2d2d',
    textAlign: 'center',
    marginTop: 12
  },
  link: {
    color: '#ff2d2d',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 12,
    fontWeight: '600'
  }
});
