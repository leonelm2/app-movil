import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import Boton from '../componentes/Boton';
import { obtenerCampeonatoId, agregarEquipoACampeonato, eliminarEquipoDeCampeonato, agregarJugadorAEquipo, eliminarJugadorDeEquipo } from '../servicios/campeonatos';
import { crearFaseGrupos, registrarResultadoGrupo, crearEliminatorias, registrarResultadoEliminatoria } from '../servicios/fases';
import { AuthContext, ROLES } from '../servicios/autenticacion';

export default function ChampionshipDetailScreen({ route }) {
  const { id } = route.params;
  const { usuario } = useContext(AuthContext);
  const esAdmin = usuario?.rol === ROLES.ADMIN;
  const puedeCargarResultados = usuario?.rol === ROLES.ADMIN || usuario?.rol === ROLES.ENTRENADOR;

  const [campeonato, setCampeonato] = useState(null);
  const [activeTab, setActiveTab] = useState('equipos');
  const [selectedTeam, setSelectedTeam] = useState(null);

  const [teamModalVisible, setTeamModalVisible] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamColor, setTeamColor] = useState('#FF0000');
  const [coachName, setCoachName] = useState('');

  const [playerModalVisible, setPlayerModalVisible] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [playerNumber, setPlayerNumber] = useState('');
  const [playerPosition, setPlayerPosition] = useState('');

  const [groupsModalVisible, setGroupsModalVisible] = useState(false);
  const [groupsName, setGroupsName] = useState('Fase de grupos');
  const [groupsCount, setGroupsCount] = useState('2');

  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [resultContext, setResultContext] = useState(null);
  const [golesLocal, setGolesLocal] = useState('');
  const [golesVisitante, setGolesVisitante] = useState('');

  useEffect(() => {
    loadChampionship();
  }, []);

  async function loadChampionship() {
    try {
      const data = await obtenerCampeonatoId(id);
      setCampeonato(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar el campeonato');
    }
  }

  async function handleAddTeam() {
    if (!teamName || !coachName) {
      return Alert.alert('Error', 'Nombre y entrenador son requeridos');
    }

    try {
      await agregarEquipoACampeonato(id, {
        nombre: teamName,
        color: teamColor,
        entrenador: coachName
      });
      setTeamModalVisible(false);
      setTeamName('');
      setCoachName('');
      loadChampionship();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  }

  async function handleAddPlayer() {
    if (!selectedTeam || !playerName || !playerNumber || !playerPosition) {
      return Alert.alert('Error', 'Completa todos los campos');
    }

    try {
      await agregarJugadorAEquipo(id, selectedTeam.id, {
        nombre: playerName,
        numero: playerNumber,
        posicion: playerPosition
      });
      setPlayerModalVisible(false);
      setPlayerName('');
      setPlayerNumber('');
      setPlayerPosition('');
      loadChampionship();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  }

  async function handleRemoveTeam(teamId) {
    Alert.alert('Confirmar', '¿Eliminar este equipo?', [
      { text: 'Cancelar' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await eliminarEquipoDeCampeonato(id, teamId);
            if (selectedTeam?.id === teamId) setSelectedTeam(null);
            loadChampionship();
          } catch (error) {
            Alert.alert('Error', error.message);
          }
        }
      }
    ]);
  }

  async function handleRemovePlayer(teamId, playerId) {
    Alert.alert('Confirmar', '¿Eliminar este jugador?', [
      { text: 'Cancelar' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await eliminarJugadorDeEquipo(id, teamId, playerId);
            loadChampionship();
          } catch (error) {
            Alert.alert('Error', error.message);
          }
        }
      }
    ]);
  }

  async function handleCreateGroups() {
    if (!groupsCount) return Alert.alert('Error', 'Cantidad de grupos requerida');
    try {
      await crearFaseGrupos(id, { nombre: groupsName, cantidadGrupos: groupsCount });
      setGroupsModalVisible(false);
      loadChampionship();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  }

  async function handleCreateEliminatorias() {
    try {
      await crearEliminatorias(id, { nombre: 'Eliminatorias' });
      loadChampionship();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  }

  function openResultModal(contexto) {
    setResultContext(contexto);
    setGolesLocal(contexto.partido.golesLocal !== null && contexto.partido.golesLocal !== undefined ? String(contexto.partido.golesLocal) : '');
    setGolesVisitante(contexto.partido.golesVisitante !== null && contexto.partido.golesVisitante !== undefined ? String(contexto.partido.golesVisitante) : '');
    setResultModalVisible(true);
  }

  async function handleSaveResult() {
    if (!resultContext) return;
    if (golesLocal === '' || golesVisitante === '') return;

    try {
      if (resultContext.tipo === 'grupos') {
        await registrarResultadoGrupo(id, resultContext.grupoId, resultContext.partido.id, {
          golesLocal,
          golesVisitante
        });
      } else {
        await registrarResultadoEliminatoria(id, resultContext.partido.id, {
          golesLocal,
          golesVisitante
        });
      }
      setResultModalVisible(false);
      setResultContext(null);
      setGolesLocal('');
      setGolesVisitante('');
      loadChampionship();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  }

  if (!campeonato) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Cargando...</Text>
      </View>
    );
  }

  const posiciones = ['Portero', 'Defensa', 'Mediocampista', 'Delantero'];
  const colors = ['#FF0000', '#0066FF', '#00AA00', '#FFAA00', '#FF00AA', '#00FFAA'];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.champName}>{campeonato.nombre}</Text>
          <Text style={styles.dates}>📅 {campeonato.fechaInicio} - {campeonato.fechaFin}</Text>
          <Text style={styles.description}>{campeonato.descripcion}</Text>
        </View>

        <View style={styles.tabs}>
          {['equipos', 'jugadores', 'grupos', 'eliminatorias'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'equipos' && `Equipos (${campeonato.equipos.length})`}
                {tab === 'jugadores' && 'Jugadores'}
                {tab === 'grupos' && 'Grupos'}
                {tab === 'eliminatorias' && 'Eliminatorias'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'equipos' && (
          <>
            {esAdmin && (
              <View style={styles.content}>
                <Boton onPress={() => setTeamModalVisible(true)}>➕ Agregar Equipo</Boton>
              </View>
            )}

            {campeonato.equipos.length > 0 ? (
              <FlatList
                scrollEnabled={false}
                data={campeonato.equipos}
                keyExtractor={item => item.id}
                renderItem={({ item: team }) => (
                  <View style={styles.teamCard}>
                    <View style={[styles.teamColorBar, { backgroundColor: team.color }]} />
                    <View style={styles.teamInfo}>
                      <Text style={styles.teamName}>{team.nombre}</Text>
                      <Text style={styles.coachName}>⚽ {team.entrenador}</Text>
                      <Text style={styles.playerCount}>{team.jugadores.length} jugadores</Text>
                    </View>
                    <View style={styles.teamActions}>
                      <TouchableOpacity
                        style={styles.smallBtn}
                        onPress={() => {
                          setSelectedTeam(team);
                          setActiveTab('jugadores');
                        }}
                      >
                        <Text style={styles.smallBtnText}>👥</Text>
                      </TouchableOpacity>
                      {esAdmin && (
                        <TouchableOpacity
                          style={[styles.smallBtn, styles.deleteSmalBtn]}
                          onPress={() => handleRemoveTeam(team.id)}
                        >
                          <Text style={styles.smallBtnText}>🗑</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}
              />
            ) : (
              <Text style={styles.emptyText}>No hay equipos agregados</Text>
            )}
          </>
        )}

        {activeTab === 'jugadores' && (
          <>
            {selectedTeam ? (
              <>
                <View style={styles.selectedTeamHeader}>
                  <TouchableOpacity onPress={() => setSelectedTeam(null)}>
                    <Text style={styles.backLink}>← Volver a equipos</Text>
                  </TouchableOpacity>
                  <Text style={styles.selectedTeamName}>{selectedTeam.nombre}</Text>
                  {esAdmin && (
                    <View style={styles.content}>
                      <Boton onPress={() => setPlayerModalVisible(true)}>➕ Agregar Jugador</Boton>
                    </View>
                  )}
                </View>

                {selectedTeam.jugadores.length > 0 ? (
                  <FlatList
                    scrollEnabled={false}
                    data={selectedTeam.jugadores}
                    keyExtractor={item => item.id}
                    renderItem={({ item: player }) => (
                      <View style={styles.playerCard}>
                        <View style={styles.playerInfo}>
                          <Text style={styles.playerNumber}>#{player.numero}</Text>
                          <View style={styles.playerDetails}>
                            <Text style={styles.playerName}>{player.nombre}</Text>
                            <Text style={styles.playerPosition}>{player.posicion}</Text>
                          </View>
                        </View>
                        {esAdmin && (
                          <TouchableOpacity onPress={() => handleRemovePlayer(selectedTeam.id, player.id)}>
                            <Text style={styles.deleteIcon}>🗑</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  />
                ) : (
                  <Text style={styles.emptyText}>No hay jugadores en este equipo</Text>
                )}
              </>
            ) : (
              <Text style={styles.emptyText}>Selecciona un equipo para ver sus jugadores</Text>
            )}
          </>
        )}

        {activeTab === 'grupos' && (
          <>
            {!campeonato.fases.grupos && esAdmin && (
              <View style={styles.content}>
                <Boton onPress={() => setGroupsModalVisible(true)}>➕ Crear fase de grupos</Boton>
              </View>
            )}

            {campeonato.fases.grupos ? (
              campeonato.fases.grupos.grupos.map(grupo => (
                <View key={grupo.id} style={styles.groupCard}>
                  <Text style={styles.groupTitle}>{grupo.nombre}</Text>

                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableCell, styles.tableTeam]}>Equipo</Text>
                    <Text style={styles.tableCell}>PJ</Text>
                    <Text style={styles.tableCell}>G</Text>
                    <Text style={styles.tableCell}>E</Text>
                    <Text style={styles.tableCell}>P</Text>
                    <Text style={styles.tableCell}>GF</Text>
                    <Text style={styles.tableCell}>GC</Text>
                    <Text style={styles.tableCell}>Pts</Text>
                  </View>
                  {grupo.equipos.map(team => (
                    <View key={team.id} style={styles.tableRow}>
                      <Text style={[styles.tableCell, styles.tableTeam]}>{team.nombre}</Text>
                      <Text style={styles.tableCell}>{team.estadisticas.jugados}</Text>
                      <Text style={styles.tableCell}>{team.estadisticas.ganados}</Text>
                      <Text style={styles.tableCell}>{team.estadisticas.empatados}</Text>
                      <Text style={styles.tableCell}>{team.estadisticas.perdidos}</Text>
                      <Text style={styles.tableCell}>{team.estadisticas.golesAFavor}</Text>
                      <Text style={styles.tableCell}>{team.estadisticas.golesEnContra}</Text>
                      <Text style={styles.tableCell}>{team.estadisticas.puntos}</Text>
                    </View>
                  ))}

                  <Text style={styles.sectionLabel}>Partidos</Text>
                  {grupo.partidos.map(partido => (
                    <View key={partido.id} style={styles.matchRow}>
                      <View style={styles.matchInfo}>
                        <Text style={styles.matchTeams}>{partido.local.nombre} vs {partido.visitante.nombre}</Text>
                        <Text style={styles.matchScore}>
                          {partido.jugado ? `${partido.golesLocal} - ${partido.golesVisitante}` : 'Sin resultado'}
                        </Text>
                      </View>
                      {puedeCargarResultados && (
                        <TouchableOpacity style={styles.matchBtn} onPress={() => openResultModal({ tipo: 'grupos', grupoId: grupo.id, partido })}>
                          <Text style={styles.matchBtnText}>{partido.jugado ? 'Editar' : 'Cargar'}</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Todavia no hay fase de grupos</Text>
            )}
          </>
        )}

        {activeTab === 'eliminatorias' && (
          <>
            {!campeonato.fases.eliminatorias && campeonato.fases.grupos && esAdmin && (
              <View style={styles.content}>
                <Boton onPress={handleCreateEliminatorias}>➕ Crear eliminatorias</Boton>
              </View>
            )}

            {campeonato.fases.eliminatorias ? (
              campeonato.fases.eliminatorias.partidos.map(partido => (
                <View key={partido.id} style={styles.matchRow}>
                  <View style={styles.matchInfo}>
                    <Text style={styles.matchTeams}>{partido.local.nombre} vs {partido.visitante.nombre}</Text>
                    <Text style={styles.matchScore}>
                      {partido.jugado ? `${partido.golesLocal} - ${partido.golesVisitante}` : 'Sin resultado'}
                    </Text>
                  </View>
                  {puedeCargarResultados && (
                    <TouchableOpacity style={styles.matchBtn} onPress={() => openResultModal({ tipo: 'eliminatorias', partido })}>
                      <Text style={styles.matchBtnText}>{partido.jugado ? 'Editar' : 'Cargar'}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Todavia no hay eliminatorias</Text>
            )}
          </>
        )}
      </ScrollView>

      <Modal visible={teamModalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <ScrollView style={styles.modal} showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>Agregar Equipo</Text>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nombre del equipo</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Equipo A"
                placeholderTextColor="#666"
                value={teamName}
                onChangeText={setTeamName}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Entrenador</Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre del entrenador"
                placeholderTextColor="#666"
                value={coachName}
                onChangeText={setCoachName}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Color del equipo</Text>
              <View style={styles.colorPicker}>
                {colors.map(color => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      teamColor === color && styles.colorOptionSelected
                    ]}
                    onPress={() => setTeamColor(color)}
                  >
                    {teamColor === color && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <Boton onPress={handleAddTeam}>Agregar</Boton>
              <View style={{ marginTop: 10 }}>
                <Boton onPress={() => setTeamModalVisible(false)}>Cancelar</Boton>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={playerModalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <ScrollView style={styles.modal} showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>Agregar Jugador</Text>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre del jugador"
                placeholderTextColor="#666"
                value={playerName}
                onChangeText={setPlayerName}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Numero de camiseta</Text>
              <TextInput
                style={styles.input}
                placeholder="1"
                placeholderTextColor="#666"
                value={playerNumber}
                onChangeText={setPlayerNumber}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Posicion</Text>
              <View style={styles.positionButtons}>
                {posiciones.map(pos => (
                  <TouchableOpacity
                    key={pos}
                    style={[styles.positionBtn, playerPosition === pos && styles.positionBtnActive]}
                    onPress={() => setPlayerPosition(pos)}
                  >
                    <Text style={[styles.positionBtnText, playerPosition === pos && styles.positionBtnTextActive]}>{pos}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <Boton onPress={handleAddPlayer}>Agregar</Boton>
              <View style={{ marginTop: 10 }}>
                <Boton onPress={() => setPlayerModalVisible(false)}>Cancelar</Boton>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={groupsModalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <ScrollView style={styles.modal} showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>Crear fase de grupos</Text>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                style={styles.input}
                placeholder="Fase de grupos"
                placeholderTextColor="#666"
                value={groupsName}
                onChangeText={setGroupsName}
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Cantidad de grupos</Text>
              <TextInput
                style={styles.input}
                placeholder="2"
                placeholderTextColor="#666"
                value={groupsCount}
                onChangeText={setGroupsCount}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.modalActions}>
              <Boton onPress={handleCreateGroups}>Crear</Boton>
              <View style={{ marginTop: 10 }}>
                <Boton onPress={() => setGroupsModalVisible(false)}>Cancelar</Boton>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={resultModalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Cargar resultado</Text>
            {resultContext && (
              <Text style={styles.modalSubtitle}>
                {resultContext.partido.local.nombre} vs {resultContext.partido.visitante.nombre}
              </Text>
            )}
            <TextInput
              style={styles.input}
              placeholder="Goles local"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={golesLocal}
              onChangeText={setGolesLocal}
            />
            <TextInput
              style={styles.input}
              placeholder="Goles visitante"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={golesVisitante}
              onChangeText={setGolesVisitante}
            />
            <View style={styles.modalActions}>
              <Boton onPress={handleSaveResult}>Guardar</Boton>
              <View style={{ marginTop: 10 }}>
                <Boton onPress={() => setResultModalVisible(false)}>Cancelar</Boton>
              </View>
            </View>
          </View>
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
  loading: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 20
  },
  header: {
    backgroundColor: '#111',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333'
  },
  champName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8
  },
  dates: {
    color: '#aaa',
    fontSize: 13,
    marginBottom: 8
  },
  description: {
    color: '#ddd',
    fontSize: 12,
    lineHeight: 16
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#111',
    borderBottomWidth: 1,
    borderBottomColor: '#333'
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    alignItems: 'center'
  },
  tabActive: {
    borderBottomColor: '#ff2d2d'
  },
  tabText: {
    color: '#aaa',
    fontSize: 12,
    fontWeight: '600'
  },
  tabTextActive: {
    color: '#ff2d2d'
  },
  content: {
    padding: 16
  },
  teamCard: {
    backgroundColor: '#111',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center'
  },
  teamColorBar: {
    width: 6,
    height: '100%'
  },
  teamInfo: {
    flex: 1,
    padding: 12
  },
  teamName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2
  },
  coachName: {
    color: '#aaa',
    fontSize: 12,
    marginBottom: 4
  },
  playerCount: {
    color: '#ff2d2d',
    fontSize: 11,
    fontWeight: '600'
  },
  teamActions: {
    flexDirection: 'row',
    paddingRight: 12,
    gap: 6
  },
  smallBtn: {
    backgroundColor: '#ff2d2d',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4
  },
  deleteSmalBtn: {
    backgroundColor: '#a00'
  },
  smallBtnText: {
    fontSize: 14
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 30,
    fontSize: 14
  },
  selectedTeamHeader: {
    backgroundColor: '#111',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333'
  },
  backLink: {
    color: '#ff2d2d',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8
  },
  selectedTeamName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12
  },
  playerCard: {
    backgroundColor: '#111',
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeftWidth: 3,
    borderLeftColor: '#ff2d2d'
  },
  playerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  playerNumber: {
    color: '#ff2d2d',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 12,
    minWidth: 35
  },
  playerDetails: {
    flex: 1
  },
  playerName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2
  },
  playerPosition: {
    color: '#aaa',
    fontSize: 11
  },
  deleteIcon: {
    fontSize: 18,
    paddingLeft: 10
  },
  groupCard: {
    backgroundColor: '#111',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    padding: 12
  },
  groupTitle: {
    color: '#fff',
    fontWeight: '700',
    marginBottom: 10
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#222'
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#111'
  },
  tableCell: {
    color: '#ccc',
    fontSize: 11,
    width: 28,
    textAlign: 'center'
  },
  tableTeam: {
    flex: 1,
    width: 'auto',
    textAlign: 'left'
  },
  sectionLabel: {
    color: '#ff2d2d',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 6
  },
  matchRow: {
    backgroundColor: '#111',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center'
  },
  matchInfo: {
    flex: 1
  },
  matchTeams: {
    color: '#fff',
    fontWeight: '700'
  },
  matchScore: {
    color: '#aaa',
    marginTop: 4
  },
  matchBtn: {
    backgroundColor: '#222',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6
  },
  matchBtnText: {
    color: '#fff',
    fontWeight: '600'
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
  modalSubtitle: {
    color: '#aaa',
    textAlign: 'center',
    marginTop: -10,
    marginBottom: 16
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
    fontSize: 14,
    marginBottom: 10
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center'
  },
  colorOptionSelected: {
    borderColor: '#fff'
  },
  checkmark: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700'
  },
  positionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  positionBtn: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center'
  },
  positionBtnActive: {
    borderColor: '#ff2d2d',
    backgroundColor: 'rgba(255,45,45,0.1)'
  },
  positionBtnText: {
    color: '#aaa',
    fontSize: 12,
    fontWeight: '600'
  },
  positionBtnTextActive: {
    color: '#ff2d2d'
  },
  modalActions: {
    marginTop: 10
  }
});import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import Boton from '../componentes/Boton';
import { obtenerCampeonatoId, agregarEquipoACampeonato, eliminarEquipoDeCampeonato, agregarJugadorAEquipo, eliminarJugadorDeEquipo } from '../servicios/campeonatos';
import { crearFaseGrupos, registrarResultadoGrupo, crearEliminatorias, registrarResultadoEliminatoria } from '../servicios/fases';
import { AuthContext, ROLES } from '../servicios/autenticacion';

export default function ChampionshipDetailScreen({ route }) {
  const { id } = route.params;
  const { usuario } = useContext(AuthContext);
  const esAdmin = usuario?.rol === ROLES.ADMIN;
  const puedeCargarResultados = usuario?.rol === ROLES.ADMIN || usuario?.rol === ROLES.ENTRENADOR;

  const [campeonato, setCampeonato] = useState(null);
  const [activeTab, setActiveTab] = useState('equipos');
  const [selectedTeam, setSelectedTeam] = useState(null);

  const [teamModalVisible, setTeamModalVisible] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamColor, setTeamColor] = useState('#FF0000');
  const [coachName, setCoachName] = useState('');

  const [playerModalVisible, setPlayerModalVisible] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [playerNumber, setPlayerNumber] = useState('');
  const [playerPosition, setPlayerPosition] = useState('');

  const [groupsModalVisible, setGroupsModalVisible] = useState(false);
  const [groupsName, setGroupsName] = useState('Fase de grupos');
  const [groupsCount, setGroupsCount] = useState('2');

  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [resultContext, setResultContext] = useState(null);
  const [golesLocal, setGolesLocal] = useState('');
  const [golesVisitante, setGolesVisitante] = useState('');

  useEffect(() => {
    loadChampionship();
  }, []);

  async function loadChampionship() {
    try {
      const data = await obtenerCampeonatoId(id);
      setCampeonato(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar el campeonato');
    }
  }

  async function handleAddTeam() {
    if (!teamName || !coachName) {
      return Alert.alert('Error', 'Nombre y entrenador son requeridos');
    }

    try {
      await agregarEquipoACampeonato(id, {
        nombre: teamName,
        color: teamColor,
        entrenador: coachName
      });
      setTeamModalVisible(false);
      setTeamName('');
      setCoachName('');
      loadChampionship();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  }

  async function handleAddPlayer() {
    if (!selectedTeam || !playerName || !playerNumber || !playerPosition) {
      return Alert.alert('Error', 'Completa todos los campos');
    }

    try {
      await agregarJugadorAEquipo(id, selectedTeam.id, {
        nombre: playerName,
        numero: playerNumber,
        posicion: playerPosition
      });
      setPlayerModalVisible(false);
      setPlayerName('');
      setPlayerNumber('');
      setPlayerPosition('');
      loadChampionship();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  }

  async function handleRemoveTeam(teamId) {
    Alert.alert('Confirmar', '¿Eliminar este equipo?', [
      { text: 'Cancelar' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await eliminarEquipoDeCampeonato(id, teamId);
            if (selectedTeam?.id === teamId) setSelectedTeam(null);
            loadChampionship();
          } catch (error) {
            Alert.alert('Error', error.message);
          }
        }
      }
    ]);
  }

  async function handleRemovePlayer(teamId, playerId) {
    Alert.alert('Confirmar', '¿Eliminar este jugador?', [
      { text: 'Cancelar' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await eliminarJugadorDeEquipo(id, teamId, playerId);
            loadChampionship();
          } catch (error) {
            Alert.alert('Error', error.message);
          }
        }
      }
    ]);
  }

  async function handleCreateGroups() {
    if (!groupsCount) return Alert.alert('Error', 'Cantidad de grupos requerida');
    try {
      await crearFaseGrupos(id, { nombre: groupsName, cantidadGrupos: groupsCount });
      setGroupsModalVisible(false);
      loadChampionship();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  }

  async function handleCreateEliminatorias() {
    try {
      await crearEliminatorias(id, { nombre: 'Eliminatorias' });
      loadChampionship();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  }

  function openResultModal(contexto) {
    setResultContext(contexto);
    setGolesLocal(contexto.partido.golesLocal !== null && contexto.partido.golesLocal !== undefined ? String(contexto.partido.golesLocal) : '');
    setGolesVisitante(contexto.partido.golesVisitante !== null && contexto.partido.golesVisitante !== undefined ? String(contexto.partido.golesVisitante) : '');
    setResultModalVisible(true);
  }

  async function handleSaveResult() {
    if (!resultContext) return;
    if (golesLocal === '' || golesVisitante === '') return;

    try {
      if (resultContext.tipo === 'grupos') {
        await registrarResultadoGrupo(id, resultContext.grupoId, resultContext.partido.id, {
          golesLocal,
          golesVisitante
        });
      } else {
        await registrarResultadoEliminatoria(id, resultContext.partido.id, {
          golesLocal,
          golesVisitante
        });
      }
      setResultModalVisible(false);
      setResultContext(null);
      setGolesLocal('');
      setGolesVisitante('');
      loadChampionship();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  }

  if (!campeonato) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Cargando...</Text>
      </View>
    );
  }

  const posiciones = ['Portero', 'Defensa', 'Mediocampista', 'Delantero'];
  const colors = ['#FF0000', '#0066FF', '#00AA00', '#FFAA00', '#FF00AA', '#00FFAA'];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.champName}>{campeonato.nombre}</Text>
          <Text style={styles.dates}>📅 {campeonato.fechaInicio} - {campeonato.fechaFin}</Text>
          <Text style={styles.description}>{campeonato.descripcion}</Text>
        </View>

        <View style={styles.tabs}>
          {['equipos', 'jugadores', 'grupos', 'eliminatorias'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'equipos' && `Equipos (${campeonato.equipos.length})`}
                {tab === 'jugadores' && 'Jugadores'}
                {tab === 'grupos' && 'Grupos'}
                {tab === 'eliminatorias' && 'Eliminatorias'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'equipos' && (
          <>
            {esAdmin && (
              <View style={styles.content}>
                <Boton onPress={() => setTeamModalVisible(true)}>➕ Agregar Equipo</Boton>
              </View>
            )}

            {campeonato.equipos.length > 0 ? (
              <FlatList
                scrollEnabled={false}
                data={campeonato.equipos}
                keyExtractor={item => item.id}
                renderItem={({ item: team }) => (
                  <View style={styles.teamCard}>
                    <View style={[styles.teamColorBar, { backgroundColor: team.color }]} />
                    <View style={styles.teamInfo}>
                      <Text style={styles.teamName}>{team.nombre}</Text>
                      <Text style={styles.coachName}>⚽ {team.entrenador}</Text>
                      <Text style={styles.playerCount}>{team.jugadores.length} jugadores</Text>
                    </View>
                    <View style={styles.teamActions}>
                      <TouchableOpacity
                        style={styles.smallBtn}
                        onPress={() => {
                          setSelectedTeam(team);
                          setActiveTab('jugadores');
                        }}
                      >
                        <Text style={styles.smallBtnText}>👥</Text>
                      </TouchableOpacity>
                      {esAdmin && (
                        <TouchableOpacity
                          style={[styles.smallBtn, styles.deleteSmalBtn]}
                          onPress={() => handleRemoveTeam(team.id)}
                        >
                          <Text style={styles.smallBtnText}>🗑</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}
              />
            ) : (
              <Text style={styles.emptyText}>No hay equipos agregados</Text>
            )}
          </>
        )}

        {activeTab === 'jugadores' && (
          <>
            {selectedTeam ? (
              <>
                <View style={styles.selectedTeamHeader}>
                  <TouchableOpacity onPress={() => setSelectedTeam(null)}>
                    <Text style={styles.backLink}>← Volver a equipos</Text>
                  </TouchableOpacity>
                  <Text style={styles.selectedTeamName}>{selectedTeam.nombre}</Text>
                  {esAdmin && (
                    <View style={styles.content}>
                      <Boton onPress={() => setPlayerModalVisible(true)}>➕ Agregar Jugador</Boton>
                    </View>
                  )}
                </View>

                {selectedTeam.jugadores.length > 0 ? (
                  <FlatList
                    scrollEnabled={false}
                    data={selectedTeam.jugadores}
                    keyExtractor={item => item.id}
                    renderItem={({ item: player }) => (
                      <View style={styles.playerCard}>
                        <View style={styles.playerInfo}>
                          <Text style={styles.playerNumber}>#{player.numero}</Text>
                          <View style={styles.playerDetails}>
                            <Text style={styles.playerName}>{player.nombre}</Text>
                            <Text style={styles.playerPosition}>{player.posicion}</Text>
                          </View>
                        </View>
                        {esAdmin && (
                          <TouchableOpacity onPress={() => handleRemovePlayer(selectedTeam.id, player.id)}>
                            <Text style={styles.deleteIcon}>🗑</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  />
                ) : (
                  <Text style={styles.emptyText}>No hay jugadores en este equipo</Text>
                )}
              </>
            ) : (
              <Text style={styles.emptyText}>Selecciona un equipo para ver sus jugadores</Text>
            )}
          </>
        )}

        {activeTab === 'grupos' && (
          <>
            {!campeonato.fases.grupos && esAdmin && (
              <View style={styles.content}>
                <Boton onPress={() => setGroupsModalVisible(true)}>➕ Crear fase de grupos</Boton>
              </View>
            )}

            {campeonato.fases.grupos ? (
              campeonato.fases.grupos.grupos.map(grupo => (
                <View key={grupo.id} style={styles.groupCard}>
                  <Text style={styles.groupTitle}>{grupo.nombre}</Text>

                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableCell, styles.tableTeam]}>Equipo</Text>
                    <Text style={styles.tableCell}>PJ</Text>
                    <Text style={styles.tableCell}>G</Text>
                    <Text style={styles.tableCell}>E</Text>
                    <Text style={styles.tableCell}>P</Text>
                    <Text style={styles.tableCell}>GF</Text>
                    <Text style={styles.tableCell}>GC</Text>
                    <Text style={styles.tableCell}>Pts</Text>
                  </View>
                  {grupo.equipos.map(team => (
                    <View key={team.id} style={styles.tableRow}>
                      <Text style={[styles.tableCell, styles.tableTeam]}>{team.nombre}</Text>
                      <Text style={styles.tableCell}>{team.estadisticas.jugados}</Text>
                      <Text style={styles.tableCell}>{team.estadisticas.ganados}</Text>
                      <Text style={styles.tableCell}>{team.estadisticas.empatados}</Text>
                      <Text style={styles.tableCell}>{team.estadisticas.perdidos}</Text>
                      <Text style={styles.tableCell}>{team.estadisticas.golesAFavor}</Text>
                      <Text style={styles.tableCell}>{team.estadisticas.golesEnContra}</Text>
                      <Text style={styles.tableCell}>{team.estadisticas.puntos}</Text>
                    </View>
                  ))}

                  <Text style={styles.sectionLabel}>Partidos</Text>
                  {grupo.partidos.map(partido => (
                    <View key={partido.id} style={styles.matchRow}>
                      <View style={styles.matchInfo}>
                        <Text style={styles.matchTeams}>{partido.local.nombre} vs {partido.visitante.nombre}</Text>
                        <Text style={styles.matchScore}>
                          {partido.jugado ? `${partido.golesLocal} - ${partido.golesVisitante}` : 'Sin resultado'}
                        </Text>
                      </View>
                      {puedeCargarResultados && (
                        <TouchableOpacity style={styles.matchBtn} onPress={() => openResultModal({ tipo: 'grupos', grupoId: grupo.id, partido })}>
                          <Text style={styles.matchBtnText}>{partido.jugado ? 'Editar' : 'Cargar'}</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Todavia no hay fase de grupos</Text>
            )}
          </>
        )}

        {activeTab === 'eliminatorias' && (
          <>
            {!campeonato.fases.eliminatorias && campeonato.fases.grupos && esAdmin && (
              <View style={styles.content}>
                <Boton onPress={handleCreateEliminatorias}>➕ Crear eliminatorias</Boton>
              </View>
            )}

            {campeonato.fases.eliminatorias ? (
              campeonato.fases.eliminatorias.partidos.map(partido => (
                <View key={partido.id} style={styles.matchRow}>
                  <View style={styles.matchInfo}>
                    <Text style={styles.matchTeams}>{partido.local.nombre} vs {partido.visitante.nombre}</Text>
                    <Text style={styles.matchScore}>
                      {partido.jugado ? `${partido.golesLocal} - ${partido.golesVisitante}` : 'Sin resultado'}
                    </Text>
                  </View>
                  {puedeCargarResultados && (
                    <TouchableOpacity style={styles.matchBtn} onPress={() => openResultModal({ tipo: 'eliminatorias', partido })}>
                      <Text style={styles.matchBtnText}>{partido.jugado ? 'Editar' : 'Cargar'}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Todavia no hay eliminatorias</Text>
            )}
          </>
        )}
      </ScrollView>

      <Modal visible={teamModalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <ScrollView style={styles.modal} showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>Agregar Equipo</Text>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nombre del equipo</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Equipo A"
                placeholderTextColor="#666"
                value={teamName}
                onChangeText={setTeamName}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Entrenador</Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre del entrenador"
                placeholderTextColor="#666"
                value={coachName}
                onChangeText={setCoachName}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Color del equipo</Text>
              <View style={styles.colorPicker}>
                {colors.map(color => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      teamColor === color && styles.colorOptionSelected
                    ]}
                    onPress={() => setTeamColor(color)}
                  >
                    {teamColor === color && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <Boton onPress={handleAddTeam}>Agregar</Boton>
              <View style={{ marginTop: 10 }}>
                <Boton onPress={() => setTeamModalVisible(false)}>Cancelar</Boton>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={playerModalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <ScrollView style={styles.modal} showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>Agregar Jugador</Text>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre del jugador"
                placeholderTextColor="#666"
                value={playerName}
                onChangeText={setPlayerName}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Numero de camiseta</Text>
              <TextInput
                style={styles.input}
                placeholder="1"
                placeholderTextColor="#666"
                value={playerNumber}
                onChangeText={setPlayerNumber}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Posicion</Text>
              <View style={styles.positionButtons}>
                {posiciones.map(pos => (
                  <TouchableOpacity
                    key={pos}
                    style={[styles.positionBtn, playerPosition === pos && styles.positionBtnActive]}
                    onPress={() => setPlayerPosition(pos)}
                  >
                    <Text style={[styles.positionBtnText, playerPosition === pos && styles.positionBtnTextActive]}>{pos}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <Boton onPress={handleAddPlayer}>Agregar</Boton>
              <View style={{ marginTop: 10 }}>
                <Boton onPress={() => setPlayerModalVisible(false)}>Cancelar</Boton>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={groupsModalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <ScrollView style={styles.modal} showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>Crear fase de grupos</Text>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                style={styles.input}
                placeholder="Fase de grupos"
                placeholderTextColor="#666"
                value={groupsName}
                onChangeText={setGroupsName}
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Cantidad de grupos</Text>
              <TextInput
                style={styles.input}
                placeholder="2"
                placeholderTextColor="#666"
                value={groupsCount}
                onChangeText={setGroupsCount}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.modalActions}>
              <Boton onPress={handleCreateGroups}>Crear</Boton>
              <View style={{ marginTop: 10 }}>
                <Boton onPress={() => setGroupsModalVisible(false)}>Cancelar</Boton>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={resultModalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Cargar resultado</Text>
            {resultContext && (
              <Text style={styles.modalSubtitle}>
                {resultContext.partido.local.nombre} vs {resultContext.partido.visitante.nombre}
              </Text>
            )}
            <TextInput
              style={styles.input}
              placeholder="Goles local"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={golesLocal}
              onChangeText={setGolesLocal}
            />
            <TextInput
              style={styles.input}
              placeholder="Goles visitante"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={golesVisitante}
              onChangeText={setGolesVisitante}
            />
            <View style={styles.modalActions}>
              <Boton onPress={handleSaveResult}>Guardar</Boton>
              <View style={{ marginTop: 10 }}>
                <Boton onPress={() => setResultModalVisible(false)}>Cancelar</Boton>
              </View>
            </View>
          </View>
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
  loading: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 20
  },
  header: {
    backgroundColor: '#111',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333'
  },
  champName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8
  },
  dates: {
    color: '#aaa',
    fontSize: 13,
    marginBottom: 8
  },
  description: {
    color: '#ddd',
    fontSize: 12,
    lineHeight: 16
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#111',
    borderBottomWidth: 1,
    borderBottomColor: '#333'
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    alignItems: 'center'
  },
  tabActive: {
    borderBottomColor: '#ff2d2d'
  },
  tabText: {
    color: '#aaa',
    fontSize: 12,
    fontWeight: '600'
  },
  tabTextActive: {
    color: '#ff2d2d'
  },
  content: {
    padding: 16
  },
  teamCard: {
    backgroundColor: '#111',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center'
  },
  teamColorBar: {
    width: 6,
    height: '100%'
  },
  teamInfo: {
    flex: 1,
    padding: 12
  },
  teamName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2
  },
  coachName: {
    color: '#aaa',
    fontSize: 12,
    marginBottom: 4
  },
  playerCount: {
    color: '#ff2d2d',
    fontSize: 11,
    fontWeight: '600'
  },
  teamActions: {
    flexDirection: 'row',
    paddingRight: 12,
    gap: 6
  },
  smallBtn: {
    backgroundColor: '#ff2d2d',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4
  },
  deleteSmalBtn: {
    backgroundColor: '#a00'
  },
  smallBtnText: {
    fontSize: 14
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 30,
    fontSize: 14
  },
  selectedTeamHeader: {
    backgroundColor: '#111',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333'
  },
  backLink: {
    color: '#ff2d2d',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8
  },
  selectedTeamName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12
  },
  playerCard: {
    backgroundColor: '#111',
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeftWidth: 3,
    borderLeftColor: '#ff2d2d'
  },
  playerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  playerNumber: {
    color: '#ff2d2d',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 12,
    minWidth: 35
  },
  playerDetails: {
    flex: 1
  },
  playerName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2
  },
  playerPosition: {
    color: '#aaa',
    fontSize: 11
  },
  deleteIcon: {
    fontSize: 18,
    paddingLeft: 10
  },
  groupCard: {
    backgroundColor: '#111',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    padding: 12
  },
  groupTitle: {
    color: '#fff',
    fontWeight: '700',
    marginBottom: 10
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#222'
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#111'
  },
  tableCell: {
    color: '#ccc',
    fontSize: 11,
    width: 28,
    textAlign: 'center'
  },
  tableTeam: {
    flex: 1,
    width: 'auto',
    textAlign: 'left'
  },
  sectionLabel: {
    color: '#ff2d2d',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 6
  },
  matchRow: {
    backgroundColor: '#111',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center'
  },
  matchInfo: {
    flex: 1
  },
  matchTeams: {
    color: '#fff',
    fontWeight: '700'
  },
  matchScore: {
    color: '#aaa',
    marginTop: 4
  },
  matchBtn: {
    backgroundColor: '#222',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6
  },
  matchBtnText: {
    color: '#fff',
    fontWeight: '600'
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
  modalSubtitle: {
    color: '#aaa',
    textAlign: 'center',
    marginTop: -10,
    marginBottom: 16
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
    fontSize: 14,
    marginBottom: 10
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center'
  },
  colorOptionSelected: {
    borderColor: '#fff'
  },
  checkmark: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700'
  },
  positionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  positionBtn: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center'
  },
  positionBtnActive: {
    borderColor: '#ff2d2d',
    backgroundColor: 'rgba(255,45,45,0.1)'
  },
  positionBtnText: {
    color: '#aaa',
    fontSize: 12,
    fontWeight: '600'
  },
  positionBtnTextActive: {
    color: '#ff2d2d'
  },
  modalActions: {
    marginTop: 10
  }
});import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import Boton from '../componentes/Boton';
import { obtenerCampeonatoId, agregarEquipoACampeonato, eliminarEquipoDeCampeonato, agregarJugadorAEquipo, eliminarJugadorDeEquipo } from '../servicios/campeonatos';

export default function ChampionshipDetailScreen({ route }) {
  const { id } = route.params;
  const [championship, setChampionship] = useState(null);
  const [activeTab, setActiveTab] = useState('teams'); // teams o jugadores
  const [selectedTeam, setSelectedTeam] = useState(null);
  
  // Modal para agregar equipo
  const [teamModalVisible, setTeamModalVisible] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamColor, setTeamColor] = useState('#FF0000');
  const [coachName, setCoachName] = useState('');
  
  // Modal para agregar jugador
  const [playerModalVisible, setPlayerModalVisible] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [playerNumber, setPlayerNumber] = useState('');
  const [playerPosition, setPlayerPosition] = useState('');

  useEffect(() => {
    loadChampionship();
  }, []);

  async function loadChampionship() {
    try {
      const data = await obtenerCampeonatoId(id);
      setChampionship(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar el campeonato');
    }
  }

  async function handleAddTeam() {
    if (!teamName || !coachName) {
      return Alert.alert('Error', 'Nombre y entrenador son requeridos');
    }

    try {
      await agregarEquipoACampeonato(id, {
        nombre: teamName,
        color: teamColor,
        entrenador: coachName
      });
      Alert.alert('Éxito', 'Equipo agregado');
      setTeamModalVisible(false);
      setTeamName('');
      setCoachName('');
      loadChampionship();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  }

  async function handleAddPlayer() {
    if (!selectedTeam || !playerName || !playerNumber || !playerPosition) {
      return Alert.alert('Error', 'Completa todos los campos');
    }

    try {
      await agregarJugadorAEquipo(id, selectedTeam.id, {
        nombre: playerName,
        numero: playerNumber,
        posicion: playerPosition
      });
      Alert.alert('Éxito', 'Jugador agregado');
      setPlayerModalVisible(false);
      setPlayerName('');
      setPlayerNumber('');
      setPlayerPosition('');
      loadChampionship();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  }

  async function handleRemoveTeam(teamId) {
    Alert.alert('Confirmar', '¿Eliminar este equipo?', [
      { text: 'Cancelar' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await eliminarEquipoDeCampeonato(id, teamId);
            Alert.alert('Éxito', 'Equipo eliminado');
            if (selectedTeam?.id === teamId) setSelectedTeam(null);
            loadChampionship();
          } catch (error) {
            Alert.alert('Error', error.message);
          }
        }
      }
    ]);
  }

  async function handleRemovePlayer(teamId, playerId) {
    Alert.alert('Confirmar', '¿Eliminar este jugador?', [
      { text: 'Cancelar' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await eliminarJugadorDeEquipo(id, teamId, playerId);
            Alert.alert('Éxito', 'Jugador eliminado');
            loadChampionship();
          } catch (error) {
            Alert.alert('Error', error.message);
          }
        }
      }
    ]);
  }

  if (!championship) {
    return (
      <View style={styles.container}>
        <Text style={{ color: '#fff', textAlign: 'center', marginTop: 20 }}>Cargando...</Text>
      </View>
    );
  }

  const positions = ['Portero', 'Defensa', 'Mediocampista', 'Delantero'];
  const colors = ['#FF0000', '#0066FF', '#00AA00', '#FFAA00', '#FF00AA', '#00FFAA'];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.champName}>{championship.name}</Text>
          <Text style={styles.dates}>📅 {championship.startDate} - {championship.endDate}</Text>
          <Text style={styles.description}>{championship.description}</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'teams' && styles.tabActive]}
            onPress={() => setActiveTab('teams')}
          >
            <Text style={[styles.tabText, activeTab === 'teams' && styles.tabTextActive]}>
              Equipos ({championship.teams.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'jugadores' && styles.tabActive]}
            onPress={() => setActiveTab('jugadores')}
          >
            <Text style={[styles.tabText, activeTab === 'jugadores' && styles.tabTextActive]}>
              Jugadores
            </Text>
          </TouchableOpacity>
        </View>

        {/* Contenido */}
        {activeTab === 'teams' ? (
          <>
            <View style={styles.content}>
              <Boton onPress={() => setTeamModalVisible(true)}>➕ Agregar Equipo</Boton>
            </View>

            {championship.teams.length > 0 ? (
              <FlatList
                scrollEnabled={false}
                data={championship.teams}
                keyExtractor={item => item.id}
                renderItem={({ item: team }) => (
                  <View style={styles.teamCard}>
                    <View style={[styles.teamColorBar, { backgroundColor: team.color }]} />
                    <View style={styles.teamInfo}>
                      <Text style={styles.teamName}>{team.name}</Text>
                      <Text style={styles.coachName}>⚽ {team.coach}</Text>
                      <Text style={styles.playerCount}>{team.players.length} jugadores</Text>
                    </View>
                    <View style={styles.teamActions}>
                      <TouchableOpacity
                        style={styles.smallBtn}
                        onPress={() => setSelectedTeam(team)}
                      >
                        <Text style={styles.smallBtnText}>👥</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.smallBtn, styles.deleteSmalBtn]}
                        onPress={() => handleRemoveTeam(team.id)}
                      >
                        <Text style={styles.smallBtnText}>🗑</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />
            ) : (
              <Text style={styles.emptyText}>No hay equipos agregados</Text>
            )}
          </>
        ) : (
          <>
            {selectedTeam ? (
              <>
                <View style={styles.selectedTeamHeader}>
                  <TouchableOpacity onPress={() => setSelectedTeam(null)}>
                    <Text style={styles.backLink}>← Volver a equipos</Text>
                  </TouchableOpacity>
                  <Text style={styles.selectedTeamName}>{selectedTeam.name}</Text>
                  <View style={styles.content}>
                    <Boton onPress={() => setPlayerModalVisible(true)}>➕ Agregar Jugador</Boton>
                  </View>
                </View>

                {selectedTeam.players.length > 0 ? (
                  <FlatList
                    scrollEnabled={false}
                    data={selectedTeam.players}
                    keyExtractor={item => item.id}
                    renderItem={({ item: player }) => (
                      <View style={styles.playerCard}>
                        <View style={styles.playerInfo}>
                          <Text style={styles.playerNumber}>#{player.number}</Text>
                          <View style={styles.playerDetails}>
                            <Text style={styles.playerName}>{player.name}</Text>
                            <Text style={styles.playerPosition}>{player.position}</Text>
                          </View>
                        </View>
                        <TouchableOpacity
                          onPress={() => handleRemovePlayer(selectedTeam.id, player.id)}
                        >
                          <Text style={styles.deleteIcon}>🗑</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  />
                ) : (
                  <Text style={styles.emptyText}>No hay jugadores en este equipo</Text>
                )}
              </>
            ) : (
              <Text style={styles.emptyText}>Selecciona un equipo para ver sus jugadores</Text>
            )}
          </>
        )}
      </ScrollView>

      {/* Modal Agregar Equipo */}
      <Modal visible={teamModalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <ScrollView style={styles.modal} showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>Agregar Equipo</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Nombre del equipo</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Equipo A"
                placeholderTextColor="#666"
                value={teamName}
                onChangeText={setTeamName}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Entrenador</Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre del entrenador"
                placeholderTextColor="#666"
                value={coachName}
                onChangeText={setCoachName}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Color del equipo</Text>
              <View style={styles.colorPicker}>
                {colors.map(color => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      teamColor === color && styles.colorOptionSelected
                    ]}
                    onPress={() => setTeamColor(color)}
                  >
                    {teamColor === color && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <Boton onPress={handleAddTeam}>Agregar</Boton>
              <View style={{ marginTop: 10 }}>
                <Boton onPress={() => setTeamModalVisible(false)}>Cancelar</Boton>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal Agregar Jugador */}
      <Modal visible={playerModalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <ScrollView style={styles.modal} showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>Agregar Jugador</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre del jugador"
                placeholderTextColor="#666"
                value={playerName}
                onChangeText={setPlayerName}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Número de camiseta</Text>
              <TextInput
                style={styles.input}
                placeholder="1"
                placeholderTextColor="#666"
                value={playerNumber}
                onChangeText={setPlayerNumber}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Posición</Text>
              <View style={styles.positionButtons}>
                {positions.map(pos => (
                  <TouchableOpacity
                    key={pos}
                    style={[
                      styles.positionBtn,
                      playerPosition === pos && styles.positionBtnActive
                    ]}
                    onPress={() => setPlayerPosition(pos)}
                  >
                    <Text style={[
                      styles.positionBtnText,
                      playerPosition === pos && styles.positionBtnTextActive
                    ]}>
                      {pos}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <Boton onPress={handleAddPlayer}>Agregar</Boton>
              <View style={{ marginTop: 10 }}>
                <Boton onPress={() => setPlayerModalVisible(false)}>Cancelar</Boton>
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333'
  },
  champName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8
  },
  dates: {
    color: '#aaa',
    fontSize: 13,
    marginBottom: 8
  },
  description: {
    color: '#ddd',
    fontSize: 12,
    lineHeight: 16
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#111',
    borderBottomWidth: 1,
    borderBottomColor: '#333'
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    alignItems: 'center'
  },
  tabActive: {
    borderBottomColor: '#ff2d2d'
  },
  tabText: {
    color: '#aaa',
    fontSize: 13,
    fontWeight: '600'
  },
  tabTextActive: {
    color: '#ff2d2d'
  },
  content: {
    padding: 16
  },
  teamCard: {
    backgroundColor: '#111',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center'
  },
  teamColorBar: {
    width: 6,
    height: '100%'
  },
  teamInfo: {
    flex: 1,
    padding: 12
  },
  teamName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2
  },
  coachName: {
    color: '#aaa',
    fontSize: 12,
    marginBottom: 4
  },
  playerCount: {
    color: '#ff2d2d',
    fontSize: 11,
    fontWeight: '600'
  },
  teamActions: {
    flexDirection: 'row',
    paddingRight: 12,
    gap: 6
  },
  smallBtn: {
    backgroundColor: '#ff2d2d',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4
  },
  deleteSmalBtn: {
    backgroundColor: '#a00'
  },
  smallBtnText: {
    fontSize: 14
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 30,
    fontSize: 14
  },
  selectedTeamHeader: {
    backgroundColor: '#111',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333'
  },
  backLink: {
    color: '#ff2d2d',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8
  },
  selectedTeamName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12
  },
  playerCard: {
    backgroundColor: '#111',
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeftWidth: 3,
    borderLeftColor: '#ff2d2d'
  },
  playerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  playerNumber: {
    color: '#ff2d2d',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 12,
    minWidth: 35
  },
  playerDetails: {
    flex: 1
  },
  playerName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2
  },
  playerPosition: {
    color: '#aaa',
    fontSize: 11
  },
  deleteIcon: {
    fontSize: 18,
    paddingLeft: 10
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
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center'
  },
  colorOptionSelected: {
    borderColor: '#fff'
  },
  checkmark: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700'
  },
  positionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  positionBtn: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center'
  },
  positionBtnActive: {
    borderColor: '#ff2d2d',
    backgroundColor: 'rgba(255,45,45,0.1)'
  },
  positionBtnText: {
    color: '#aaa',
    fontSize: 12,
    fontWeight: '600'
  },
  positionBtnTextActive: {
    color: '#ff2d2d'
  },
  modalActions: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#333'
  }
});
