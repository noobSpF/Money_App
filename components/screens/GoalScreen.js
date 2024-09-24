import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native'; // Import this hook

const GoalScreen = ({ navigation, route }) => {
  const [goals, setGoals] = useState([]);
  const isFocused = useIsFocused(); // To detect when the screen is focused

  // Fetch goals from AsyncStorage
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const savedGoals = await AsyncStorage.getItem('goals');
        if (savedGoals !== null) {
          setGoals(JSON.parse(savedGoals));
        }
      } catch (error) {
        console.error('Error loading goals:', error);
      }
    };

    // Call fetchGoals when screen is focused or when coming back with a refresh request
    if (isFocused || route.params?.refresh) {
      fetchGoals();
    }
  }, [isFocused, route.params?.refresh]); // Depend on `isFocused` and `route.params?.refresh`

  // Handle deleting a goal
  const handleDeleteGoal = async (goal) => {
    Alert.alert(
      "ยืนยันการลบ",
      `คุณต้องการลบเป้าหมาย ${goal.title} หรือไม่?`,
      [
        {
          text: "ยกเลิก",
          style: "cancel",
        },
        {
          text: "ลบ",
          onPress: async () => {
            const updatedGoals = goals.filter(g => g.id !== goal.id);
            setGoals(updatedGoals);
            await AsyncStorage.setItem('goals', JSON.stringify(updatedGoals));
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderGoalItem = ({ item }) => (
    <View style={styles.goalItem}>
      <Image source={item.icon} style={styles.goalIcon} />
      <View style={styles.goalDetails}>
        <Text style={styles.goalTitle}>{item.title}</Text>
        <Text style={styles.goalAmount}>ยอดเงินเป้าหมาย: {item.amount} บาท</Text>
        <Text style={styles.goalAmount}>ยอดเงินคงเหลือ: {item.remainingAmount} บาท</Text>
        <Text style={styles.goalDate}>{item.date}</Text>
      </View>
      <TouchableOpacity onPress={() => handleDeleteGoal(item)}>
        <Text style={styles.deleteText}>ลบ</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>รายการแสดงยอดคงเหลือ</Text>
        
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddGoalScreen')}>
          <Text style={styles.addButtonText}>เพิ่ม</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.dataContainer}>

      {/* Goals List */}
      <FlatList
        data={goals}
        keyExtractor={(item) => item.id}
        renderItem={renderGoalItem}
        contentContainerStyle={styles.goalList}
      />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  header: {
    marginTop: 20,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#B7B7B7',
    padding: 10,
    borderRadius: 5,
  },
  addButtonText: {
    color: '#347928',
    fontWeight: 'bold',
  },
  goalList: {
    paddingHorizontal: 20,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F9F9F9',
    marginBottom: 10,
    borderRadius: 10,
    borderColor: '#E0E0E0',
    borderWidth: 1,
  },
  goalIcon: {
    width: 50,
    height: 50,
    marginRight: 20,
    resizeMode: 'contain', 
  },
  goalDetails: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  goalAmount: {
    color: 'black',
    marginTop: 5,
  },
  goalDate: {
    color: '#A7A7A7',
    marginTop: 5,
  },
  deleteText: {
    color: 'red',
    fontWeight: 'bold',
  },
  dataContainer: { 
    flex: 1, 
    backgroundColor: '#F7F7F7', 
  },
});

export default GoalScreen;
