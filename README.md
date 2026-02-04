# TorneosApp (Trabajo práctico - Desarrollo de Aplicativos)

Aplicación móvil de ejemplo para crear y gestionar torneos de fútbol.

Características implementadas:
- Autenticación local: registro, login, logout, cambio de contraseña (almacenamiento con AsyncStorage)
- Gestión de torneos: crear, listar, ver detalle
- Gestión de jugadores asociados a torneos: listar y agregar jugadores
- Navegación con React Navigation (Stack + Tabs)
- Estilo con colores rojo y negro, inputs y botones estilizados
- Mensajes de error y éxito mediante Alert

Estructura principal:
- `screens/` - pantallas
- `components/` - componentes reutilizables (Input, Button)
- `navigation/` - configuración de navegación
- `services/` - lógica de persistencia (auth, tournaments)

Ejecutar en Expo Go:
1. Instala dependencias: `npm install` (ya se ejecutó en este proyecto)
2. Iniciar: `npm start` o `expo start`
3. Abrir en Expo Go o en emulador

Notas:
- Esta app está pensada como proyecto académico. Para un entorno de producción habría que asegurar el almacenamiento de contraseñas, usar backend real, validaciones más completas y tests.
