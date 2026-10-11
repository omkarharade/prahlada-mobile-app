import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HistoryScreen from '../screens/HistoryScreen';
import HomeScreen from '../screens/HomeScreen';
import { icons } from '../constants/icons';

export type RootTabParamList = {
  Home: undefined;
  History: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function AppNavigator() {

  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#C72F5D',
          tabBarInactiveTintColor: '#756F67',
          tabBarStyle: {
            backgroundColor: '#F4EFF2',
            borderTopColor: '#E8E0E5',
            height: 68,
            paddingBottom: 8,
            paddingTop: 6,
          },
          tabBarLabelStyle: { fontSize: 13, fontWeight: '600' },
        }}>
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: HomeTabIcon,
          }}
        />
        <Tab.Screen
          name="History"
          component={HistoryScreen}
          options={{
            tabBarIcon: HistoryTabIcon,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

function HomeTabIcon({ color }: { color: string }) {
  return (
    <Image
      source={icons.HOME}
      style={[styles.tabIcon, { tintColor: color }]}
    />
  );
}

function HistoryTabIcon({ color }: { color: string }) {
  return (
    <Image
      source={icons.HOUR_GLASS}
      style={[styles.tabIcon, { tintColor: color }]}
    />
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    height: 24,
    width: 24,
  },
});
