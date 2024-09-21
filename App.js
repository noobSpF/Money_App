import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, StyleSheet} from 'react-native';

import SummaryScreen from './components/screens/SummaryScreen';
import AddTransactionScreen from './components/screens/AddTransactionScreen';
import HomeScreen from './components/screens/Home';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const StackNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="HomeScreen" component={HomeScreen} 
    options={{ headerTitle: () => <Text style={styles.headerTitle}>ผู้จัดการเงิน</Text>, 
    headerTitleAlign: 'center', headerStyle: { height: 100 }}}  />
    <Stack.Screen name="AddTransaction" component={AddTransactionScreen} />
    <Stack.Screen name="Addexpense" component={AddTransactionScreen} />
    <Stack.Screen name="Addincome" component={AddTransactionScreen} />
    <Stack.Screen name="SummaryScreen" component={SummaryScreen} />
  </Stack.Navigator>
);

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarLabel: ({ focused, color }) => {
        let label = '';
        if (route.name === 'หน้าแรก') {
          label = 'หน้าแรก';
        } else if (route.name === 'เพิ่ม') {
          label = 'เพิ่ม';
        } else if (route.name === 'สรุป'){
          label = 'สรุป';
        }
        return <Text style={{ color: focused ? '#ff3b30' : 'gray', fontSize: 16 }}>{label}</Text>;
      },
      tabBarActiveTintColor: '#ff3b30',
      tabBarInactiveTintColor: 'gray',
      tabBarStyle: { height: 60, paddingBottom: 10 },
      headerShown: false,
    })}
  >
    <Tab.Screen name="หน้าแรก" component={StackNavigator} />
    <Tab.Screen name="เพิ่ม" component={AddTransactionScreen} />
    <Tab.Screen name="สรุป" component={SummaryScreen} />
  </Tab.Navigator>
);

const App = () => {
  return (
    <NavigationContainer>
      <TabNavigator />
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 20,
    color: 'black',
  },
});

export default App;
