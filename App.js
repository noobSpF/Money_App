import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, StyleSheet, Keyboard} from 'react-native';
import '@react-native-firebase/app';
import Icon from 'react-native-vector-icons/Ionicons';




import SummaryScreen from './components/screens/SummaryScreen';
import AddTransactionScreen from './components/screens/AddTransactionScreen';
import HomeScreen from './components/screens/Home';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const StackNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="ผู้จัดการเงิน" component={HomeScreen} 
    options={{ headerTitleAlign: 'center',  headerStyle: { height: 100 },}} />
    <Stack.Screen name="เพิ่ม" component={AddTransactionScreen} />
    <Stack.Screen name="Addexpense" component={AddTransactionScreen} />
    <Stack.Screen name="Addincome" component={AddTransactionScreen} />
    <Stack.Screen name="SummaryScreen" component={SummaryScreen} />
  </Stack.Navigator>
);

const TabNavigator = () => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarLabel: ({ focused, color }) => {
          let label = '';
          if (route.name === 'หน้าแรก') {
            label = 'หน้าแรก';
          } else if (route.name === 'เพิ่ม') {
            label = 'เพิ่ม';
          } else if (route.name === 'สรุป') {
            label = 'สรุป';
          }
          return <Text style={{ color: focused ? '#ff3b30' : 'gray', fontSize: 16 }}>{label}</Text>;
        },
        tabBarActiveTintColor: '#ff3b30',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { height: 60, paddingBottom: 10, display: isKeyboardVisible ? 'none' : 'flex' },
      })}
    >
      <Tab.Screen 
        name="หน้าแรก" 
        component={StackNavigator} 
        options={{ headerShown: false, tabBarIcon: ({ color }) => (<Icon name="home" size={24} color={color} />) 
        }} 
      />
      <Tab.Screen 
        name="เพิ่ม" 
        component={AddTransactionScreen} 
        options={{ headerShown: true, headerTitle: 'เพิ่ม', tabBarLabel: () => null, headerTitleAlign: 'center',  headerStyle: { height: 100 },
          tabBarIcon: ({ color }) => (<Icon name="add-circle-outline" size={50} color={color} />)
        }} 
      />
      <Tab.Screen name="สรุป" component={SummaryScreen} />
    </Tab.Navigator>
  );
};

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
