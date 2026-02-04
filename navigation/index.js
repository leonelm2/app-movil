import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import TournamentsScreen from '../screens/TournamentsScreen';
import TournamentDetailScreen from '../screens/TournamentDetailScreen';
import PlayersScreen from '../screens/PlayersScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';

import { AuthContext } from '../services/auth';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TournamentsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Torneos" component={TournamentsScreen} />
      <Stack.Screen name="DetalleTorneo" component={TournamentDetailScreen} options={{ title: 'Detalle del torneo' }} />
      <Stack.Screen name="Jugadores" component={PlayersScreen} options={{ title: 'Jugadores' }} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ color, size }) => {
        let iconName;
        if (route.name === 'Inicio') iconName = 'home';
        if (route.name === 'Torneos') iconName = 'trophy';
        if (route.name === 'Perfil') iconName = 'person';
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#ff2d2d',
      tabBarInactiveTintColor: 'gray',
      tabBarStyle: { backgroundColor: '#000' },
    })}
    >
      <Tab.Screen name="Inicio" component={HomeScreen} />
      <Tab.Screen name="Torneos" component={TournamentsStack} options={{ headerShown: false }} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigation() {
  const { user } = useContext(AuthContext);

  return (
    <NavigationContainer>
      {user ? (
        <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#000' }, headerTintColor: '#fff' }}>
          <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Cambiar contraseña' }} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Registro' }} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
