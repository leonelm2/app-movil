import { apiRequest } from './api';

export async function obtenerTorneos() {
  return apiRequest('/torneos');
}

export async function crearTorneo(t) {
  return apiRequest('/torneos', {
    method: 'POST',
    body: JSON.stringify(t)
  });
}

export async function actualizarTorneo(id, datos) {
  return apiRequest(`/torneos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos)
  });
}

export async function eliminarTorneo(id) {
  await apiRequest(`/torneos/${id}`, { method: 'DELETE' });
}

export async function obtenerTorneoId(id) {
  return apiRequest(`/torneos/${id}`);
}

export async function obtenerTablaTorneo(idTorneo) {
  const torneo = await obtenerTorneoId(idTorneo);
  if (!torneo) throw new Error('Torneo no encontrado');

  const equipos = torneo.equiposDetalle || [];
  const partidos = torneo.partidos || [];

  const tabla = equipos.map(team => ({
    id: team.id,
    nombre: team.nombre,
    localidad: team.localidad,
    jugados: 0,
    ganados: 0,
    empatados: 0,
    perdidos: 0,
    golesAFavor: 0,
    golesEnContra: 0,
    puntos: 0
  }));

  const statsById = new Map(tabla.map(t => [t.id, t]));

  partidos.filter(p => p.jugado).forEach(partido => {
    const local = statsById.get(partido.localId);
    const visitante = statsById.get(partido.visitanteId);
    if (!local || !visitante) return;

    local.jugados += 1;
    visitante.jugados += 1;
    local.golesAFavor += partido.golesLocal;
    local.golesEnContra += partido.golesVisitante;
    visitante.golesAFavor += partido.golesVisitante;
    visitante.golesEnContra += partido.golesLocal;

    if (partido.golesLocal > partido.golesVisitante) {
      local.ganados += 1;
      visitante.perdidos += 1;
      local.puntos += 3;
    } else if (partido.golesLocal < partido.golesVisitante) {
      visitante.ganados += 1;
      local.perdidos += 1;
      visitante.puntos += 3;
    } else {
      local.empatados += 1;
      visitante.empatados += 1;
      local.puntos += 1;
      visitante.puntos += 1;
    }
  });

  return tabla.sort((a, b) => {
    if (b.puntos !== a.puntos) return b.puntos - a.puntos;
    const aDiff = a.golesAFavor - a.golesEnContra;
    const bDiff = b.golesAFavor - b.golesEnContra;
    if (bDiff !== aDiff) return bDiff - aDiff;
    return b.golesAFavor - a.golesAFavor;
  });
}

export async function registrarResultado(idTorneo, partidoId, { golesLocal, golesVisitante }) {
  return apiRequest(`/torneos/${idTorneo}/partidos/${partidoId}`, {
    method: 'PUT',
    body: JSON.stringify({ golesLocal, golesVisitante })
  });
}

export async function forzarDatosDemo() {
  return apiRequest('/torneos/seed', { method: 'POST' });
}

export async function obtenerJugadores(idTorneo) {
  return apiRequest(`/torneos/${idTorneo}/jugadores`);
}

export async function agregarJugador(idTorneo, jugador) {
  return apiRequest(`/torneos/${idTorneo}/jugadores`, {
    method: 'POST',
    body: JSON.stringify(jugador)
  });
}


