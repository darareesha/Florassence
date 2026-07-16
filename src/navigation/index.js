import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { colors } from '../constants/theme';
import AuthScreen from '../screens/AuthScreen';
import ListingScreen from '../screens/ListingScreen';
import DetailsScreen from '../screens/DetailsScreen';
import DrawerNavigator from './DrawerNavigator';

const Stack = createStackNavigator();
export default function RootNavigator({ isAuthed }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      {isAuthed ? (
        <>
          <Stack.Screen name="MainTabs" component={DrawerNavigator} />
          <Stack.Screen name="Listing" component={ListingScreen} />
          <Stack.Screen name="Details" component={DetailsScreen} />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthScreen} />
      )}
    </Stack.Navigator>
  );
}
