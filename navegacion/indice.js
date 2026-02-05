import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

import PantallaLogin from '../pantallas/PantallaLogin';
import PantallaRegistro from '../pantallas/PantallaRegistro';
import PantallaPrincipal from '../pantallas/PantallaPrincipal';
import PantallaTorneos from '../pantallas/PantallaTorneos';
import PantallaDetalleTorneo from '../pantallas/PantallaDetalleTorneo';
import PantallaJugadores from '../pantallas/PantallaJugadores';
import PantallaPerfil from '../pantallas/PantallaPerfil';
import PantallaCambiarContraseña from '../pantallas/PantallaCambiarContraseña';
import PantallaRegistrarJugador from '../pantallas/PantallaRegistrarJugador';
import PantallaGestionUsuarios from '../pantallas/PantallaGestionUsuarios';
import PantallaCampeonatos from '../pantallas/PantallaCampeonatos';
import PantallaDetalleCampeonato from '../pantallas/PantallaDetalleCampeonatoV2';
import PantallaEquipos from '../pantallas/PantallaEquipos';
import Logo from '../componentes/Logo';

import { AuthContext, ROLES } from '../servicios/autenticacion';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const baseHeaderOptions = {
  headerStyle: { backgroundColor: '#000', height: 110 },
  headerTintColor: '#fff',
  headerTitleAlign: 'center',
  headerTitle: () => <Logo size="header" showText={false} />
};

const getHeaderOptions = (navigation) => ({
  ...baseHeaderOptions,
  headerLeft: () => (
    <TouchableOpacity
      onPress={() => {
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.navigate('Inicio');
        }
      }}
      style={{ paddingHorizontal: 12, paddingVertical: 6 }}
    >
      <Ionicons name="chevron-back" size={22} color="#fff" />
    </TouchableOpacity>
  )
});

function TournamentsStack() {
  return (
    <Stack.Navigator screenOptions={({ navigation }) => getHeaderOptions(navigation)}>
      <Stack.Screen 
        name="TournamentsTab" 
        component={PantallaTorneos}
        options={{ title: 'Torneos' }}
      />
      <Stack.Screen 
        name="DetalleTorneo" 
        component={PantallaDetalleTorneo} 
        options={{ title: 'Detalle del torneo' }} 
      />
      <Stack.Screen 
        name="Jugadores" 
        component={PantallaJugadores} 
        options={{ title: 'Jugadores' }} 
      />
    </Stack.Navigator>
  );
}

function ChampionshipsStack() {
  return (
    <Stack.Navigator screenOptions={({ navigation }) => getHeaderOptions(navigation)}>
      <Stack.Screen 
        name="ChampionshipsTab" 
        component={PantallaCampeonatos}
        options={{ title: 'Campeonatos' }}
      />
      <Stack.Screen 
        name="ChampionshipDetail" 
        component={PantallaDetalleCampeonato} 
        options={{ title: 'Detalles del Campeonato' }} 
      />
    </Stack.Navigator>
  );
}

// Pestañas para Administrador
function AdminTabs() {
  return (
    <Tab.Navigator 
      screenOptions={({ route, navigation }) => ({
        headerShown: true,
        ...getHeaderOptions(navigation),
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Inicio') iconName = 'home';
          if (route.name === 'Usuarios') iconName = 'people';
          if (route.name === 'Campeonatos') iconName = 'trophy';
          if (route.name === 'Equipos') iconName = 'shield';
          if (route.name === 'Perfil') iconName = 'person';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#ff2d2d',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { backgroundColor: '#000', borderTopColor: '#333' },
      })}
    >
      <Tab.Screen name="Inicio" component={PantallaPrincipal} />
      <Tab.Screen name="Campeonatos" component={ChampionshipsStack} options={{ headerShown: false }} />
      <Tab.Screen name="Equipos" component={PantallaEquipos} />
      <Tab.Screen name="Usuarios" component={PantallaGestionUsuarios} />
      <Tab.Screen name="Perfil" component={PantallaPerfil} />
    </Tab.Navigator>
  );
}

// Pestañas para Entrenador y Coordinador
function MainTabs() {
  return (
    <Tab.Navigator 
      screenOptions={({ route, navigation }) => ({
        headerShown: true,
        ...getHeaderOptions(navigation),
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Inicio') iconName = 'home';
          if (route.name === 'Campeonatos') iconName = 'trophy';
          if (route.name === 'Torneos') iconName = 'medal';
          if (route.name === 'Equipos') iconName = 'shield';
          if (route.name === 'Perfil') iconName = 'person';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#ff2d2d',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { backgroundColor: '#000', borderTopColor: '#333' },
      })}
    >
      <Tab.Screen name="Inicio" component={PantallaPrincipal} />
      <Tab.Screen name="Campeonatos" component={ChampionshipsStack} options={{ headerShown: false }} />
      <Tab.Screen name="Torneos" component={TournamentsStack} options={{ headerShown: false }} />
      <Tab.Screen name="Equipos" component={PantallaEquipos} />
      <Tab.Screen name="Perfil" component={PantallaPerfil} />
    </Tab.Navigator>
  );
}

export default function AppNavigation() {
  const { usuario } = useContext(AuthContext);

  return (
    <NavigationContainer>
      {usuario ? (
        <Stack.Navigator screenOptions={({ navigation }) => getHeaderOptions(navigation)}>
          {usuario.rol === ROLES.ADMIN ? (
            <Stack.Screen 
              name="AdminMain" 
              component={AdminTabs} 
              options={{ headerShown: false }} 
            />
          ) : (
            <Stack.Screen 
              name="Main" 
              component={MainTabs} 
              options={{ headerShown: false }} 
            />
          )}
          
          <Stack.Screen 
            name="ChangePassword" 
            component={PantallaCambiarContraseña} 
            options={{ title: 'Cambiar contraseña' }} 
          />
          <Stack.Screen 
            name="RegistrarJugador" 
            component={PantallaRegistrarJugador}
            options={{ title: 'Registrar Jugador' }}
          />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator screenOptions={({ navigation }) => getHeaderOptions(navigation)}>
          <Stack.Screen
            name="Login"
            component={PantallaLogin}
            options={{ headerLeft: () => null, title: ' ' }}
          />
          <Stack.Screen
            name="Register"
            component={PantallaRegistro}
            options={{ headerLeft: () => null, title: 'Registro' }}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
