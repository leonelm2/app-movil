import AsyncStorage from '@react-native-async-storage/async-storage';

const EQUIPOS_KEY = 'EQUIPOS';

const seedEquipos = [
  {
    id: 'eq-alianza',
    nombre: 'Alianza',
    jugadores: [
      { id: 'eq-ali-1', nombre: 'Matias Pereyra', edad: 22, posicion: 'Delantero', nacionalidad: 'Argentina' },
      { id: 'eq-ali-2', nombre: 'Bruno Torres', edad: 24, posicion: 'Mediocampista', nacionalidad: 'Argentina' },
      { id: 'eq-ali-3', nombre: 'Lautaro Soria', edad: 23, posicion: 'Defensa', nacionalidad: 'Argentina' }
    ]
  },
  {
    id: 'eq-desamparados',
    nombre: 'Desamparados',
    jugadores: [
      { id: 'eq-des-1', nombre: 'Nicolas Perez', edad: 25, posicion: 'Delantero', nacionalidad: 'Argentina' },
      { id: 'eq-des-2', nombre: 'Santiago Diaz', edad: 21, posicion: 'Mediocampista', nacionalidad: 'Argentina' },
      { id: 'eq-des-3', nombre: 'Gaston Molina', edad: 26, posicion: 'Defensa', nacionalidad: 'Argentina' }
    ]
  },
  {
    id: 'eq-san-martin',
    nombre: 'San Martin',
    jugadores: [
      { id: 'eq-sm-1', nombre: 'Emanuel Rojas', edad: 23, posicion: 'Delantero', nacionalidad: 'Argentina' },
      { id: 'eq-sm-2', nombre: 'Franco Silva', edad: 22, posicion: 'Mediocampista', nacionalidad: 'Argentina' },
      { id: 'eq-sm-3', nombre: 'Lucas Herrera', edad: 24, posicion: 'Portero', nacionalidad: 'Argentina' }
    ]
  },
  {
    id: 'eq-union',
    nombre: 'Union',
    jugadores: [
      { id: 'eq-uni-1', nombre: 'Agustin Castro', edad: 21, posicion: 'Delantero', nacionalidad: 'Argentina' },
      { id: 'eq-uni-2', nombre: 'Brian Luna', edad: 25, posicion: 'Mediocampista', nacionalidad: 'Argentina' },
      { id: 'eq-uni-3', nombre: 'Pablo Medina', edad: 23, posicion: 'Defensa', nacionalidad: 'Argentina' }
    ]
  },
  {
    id: 'eq-santo-domingo',
    nombre: 'Santo Domingo',
    jugadores: [
      { id: 'eq-sd-1', nombre: 'Diego Vega', edad: 24, posicion: 'Delantero', nacionalidad: 'Argentina' },
      { id: 'eq-sd-2', nombre: 'Facundo Ortiz', edad: 22, posicion: 'Mediocampista', nacionalidad: 'Argentina' },
      { id: 'eq-sd-3', nombre: 'Ivan Navarro', edad: 26, posicion: 'Defensa', nacionalidad: 'Argentina' }
    ]
  }
];

export async function obtenerEquipos() {
  const json = await AsyncStorage.getItem(EQUIPOS_KEY);
  let lista = json ? JSON.parse(json) : [];
  if (lista.length === 0) {
    lista = seedEquipos;
    await AsyncStorage.setItem(EQUIPOS_KEY, JSON.stringify(lista));
  }
  return lista;
}

export async function obtenerEquipoPorId(id) {
  const lista = await obtenerEquipos();
  return lista.find(e => e.id === id);
}
