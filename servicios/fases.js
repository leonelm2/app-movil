import { obtenerCampeonatoId, actualizarCampeonato } from './campeonatos';

export async function crearFaseGrupos(idCampeonato, { nombre, cantidadGrupos }) {
  const campeonato = await obtenerCampeonatoId(idCampeonato);
  if (!campeonato) throw new Error('Campeonato no encontrado');

  const equipos = campeonato.equipos || [];
  if (equipos.length === 0) throw new Error('No hay equipos para crear grupos');

  const grupos = [];
  const equiposPorGrupo = Math.ceil(equipos.length / cantidadGrupos);
  let indice = 0;

  for (let i = 0; i < cantidadGrupos; i += 1) {
    const slice = equipos.slice(indice, indice + equiposPorGrupo).map(t => ({
      ...t,
      estadisticas: {
        jugados: 0,
        ganados: 0,
        empatados: 0,
        perdidos: 0,
        golesAFavor: 0,
        golesEnContra: 0,
        puntos: 0
      }
    }));
    if (slice.length === 0) continue;

    grupos.push({
      id: `grupo-${i + 1}`,
      nombre: `Grupo ${String.fromCharCode(65 + i)}`,
      equipos: slice,
      partidos: generarFixture(slice)
    });
    indice += equiposPorGrupo;
  }

  const faseGrupos = {
    id: Date.now().toString(),
    nombre,
    tipo: 'grupos',
    cantidadGrupos: parseInt(cantidadGrupos, 10),
    grupos,
    jornadaActual: 1,
    estado: 'En curso'
  };

  campeonato.fases.grupos = faseGrupos;
  await actualizarCampeonato(idCampeonato, { fases: campeonato.fases });
  return faseGrupos;
}

export async function registrarResultadoGrupo(idCampeonato, idGrupo, idPartido, { golesLocal, golesVisitante }) {
  const campeonato = await obtenerCampeonatoId(idCampeonato);
  if (!campeonato) throw new Error('Campeonato no encontrado');

  const grupos = campeonato.fases.grupos?.grupos || [];
  const grupo = grupos.find(g => g.id === idGrupo);
  if (!grupo) throw new Error('Grupo no encontrado');

  const partido = grupo.partidos.find(p => p.id === idPartido);
  if (!partido) throw new Error('Partido no encontrado');

  partido.golesLocal = parseInt(golesLocal, 10);
  partido.golesVisitante = parseInt(golesVisitante, 10);
  partido.jugado = true;
  partido.resultado = partido.golesLocal > partido.golesVisitante ? 'local' : partido.golesLocal < partido.golesVisitante ? 'visitante' : 'empate';

  actualizarEstadisticas(grupo, partido);
  ordenarTabla(grupo);

  await actualizarCampeonato(idCampeonato, { fases: campeonato.fases });
  return partido;
}

export async function crearEliminatorias(idCampeonato, { nombre }) {
  const campeonato = await obtenerCampeonatoId(idCampeonato);
  if (!campeonato) throw new Error('Campeonato no encontrado');
  const grupos = campeonato.fases.grupos?.grupos || [];
  if (grupos.length === 0) throw new Error('Primero crea la fase de grupos');

  const clasificados = [];
  grupos.forEach(grupo => {
    ordenarTabla(grupo);
    if (grupo.equipos[0]) clasificados.push(grupo.equipos[0]);
    if (grupo.equipos[1]) clasificados.push(grupo.equipos[1]);
  });

  if (clasificados.length < 2) throw new Error('No hay suficientes equipos');

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
  } else {
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

  const eliminatorias = {
    id: Date.now().toString(),
    nombre,
    formato: clasificados.length >= 4 ? 'semifinales' : 'final',
    partidos
  };

  campeonato.fases.eliminatorias = eliminatorias;
  await actualizarCampeonato(idCampeonato, { fases: campeonato.fases });
  return eliminatorias;
}

export async function registrarResultadoEliminatoria(idCampeonato, idPartido, { golesLocal, golesVisitante }) {
  const campeonato = await obtenerCampeonatoId(idCampeonato);
  if (!campeonato) throw new Error('Campeonato no encontrado');

  const partidos = campeonato.fases.eliminatorias?.partidos || [];
  const partido = partidos.find(p => p.id === idPartido);
  if (!partido) throw new Error('Partido no encontrado');

  partido.golesLocal = parseInt(golesLocal, 10);
  partido.golesVisitante = parseInt(golesVisitante, 10);
  partido.jugado = true;
  partido.resultado = partido.golesLocal > partido.golesVisitante ? 'local' : partido.golesLocal < partido.golesVisitante ? 'visitante' : 'empate';

  await actualizarCampeonato(idCampeonato, { fases: campeonato.fases });
  return partido;
}

export async function obtenerTablaGrupo(idCampeonato, idGrupo) {
  const campeonato = await obtenerCampeonatoId(idCampeonato);
  if (!campeonato) throw new Error('Campeonato no encontrado');

  const grupo = campeonato.fases.grupos?.grupos?.find(g => g.id === idGrupo);
  if (!grupo) throw new Error('Grupo no encontrado');

  ordenarTabla(grupo);
  return grupo.equipos;
}

function generarFixture(equipos) {
  const partidos = [];
  for (let i = 0; i < equipos.length; i += 1) {
    for (let j = i + 1; j < equipos.length; j += 1) {
      partidos.push({
        id: `partido-${equipos[i].id}-${equipos[j].id}`,
        local: equipos[i],
        visitante: equipos[j],
        golesLocal: null,
        golesVisitante: null,
        resultado: null,
        jugado: false
      });
    }
  }
  return partidos;
}

function actualizarEstadisticas(grupo, partido) {
  const local = grupo.equipos.find(t => t.id === partido.local.id);
  const visitante = grupo.equipos.find(t => t.id === partido.visitante.id);
  if (!local || !visitante) return;

  local.estadisticas.jugados += 1;
  visitante.estadisticas.jugados += 1;
  local.estadisticas.golesAFavor += partido.golesLocal;
  local.estadisticas.golesEnContra += partido.golesVisitante;
  visitante.estadisticas.golesAFavor += partido.golesVisitante;
  visitante.estadisticas.golesEnContra += partido.golesLocal;

  if (partido.resultado === 'local') {
    local.estadisticas.ganados += 1;
    visitante.estadisticas.perdidos += 1;
    local.estadisticas.puntos += 3;
  } else if (partido.resultado === 'visitante') {
    visitante.estadisticas.ganados += 1;
    local.estadisticas.perdidos += 1;
    visitante.estadisticas.puntos += 3;
  } else {
    local.estadisticas.empatados += 1;
    visitante.estadisticas.empatados += 1;
    local.estadisticas.puntos += 1;
    visitante.estadisticas.puntos += 1;
  }
}

function ordenarTabla(grupo) {
  grupo.equipos.sort((a, b) => {
    if (b.estadisticas.puntos !== a.estadisticas.puntos) {
      return b.estadisticas.puntos - a.estadisticas.puntos;
    }
    const diffA = a.estadisticas.golesAFavor - a.estadisticas.golesEnContra;
    const diffB = b.estadisticas.golesAFavor - b.estadisticas.golesEnContra;
    if (diffB !== diffA) return diffB - diffA;
    return b.estadisticas.golesAFavor - a.estadisticas.golesAFavor;
  });
}
