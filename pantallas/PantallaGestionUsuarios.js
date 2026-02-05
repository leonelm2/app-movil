import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import Boton from '../componentes/Boton';
import { AuthContext, ROLES } from '../servicios/autenticacion';

export default function ManageUsersScreen() {
  const { usuario, obtenerTodosLosUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario } = useContext(AuthContext);
  const [usuarios, setUsuarios] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [usuarioEditar, setUsuarioEditar] = useState(null);
  
  // Formulario
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [rol, setRol] = useState(ROLES.ENTRENADOR);
  const [activo, setActivo] = useState(true);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  async function cargarUsuarios() {
    try {
      const todosLosUsuarios = await obtenerTodosLosUsuarios();
      setUsuarios(todosLosUsuarios);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los usuarios');
    }
  }

  function abrirCrearModal() {
    setUsuarioEditar(null);
    setNombre('');
    setCorreo('');
    setContraseña('');
    setRol(ROLES.ENTRENADOR);
    setActivo(true);
    setModalVisible(true);
  }

  function abrirEditarModal(u) {
    setUsuarioEditar(u);
    setNombre(u.nombre);
    setCorreo(u.correo);
    setContraseña(u.contraseña);
    setRol(u.rol);
    setActivo(u.activo);
    setModalVisible(true);
  }

  async function guardar() {
    if (!nombre || !correo) {
      return Alert.alert('Error', 'Nombre y correo son requeridos');
    }

    try {
      if (usuarioEditar) {
        await actualizarUsuario(usuarioEditar.id, { nombre, correo, rol, activo });
        Alert.alert('Éxito', 'Usuario actualizado correctamente');
      } else {
        if (!contraseña) {
          return Alert.alert('Error', 'La contraseña es requerida');
        }
        await crearUsuario({ nombre, correo, contraseña, rol });
        Alert.alert('Éxito', 'Usuario creado correctamente');
      }
      setModalVisible(false);
      cargarUsuarios();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  }

  function eliminar(u) {
    if (u.id === usuario.id) {
      return Alert.alert('Error', 'No puedes eliminar tu propia cuenta');
    }
    
    Alert.alert('Confirmar', `¿Eliminar a ${u.nombre}?`, [
      { text: 'Cancelar' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await eliminarUsuario(u.id);
            Alert.alert('Éxito', 'Usuario eliminado');
            cargarUsuarios();
          } catch (error) {
            Alert.alert('Error', error.message);
          }
        }
      }
    ]);
  }

  const etiquetasRol = {
    [ROLES.ADMIN]: 'Administrador',
    [ROLES.ENTRENADOR]: 'Entrenador',
    [ROLES.COORDINADOR]: 'Coordinador'
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gestión de Usuarios</Text>
        <Boton onPress={abrirCrearModal}>➕ Nuevo Usuario</Boton>
      </View>

      <FlatList
        data={usuarios}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.nombre}</Text>
              <Text style={styles.userEmail}>{item.correo}</Text>
              <View style={styles.userMeta}>
                <View style={[
                  styles.roleBadge,
                  item.rol === ROLES.ADMIN && styles.roleBadgeAdmin,
                  item.rol === ROLES.COORDINADOR && styles.roleBadgeCoord,
                  item.rol === ROLES.ENTRENADOR && styles.roleBadgeEnt
                ]}>
                  <Text style={styles.roleBadgeText}>{etiquetasRol[item.rol]}</Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  item.activo ? styles.statusActive : styles.statusInactive
                ]}>
                  <Text style={styles.statusBadgeText}>
                    {item.activo ? '✓ Activo' : '✗ Inactivo'}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => abrirEditarModal(item)}
              >
                <Text style={styles.actionBtnText}>Editar</Text>
              </TouchableOpacity>
              {item.id !== usuario.id && (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.deleteBtn]}
                  onPress={() => eliminar(item)}
                >
                  <Text style={styles.actionBtnText}>Eliminar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay usuarios registrados</Text>
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <ScrollView style={styles.modal} showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>
              {usuarioEditar ? 'Editar Usuario' : 'Crear Usuario'}
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre completo"
                placeholderTextColor="#666"
                value={nombre}
                onChangeText={setNombre}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Correo</Text>
              <TextInput
                style={styles.input}
                placeholder="correo@ejemplo.com"
                placeholderTextColor="#666"
                value={correo}
                onChangeText={setCorreo}
                keyboardType="email-address"
              />
            </View>

            {!usuarioEditar && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Contraseña</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Contraseña"
                  placeholderTextColor="#666"
                  value={contraseña}
                  onChangeText={setContraseña}
                  secureTextEntry
                />
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.label}>Rol</Text>
              <View style={styles.roleButtons}>
                {[ROLES.ENTRENADOR, ROLES.COORDINADOR, ROLES.ADMIN].map(r => (
                  <TouchableOpacity
                    key={r}
                    style={[
                      styles.roleBtn,
                      rol === r && styles.roleBtnActive
                    ]}
                    onPress={() => setRol(r)}
                  >
                    <Text style={[
                      styles.roleBtnText,
                      rol === r && styles.roleBtnTextActive
                    ]}>
                      {etiquetasRol[r]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {usuarioEditar && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Estado</Text>
                <View style={styles.toggleButtons}>
                  <TouchableOpacity
                    style={[
                      styles.toggleBtn,
                      activo && styles.toggleBtnActive
                    ]}
                    onPress={() => setActivo(true)}
                  >
                    <Text style={[
                      styles.toggleBtnText,
                      activo && styles.toggleBtnTextActive
                    ]}>
                      Activo
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.toggleBtn,
                      !activo && styles.toggleBtnActive
                    ]}
                    onPress={() => setActivo(false)}
                  >
                    <Text style={[
                      styles.toggleBtnText,
                      !activo && styles.toggleBtnTextActive
                    ]}>
                      Inactivo
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={styles.modalActions}>
              <Boton onPress={guardar}>
                {usuarioEditar ? 'Actualizar' : 'Crear'}
              </Boton>
              <View style={{ marginTop: 10 }}>
                <Boton onPress={() => setModalVisible(false)}>Cancelar</Boton>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  header: {
    backgroundColor: '#111',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333'
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12
  },
  userCard: {
    backgroundColor: '#111',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ff2d2d'
  },
  userInfo: {
    marginBottom: 12
  },
  userName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4
  },
  userEmail: {
    color: '#aaa',
    fontSize: 13,
    marginBottom: 8
  },
  userMeta: {
    flexDirection: 'row',
    gap: 8
  },
  roleBadge: {
    backgroundColor: '#333',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
    alignSelf: 'flex-start'
  },
  roleBadgeAdmin: {
    backgroundColor: '#8b0000'
  },
  roleBadgeCoord: {
    backgroundColor: '#ff6b00'
  },
  roleBadgeEnt: {
    backgroundColor: '#0066cc'
  },
  roleBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600'
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4
  },
  statusActive: {
    backgroundColor: '#1a5a1a'
  },
  statusInactive: {
    backgroundColor: '#5a1a1a'
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600'
  },
  actions: {
    flexDirection: 'row',
    gap: 8
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#ff2d2d',
    paddingVertical: 8,
    borderRadius: 4,
    alignItems: 'center'
  },
  deleteBtn: {
    backgroundColor: '#a00'
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 14
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    paddingTop: 60
  },
  modal: {
    backgroundColor: '#111',
    marginHorizontal: 16,
    borderRadius: 8,
    padding: 20,
    marginBottom: 20
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center'
  },
  formGroup: {
    marginBottom: 16
  },
  label: {
    color: '#ff2d2d',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8
  },
  input: {
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 6,
    color: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 14
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 8
  },
  roleBtn: {
    flex: 1,
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center'
  },
  roleBtnActive: {
    borderColor: '#ff2d2d',
    backgroundColor: 'rgba(255,45,45,0.1)'
  },
  roleBtnText: {
    color: '#aaa',
    fontSize: 12,
    fontWeight: '600'
  },
  roleBtnTextActive: {
    color: '#ff2d2d'
  },
  toggleButtons: {
    flexDirection: 'row',
    gap: 8
  },
  toggleBtn: {
    flex: 1,
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center'
  },
  toggleBtnActive: {
    borderColor: '#ff2d2d',
    backgroundColor: 'rgba(255,45,45,0.1)'
  },
  toggleBtnText: {
    color: '#aaa',
    fontSize: 12,
    fontWeight: '600'
  },
  toggleBtnTextActive: {
    color: '#ff2d2d'
  },
  modalActions: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#333'
  }
});