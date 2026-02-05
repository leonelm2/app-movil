const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/app_movil';

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.error('Error MongoDB', err));

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  correo: { type: String, required: true, unique: true },
  contrasena: { type: String, required: true },
  rol: { type: String, default: 'entrenador' },
  activo: { type: Boolean, default: true },
  creadoEn: { type: Date, default: Date.now }
});

const disciplinaSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  icono: { type: String, default: '⚽' }
});

const equipoSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  jugadores: { type: Array, default: [] }
});

const torneoSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  nombre: String,
  equipos: Number,
  fecha: String,
  disciplina: String,
  estado: String,
  equiposDetalle: { type: Array, default: [] },
  partidos: { type: Array, default: [] },
  jugadores: { type: Array, default: [] }
});

const campeonatoSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  nombre: String,
  disciplinaId: String,
  fechaInicio: String,
  fechaFin: String,
  descripcion: String,
  estado: String,
  equipos: { type: Array, default: [] },
  fases: { type: Object, default: { grupos: null, eliminatorias: null } },
  creadoEn: String
});

const Usuario = mongoose.model('Usuario', usuarioSchema);
const Disciplina = mongoose.model('Disciplina', disciplinaSchema);
const Equipo = mongoose.model('Equipo', equipoSchema);
const Torneo = mongoose.model('Torneo', torneoSchema);
const Campeonato = mongoose.model('Campeonato', campeonatoSchema);

function sanitizeUsuario(usuario) {
  if (!usuario) return null;
  const obj = usuario.toObject ? usuario.toObject() : usuario;
  const { contrasena, __v, _id, ...safe } = obj;
  return { ...safe, id: String(_id) };
}

function getPasswordFields(body) {
  return {
    contrasena: body.contrasena || body['contraseña'] || '',
    contrasenaActual: body.contrasenaActual || body['contraseñaActual'] || '',
    contrasenaNueva: body.contrasenaNueva || body['contraseñaNueva'] || ''
  };
}

const plantillaBase = [
  { nombre: 'Lucas Fernandez', posicion: 'Portero' },
  { nombre: 'Sergio Molina', posicion: 'Portero' },
  { nombre: 'Nicolas Gomez', posicion: 'Defensa' },
  { nombre: 'Matias Vega', posicion: 'Defensa' },
  { nombre: 'Bruno Diaz', posicion: 'Defensa' },
  { nombre: 'Pablo Rojas', posicion: 'Defensa' },
  { nombre: 'Franco Silva', posicion: 'Mediocampista' },
  { nombre: 'Agustin Castro', posicion: 'Mediocampista' },
  { nombre: 'Diego Torres', posicion: 'Mediocampista' },
  { nombre: 'Julian Perez', posicion: 'Delantero' },
  { nombre: 'Emanuel Lopez', posicion: 'Delantero' }
];

function buildPlantel(prefijoId) {
  return plantillaBase.map((jugador, index) => ({
    id: `${prefijoId}-${index + 1}`,
    nombre: jugador.nombre,
    edad: 19 + index,
    posicion: jugador.posicion,
    nacionalidad: 'Argentina'
  }));
}

function buildJugadoresEquipo(prefijoId, equipoNombre) {
  return plantillaBase.map((jugador, index) => ({
    id: `${prefijoId}-p${index + 1}`,
    nombre: jugador.nombre,
    edad: 19 + index,
    posicion: jugador.posicion,
    equipo: equipoNombre
  }));
}

function generarFixture(equipos, resultadosIniciales = []) {
  const partidos = [];
  for (let i = 0; i < equipos.length; i += 1) {
    for (let j = i + 1; j < equipos.length; j += 1) {
      partidos.push({
        id: `m-${equipos[i].id}-${equipos[j].id}`,
        localId: equipos[i].id,
        visitanteId: equipos[j].id,
        golesLocal: null,
        golesVisitante: null,
        jugado: false
      });
    }
  }

  resultadosIniciales.forEach(resultado => {
    const match = partidos.find(p => p.localId === resultado.localId && p.visitanteId === resultado.visitanteId);
    if (match) {
      match.golesLocal = resultado.golesLocal;
      match.golesVisitante = resultado.golesVisitante;
      match.jugado = true;
    }
  });

  return partidos;
}

function baseStats() {
  return {
    jugados: 0,
    ganados: 0,
    empatados: 0,
    perdidos: 0,
    golesAFavor: 0,
    golesEnContra: 0,
    puntos: 0
  };
}

function buildGroupPhase(nombre, equipos, cantidadGrupos, resultados) {
  const grupos = [];
  const equiposPorGrupo = Math.ceil(equipos.length / cantidadGrupos);
  let indice = 0;

  for (let i = 0; i < cantidadGrupos; i += 1) {
    const slice = equipos.slice(indice, indice + equiposPorGrupo).map(t => ({
      ...t,
      estadisticas: { ...baseStats() }
    }));
    if (slice.length === 0) continue;
    const grupo = {
      id: `grupo-${i + 1}`,
      nombre: `Grupo ${String.fromCharCode(65 + i)}`,
      equipos: slice,
      partidos: generarFixture(slice)
    };
    grupos.push(grupo);
    indice += equiposPorGrupo;
  }

  resultados.forEach(resultado => {
    const grupo = grupos.find(g => g.partidos.some(p => p.localId === resultado.localId && p.visitanteId === resultado.visitanteId));
    if (!grupo) return;
    const partido = grupo.partidos.find(p => p.localId === resultado.localId && p.visitanteId === resultado.visitanteId);
    if (!partido) return;
    partido.golesLocal = resultado.golesLocal;
    partido.golesVisitante = resultado.golesVisitante;
    partido.jugado = true;
  });

  return { id: Date.now().toString(), nombre, tipo: 'grupos', cantidadGrupos, grupos };
}

function buildEliminatorias(nombre, grupos, resultados) {
  const clasificados = [];
  grupos.forEach(grupo => {
    if (grupo.equipos[0]) clasificados.push(grupo.equipos[0]);
    if (grupo.equipos[1]) clasificados.push(grupo.equipos[1]);
  });

  const partidos = [];
  if (clasificados.length >= 4) {
    partidos.push({
      id: 'elim-1',
      nombre: 'Semifinal 1',
      local: clasificados[0],
      visitante: clasificados[3],
      golesLocal: null,
      golesVisitante: null,
      jugado: false,
      resultado: null
    });
    partidos.push({
      id: 'elim-2',
      nombre: 'Semifinal 2',
      local: clasificados[1],
      visitante: clasificados[2],
      golesLocal: null,
      golesVisitante: null,
      jugado: false,
      resultado: null
    });
  } else if (clasificados.length >= 2) {
    partidos.push({
      id: 'elim-1',
      nombre: 'Final',
      local: clasificados[0],
      visitante: clasificados[1],
      golesLocal: null,
      golesVisitante: null,
      jugado: false,
      resultado: null
    });
  }

  resultados.forEach(res => {
    const match = partidos.find(p => p.id === res.matchId);
    if (!match) return;
    match.golesLocal = res.golesLocal;
    match.golesVisitante = res.golesVisitante;
    match.jugado = true;
    match.resultado = match.golesLocal > match.golesVisitante ? 'local' : match.golesLocal < match.golesVisitante ? 'visitante' : 'empate';
  });

  return { id: Date.now().toString(), nombre, formato: partidos.length > 1 ? 'semifinales' : 'final', partidos };
}

async function ensureDisciplinas() {
  const count = await Disciplina.countDocuments();
  if (count > 0) return;
  await Disciplina.insertMany([
    { id: 'd1', nombre: 'Futbol', icono: '⚽' },
    { id: 'd2', nombre: 'Voleibol', icono: '🏐' },
    { id: 'd3', nombre: 'Basquetbol', icono: '🏀' }
  ]);
}

async function ensureEquipos() {
  const count = await Equipo.countDocuments();
  if (count > 0) return;
  await Equipo.insertMany([
    { id: 'eq-alianza', nombre: 'Alianza', jugadores: buildPlantel('eq-ali') },
    { id: 'eq-desamparados', nombre: 'Desamparados', jugadores: buildPlantel('eq-des') },
    { id: 'eq-san-martin', nombre: 'San Martin', jugadores: buildPlantel('eq-sm') },
    { id: 'eq-union', nombre: 'Union', jugadores: buildPlantel('eq-uni') },
    { id: 'eq-santo-domingo', nombre: 'Santo Domingo', jugadores: buildPlantel('eq-sd') }
  ]);
}

async function ensureTorneos() {
  const count = await Torneo.countDocuments();
  if (count > 0) return;

  const torneoUnoEquipos = [
    { id: 't1-e1', nombre: 'Club San Juan Norte', localidad: 'Capital' },
    { id: 't1-e2', nombre: 'Club Rawson', localidad: 'Rawson' },
    { id: 't1-e3', nombre: 'Club Rivadavia', localidad: 'Rivadavia' },
    { id: 't1-e4', nombre: 'Club Chimbas', localidad: 'Chimbas' }
  ];

  const torneoDosEquipos = [
    { id: 't2-e1', nombre: 'Club Pocito', localidad: 'Pocito' },
    { id: 't2-e2', nombre: 'Club Caucete', localidad: 'Caucete' },
    { id: 't2-e3', nombre: 'Club Albardon', localidad: 'Albardon' },
    { id: 't2-e4', nombre: 'Club Zonda', localidad: 'Zonda' }
  ];

  const torneoUno = {
    id: 't1',
    nombre: 'Liga Sanjuanina Apertura',
    equipos: torneoUnoEquipos.length,
    fecha: '2026-03-15',
    disciplina: 'futbol',
    estado: 'En curso',
    equiposDetalle: torneoUnoEquipos,
    partidos: generarFixture(torneoUnoEquipos, [
      { localId: 't1-e1', visitanteId: 't1-e2', golesLocal: 2, golesVisitante: 1 },
      { localId: 't1-e3', visitanteId: 't1-e4', golesLocal: 0, golesVisitante: 0 },
      { localId: 't1-e2', visitanteId: 't1-e3', golesLocal: 1, golesVisitante: 3 }
    ]),
    jugadores: [
      ...buildJugadoresEquipo('t1-e1', 'Club San Juan Norte'),
      ...buildJugadoresEquipo('t1-e2', 'Club Rawson'),
      ...buildJugadoresEquipo('t1-e3', 'Club Rivadavia'),
      ...buildJugadoresEquipo('t1-e4', 'Club Chimbas')
    ]
  };

  const torneoDos = {
    id: 't2',
    nombre: 'Copa Valle de Tulum',
    equipos: torneoDosEquipos.length,
    fecha: '2026-04-01',
    disciplina: 'futbol',
    estado: 'En curso',
    equiposDetalle: torneoDosEquipos,
    partidos: generarFixture(torneoDosEquipos, [
      { localId: 't2-e1', visitanteId: 't2-e2', golesLocal: 1, golesVisitante: 1 },
      { localId: 't2-e3', visitanteId: 't2-e4', golesLocal: 2, golesVisitante: 0 }
    ]),
    jugadores: [
      ...buildJugadoresEquipo('t2-e1', 'Club Pocito'),
      ...buildJugadoresEquipo('t2-e2', 'Club Caucete'),
      ...buildJugadoresEquipo('t2-e3', 'Club Albardon'),
      ...buildJugadoresEquipo('t2-e4', 'Club Zonda')
    ]
  };

  await Torneo.insertMany([torneoUno, torneoDos]);
}

async function resetTorneos() {
  await Torneo.deleteMany({});
  await ensureTorneos();
}

async function ensureCampeonatos() {
  const count = await Campeonato.countDocuments();
  if (count > 0) return;

  const equiposA = [
    { id: 'c1-e1', nombre: 'Club Alianza', color: '#ff2d2d', entrenador: 'DT: Carlos Vega', jugadores: [], estadisticas: baseStats() },
    { id: 'c1-e2', nombre: 'Club Desamparados', color: '#0066ff', entrenador: 'DT: Mateo Luna', jugadores: [], estadisticas: baseStats() },
    { id: 'c1-e3', nombre: 'Club San Martin', color: '#00aa00', entrenador: 'DT: Diego Rojas', jugadores: [], estadisticas: baseStats() },
    { id: 'c1-e4', nombre: 'Club Union', color: '#ffaa00', entrenador: 'DT: Leo Silva', jugadores: [], estadisticas: baseStats() }
  ];

  const equiposB = [
    { id: 'c2-e1', nombre: 'Club Santo Domingo', color: '#ff2d2d', entrenador: 'DT: Andres Soto', jugadores: [], estadisticas: baseStats() },
    { id: 'c2-e2', nombre: 'Club Rivadavia', color: '#0066ff', entrenador: 'DT: Franco Diaz', jugadores: [], estadisticas: baseStats() },
    { id: 'c2-e3', nombre: 'Club Rawson', color: '#00aa00', entrenador: 'DT: Julian Perez', jugadores: [], estadisticas: baseStats() },
    { id: 'c2-e4', nombre: 'Club Chimbas', color: '#ffaa00', entrenador: 'DT: Nicolas Gomez', jugadores: [], estadisticas: baseStats() }
  ];

  const gruposA = buildGroupPhase('Fase de Grupos', equiposA, 2, [
    { localId: 'c1-e1', visitanteId: 'c1-e2', golesLocal: 2, golesVisitante: 1 },
    { localId: 'c1-e3', visitanteId: 'c1-e4', golesLocal: 1, golesVisitante: 1 }
  ]);

  const gruposB = buildGroupPhase('Fase de Grupos', equiposB, 2, [
    { localId: 'c2-e1', visitanteId: 'c2-e2', golesLocal: 0, golesVisitante: 2 },
    { localId: 'c2-e3', visitanteId: 'c2-e4', golesLocal: 3, golesVisitante: 2 }
  ]);

  const eliminatoriasA = buildEliminatorias('Eliminatorias', gruposA.grupos, [
    { matchId: 'elim-1', golesLocal: 2, golesVisitante: 0 },
    { matchId: 'elim-2', golesLocal: 1, golesVisitante: 1 }
  ]);

  await Campeonato.insertMany([
    {
      id: 'c1',
      nombre: 'Campeonato San Juan Apertura',
      disciplinaId: 'd1',
      fechaInicio: '2026-03-01',
      fechaFin: '2026-06-15',
      descripcion: 'Campeonato con equipos de la provincia de San Juan.',
      estado: 'En curso',
      equipos: equiposA,
      fases: { grupos: gruposA, eliminatorias: eliminatoriasA },
      creadoEn: new Date().toISOString()
    },
    {
      id: 'c2',
      nombre: 'Copa San Juan Clausura',
      disciplinaId: 'd1',
      fechaInicio: '2026-08-01',
      fechaFin: '2026-11-20',
      descripcion: 'Segunda parte del calendario provincial.',
      estado: 'En preparación',
      equipos: equiposB,
      fases: { grupos: gruposB, eliminatorias: null },
      creadoEn: new Date().toISOString()
    }
  ]);
}

app.post('/api/auth/register', async (req, res) => {
  try {
    const { nombre, correo, rol } = req.body;
    const { contrasena } = getPasswordFields(req.body);
    if (!nombre || !correo || !contrasena) {
      return res.status(400).json({ message: 'Completa todos los campos' });
    }

    const existente = await Usuario.findOne({ correo });
    if (existente) {
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }

    const nuevo = await Usuario.create({ nombre, correo, contrasena, rol, activo: true });
    return res.json(sanitizeUsuario(nuevo));
  } catch (error) {
    return res.status(500).json({ message: 'Error al registrar' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { correo } = req.body;
    const { contrasena } = getPasswordFields(req.body);
    const usuario = await Usuario.findOne({ correo });
    if (!usuario) return res.status(404).json({ message: 'El usuario no existe' });
    if (!usuario.activo) return res.status(403).json({ message: 'Usuario desactivado' });
    if (usuario.contrasena !== contrasena) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }
    return res.json(sanitizeUsuario(usuario));
  } catch (error) {
    return res.status(500).json({ message: 'Error al iniciar sesión' });
  }
});

app.post('/api/auth/change-password', async (req, res) => {
  try {
    const { correo } = req.body;
    const { contrasenaActual, contrasenaNueva } = getPasswordFields(req.body);
    const usuario = await Usuario.findOne({ correo });
    if (!usuario) return res.status(404).json({ message: 'El usuario no existe' });
    if (usuario.contrasena !== contrasenaActual) {
      return res.status(400).json({ message: 'Contraseña actual incorrecta' });
    }
    usuario.contrasena = contrasenaNueva;
    await usuario.save();
    return res.json(sanitizeUsuario(usuario));
  } catch (error) {
    return res.status(500).json({ message: 'Error al cambiar la contraseña' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const usuarios = await Usuario.find({});
    return res.json(usuarios.map(sanitizeUsuario));
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener usuarios' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { nombre, correo, rol, activo } = req.body;
    const { contrasena } = getPasswordFields(req.body);
    if (!nombre || !correo || !contrasena) {
      return res.status(400).json({ message: 'Nombre y correo son requeridos' });
    }
    const existe = await Usuario.findOne({ correo });
    if (existe) {
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }
    const nuevo = await Usuario.create({ nombre, correo, contrasena, rol, activo: activo !== false });
    return res.json(sanitizeUsuario(nuevo));
  } catch (error) {
    return res.status(500).json({ message: 'Error al crear usuario' });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, correo, rol, activo } = req.body;
    const update = { nombre, correo, rol, activo };
    const { contrasena } = getPasswordFields(req.body);
    if (contrasena) update.contrasena = contrasena;

    const usuario = await Usuario.findByIdAndUpdate(id, update, { new: true });
    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });
    return res.json(sanitizeUsuario(usuario));
  } catch (error) {
    return res.status(500).json({ message: 'Error al actualizar usuario' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const eliminado = await Usuario.findByIdAndDelete(id);
    if (!eliminado) return res.status(404).json({ message: 'Usuario no encontrado' });
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ message: 'Error al eliminar usuario' });
  }
});

app.get('/api/disciplinas', async (req, res) => {
  try {
    await ensureDisciplinas();
    const data = await Disciplina.find({});
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener disciplinas' });
  }
});

app.post('/api/disciplinas', async (req, res) => {
  try {
    const { nombre, icono } = req.body;
    if (!nombre) return res.status(400).json({ message: 'Nombre requerido' });
    const nueva = await Disciplina.create({ id: Date.now().toString(), nombre, icono: icono || '⚽' });
    return res.json(nueva);
  } catch (error) {
    return res.status(500).json({ message: 'Error al crear disciplina' });
  }
});

app.delete('/api/disciplinas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Disciplina.deleteOne({ id });
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ message: 'Error al eliminar disciplina' });
  }
});

app.get('/api/equipos', async (req, res) => {
  try {
    await ensureEquipos();
    const data = await Equipo.find({});
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener equipos' });
  }
});

app.get('/api/equipos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const equipo = await Equipo.findOne({ id });
    if (!equipo) return res.status(404).json({ message: 'Equipo no encontrado' });
    return res.json(equipo);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener equipo' });
  }
});

app.post('/api/equipos', async (req, res) => {
  try {
    const nombre = String(req.body.nombre || '').trim();
    if (!nombre) return res.status(400).json({ message: 'Nombre requerido' });
    const id = `eq-${Date.now()}`;
    const nuevo = await Equipo.create({ id, nombre, jugadores: buildPlantel(id) });
    return res.json(nuevo);
  } catch (error) {
    return res.status(500).json({ message: 'Error al crear equipo' });
  }
});

app.get('/api/torneos', async (req, res) => {
  try {
    await ensureTorneos();
    const data = await Torneo.find({});
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener torneos' });
  }
});

app.get('/api/torneos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const torneo = await Torneo.findOne({ id });
    if (!torneo) return res.status(404).json({ message: 'Torneo no encontrado' });
    return res.json(torneo);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener torneo' });
  }
});

app.post('/api/torneos', async (req, res) => {
  try {
    const id = Date.now().toString();
    const nuevo = await Torneo.create({ id, equiposDetalle: [], partidos: [], jugadores: [], ...req.body });
    return res.json(nuevo);
  } catch (error) {
    return res.status(500).json({ message: 'Error al crear torneo' });
  }
});

app.post('/api/torneos/seed', async (req, res) => {
  try {
    await resetTorneos();
    const data = await Torneo.find({});
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ message: 'Error al resetear torneos' });
  }
});

app.put('/api/torneos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const actualizado = await Torneo.findOneAndUpdate({ id }, req.body, { new: true });
    if (!actualizado) return res.status(404).json({ message: 'Torneo no encontrado' });
    return res.json(actualizado);
  } catch (error) {
    return res.status(500).json({ message: 'Error al actualizar torneo' });
  }
});

app.delete('/api/torneos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Torneo.deleteOne({ id });
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ message: 'Error al eliminar torneo' });
  }
});

app.get('/api/torneos/:id/jugadores', async (req, res) => {
  try {
    const { id } = req.params;
    const torneo = await Torneo.findOne({ id });
    if (!torneo) return res.status(404).json({ message: 'Torneo no encontrado' });
    return res.json(torneo.jugadores || []);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener jugadores' });
  }
});

app.post('/api/torneos/:id/jugadores', async (req, res) => {
  try {
    const { id } = req.params;
    const torneo = await Torneo.findOne({ id });
    if (!torneo) return res.status(404).json({ message: 'Torneo no encontrado' });
    torneo.jugadores = torneo.jugadores || [];
    const nuevo = { id: Date.now().toString(), ...req.body };
    torneo.jugadores.push(nuevo);
    await torneo.save();
    return res.json(torneo.jugadores);
  } catch (error) {
    return res.status(500).json({ message: 'Error al agregar jugador' });
  }
});

app.put('/api/torneos/:id/partidos/:partidoId', async (req, res) => {
  try {
    const { id, partidoId } = req.params;
    const { golesLocal, golesVisitante } = req.body;
    const torneo = await Torneo.findOne({ id });
    if (!torneo) return res.status(404).json({ message: 'Torneo no encontrado' });
    const partidos = torneo.partidos || [];
    const match = partidos.find(p => p.id === partidoId);
    if (!match) return res.status(404).json({ message: 'Partido no encontrado' });
    match.golesLocal = parseInt(golesLocal, 10);
    match.golesVisitante = parseInt(golesVisitante, 10);
    match.jugado = true;
    torneo.partidos = partidos;
    await torneo.save();
    return res.json(match);
  } catch (error) {
    return res.status(500).json({ message: 'Error al actualizar resultado' });
  }
});

app.get('/api/campeonatos', async (req, res) => {
  try {
    await ensureCampeonatos();
    const data = await Campeonato.find({});
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener campeonatos' });
  }
});

app.get('/api/campeonatos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const campeonato = await Campeonato.findOne({ id });
    if (!campeonato) return res.status(404).json({ message: 'Campeonato no encontrado' });
    return res.json(campeonato);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener campeonato' });
  }
});

app.post('/api/campeonatos', async (req, res) => {
  try {
    const id = Date.now().toString();
    const nuevo = await Campeonato.create({ id, creadoEn: new Date().toISOString(), ...req.body });
    return res.json(nuevo);
  } catch (error) {
    return res.status(500).json({ message: 'Error al crear campeonato' });
  }
});

app.put('/api/campeonatos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const actualizado = await Campeonato.findOneAndUpdate({ id }, req.body, { new: true });
    if (!actualizado) return res.status(404).json({ message: 'Campeonato no encontrado' });
    return res.json(actualizado);
  } catch (error) {
    return res.status(500).json({ message: 'Error al actualizar campeonato' });
  }
});

app.delete('/api/campeonatos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Campeonato.deleteOne({ id });
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ message: 'Error al eliminar campeonato' });
  }
});

app.listen(PORT, () => console.log(`API escuchando en ${PORT}`));
