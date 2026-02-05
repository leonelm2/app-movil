import { apiRequest } from './api';

export async function obtenerEquipos() {
  return apiRequest('/equipos');
}

export async function obtenerEquipoPorId(id) {
  return apiRequest(`/equipos/${id}`);
}

export async function crearEquipo(nombre) {
  const nombreLimpio = String(nombre || '').trim();
  if (!nombreLimpio) throw new Error('Nombre requerido');
  return apiRequest('/equipos', {
    method: 'POST',
    body: JSON.stringify({ nombre: nombreLimpio })
  });
}
