import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import FavoritesScreen  from '../screens/FavoritesScreen';
import TaskDetailScreen from '../screens/TaskDetailScreen';
import AddTaskScreen    from '../screens/AddTaskScreen';
import EditTaskScreen   from '../screens/EditTaskScreen';
import { colors } from '../constants/theme';

const Stack = createStackNavigator();

export default function FavoritesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Favorites"  component={FavoritesScreen} />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
      <Stack.Screen name="AddTask"    component={AddTaskScreen} />
      <Stack.Screen name="EditTask"   component={EditTaskScreen} />
    </Stack.Navigator>
  );
}
