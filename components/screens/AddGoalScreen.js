import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, TextInput, Alert, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../../firebase'; // Ensure this is the correct path to Firebase
import { collection, getDocs } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Ionicons'; // Import Ionicons from react-native-vector-icons

const AddGoalScreen = ({ navigation }) => {
  const [goalAmount, setGoalAmount] = useState(''); // User input for goal amount
  const [expenseCategories, setExpenseCategories] = useState([]); // List of expense categories
  const [selectedCategory, setSelectedCategory] = useState(null); // Track selected category
  const [endDate, setEndDate] = useState(new Date()); // Store the selected end date
  const [showDatePicker, setShowDatePicker] = useState(false); // Control the date picker visibility

  // Calculate tomorrow's date
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1); // Move one day forward

  // Fetch categories from Firestore
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const expenseSnapshot = await getDocs(collection(db, 'ExpenseCategories'));
        const expenses = expenseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setExpenseCategories(expenses); // Set the categories in state
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories(); // Call the function to fetch categories
  }, []);

  // Handle saving the goal (replaces existing goal)
  const handleSaveGoal = async () => {
    if (goalAmount && selectedCategory) {
      const newGoal = {
        id: Date.now().toString(), 
        title: selectedCategory.name, 
        amount: parseFloat(goalAmount), // เปลี่ยนเป็นตัวเลขแทน string
        remainingAmount: parseFloat(goalAmount), // จำนวนเงินคงเหลือเท่ากับยอดตั้งต้น
        date: endDate.toLocaleDateString('th-TH'), 
        icon: selectedCategory.imageUrl, 
        createdAt: new Date(), // บันทึกวันเวลาที่ตั้งเป้าหมาย
      };
  
      let savedGoals = await AsyncStorage.getItem('goals');
      savedGoals = savedGoals ? JSON.parse(savedGoals) : [];
  
      const updatedGoals = savedGoals.filter(goal => goal.title !== selectedCategory.name);
      updatedGoals.push(newGoal);
  
      await AsyncStorage.setItem('goals', JSON.stringify(updatedGoals));
  
      navigation.navigate('GoalScreen', { refresh: true });
  
      setGoalAmount('');
      setSelectedCategory(null);
      setEndDate(new Date());
    } else {
      Alert.alert('ข้อมูลไม่ครบ', 'กรุณาเลือกหมวดหมู่และกรอกจำนวนเงิน');
    }
  };
  const saveTransaction = async (transaction, type, navigation) => {
    try {
      const { title, amount } = transaction;
      const transactionData = {
        title,
        amount: parseFloat(amount),
        createdAt: new Date(), // บันทึกวันเวลาที่มีการเพิ่มรายจ่าย
      };
  
      let existingData = await AsyncStorage.getItem(type);
      existingData = existingData ? JSON.parse(existingData) : [];
  
      const updatedData = [...existingData, transactionData];
      await AsyncStorage.setItem(type, JSON.stringify(updatedData));
  
      navigation.navigate('หน้าแรก', {
        transaction: transactionData,
        type
      });
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };
  const updateGoalRemainingAmount = async () => {
    let savedGoals = await AsyncStorage.getItem('goals');
    savedGoals = savedGoals ? JSON.parse(savedGoals) : [];
  
    let savedExpenses = await AsyncStorage.getItem('expense');
    savedExpenses = savedExpenses ? JSON.parse(savedExpenses) : [];
  
    const updatedGoals = savedGoals.map(goal => {
      const totalExpensesAfterGoal = savedExpenses
        .filter(expense => expense.title === goal.title && new Date(expense.createdAt) > new Date(goal.createdAt))
        .reduce((total, expense) => total + expense.amount, 0);
  
      return {
        ...goal,
        remainingAmount: goal.amount - totalExpensesAfterGoal,
      };
    });
  
    await AsyncStorage.setItem('goals', JSON.stringify(updatedGoals));
  };
  
  

  const handleAddAmount = async () => {
    if (goalAmount && selectedCategory) {
      let savedGoals = await AsyncStorage.getItem('goals');
      savedGoals = savedGoals ? JSON.parse(savedGoals) : [];
  
      // Find the goal for this category
      const existingGoal = savedGoals.find(goal => goal.title === selectedCategory.name);
  
      // If goal exists, add the new amount to both 'amount' and 'remainingAmount'
      if (existingGoal) {
        const updatedAmount = parseFloat(existingGoal.amount) + parseFloat(goalAmount);
        const updatedRemainingAmount = parseFloat(existingGoal.remainingAmount) + parseFloat(goalAmount);
  
        existingGoal.amount = updatedAmount; // Update the total goal amount
        existingGoal.remainingAmount = updatedRemainingAmount; // Update the remaining amount
      } else {
        // If no existing goal, create a new one with both 'amount' and 'remainingAmount' initialized
        const newGoal = {
          id: Date.now().toString(),
          title: selectedCategory.name,
          amount: parseFloat(goalAmount),
          remainingAmount: parseFloat(goalAmount), // Set remaining amount initially the same as amount
          date: new Date().toLocaleDateString('th-TH'),
          icon: selectedCategory.imageUrl,
          createdAt: new Date(), // Save the date the goal was created
        };
        savedGoals.push(newGoal);
      }
  
      // Save updated goals
      await AsyncStorage.setItem('goals', JSON.stringify(savedGoals));
  
      // Navigate back to GoalScreen and trigger refresh
      navigation.navigate('GoalScreen', { refresh: true });
  
      // Reset the form
      setGoalAmount('');
      setSelectedCategory(null);
    } else {
      Alert.alert('ข้อมูลไม่ครบ', 'กรุณาเลือกหมวดหมู่และกรอกจำนวนเงิน');
    }
  };

  // Handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category); // Set selected category
  };

  // Handle showing the date picker
  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  // Handle date selection
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false); // Hide the date picker
    if (selectedDate) {
      setEndDate(selectedDate); // Set the selected date
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 30 : 100}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {/* Category Section */}
          <Text style={styles.subTitle}>หมวดหมู่</Text>
          <ScrollView contentContainerStyle={styles.categoryContainer}>
            {expenseCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory?.id === category.id && styles.selectedCategory
                ]}
                onPress={() => handleCategorySelect(category)}>
                {category.imageUrl && (
                  <Image source={{ uri: category.imageUrl }} style={styles.categoryImage} />
                )}
                <Text style={styles.categoryText}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Amount Section */}
          <View style={styles.amountContainer}>
            <Image source={require('../../assets/money-bag.png')} style={styles.moneyIcon} />
            <View style={styles.amountInputContainer}>
              <Text style={styles.label}>จำนวนเงินที่อยากใช้:</Text>
              <TextInput
                style={styles.input}
                placeholder="0 บาท"
                keyboardType="numeric"
                value={goalAmount}
                onChangeText={setGoalAmount}
              />
            </View>
            <TouchableOpacity onPress={showDatepicker} style={styles.calendarIconContainer}>
              <Icon name="calendar" size={30} color="#347928" />
            </TouchableOpacity>
          </View>

          {/* Date Picker Section */}
          <View style={styles.datePickerContainer}>
            <Text>วันที่สิ้นสุด: {endDate.toLocaleDateString('th-TH')}</Text>
            {showDatePicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display="default"
                onChange={onDateChange}
                minimumDate={tomorrowDate} // Only allow future dates starting from tomorrow
              />
            )}
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.addButton} onPress={handleAddAmount}>
              <Text style={styles.buttonText}>เพิ่ม</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveGoal}>
              <Text style={styles.buttonText}>บันทึก</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  subTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  categoryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  selectedCategory: {
    backgroundColor: '#c8e1ff',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#007bff',
  },
  categoryText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
  },
  categoryImage: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 15,
    backgroundColor: '#B7B7B7',
    borderRadius: 10,
  },
  moneyIcon: {
    width: 50,
    height: 50,
    marginRight: 15,
  },
  amountInputContainer: {
    flex: 1,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
    textAlign: 'right',
    color: '#347928',
  },
  input: {
    fontSize: 20,
    padding: 10,
    backgroundColor: '#B7B7B7',
    textAlign: 'right',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 5,
  },
  saveButton: {
    backgroundColor: '#B7B7B7',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    width: 100,
  },
  addButton: {
    backgroundColor: '#B7B7B7',
    padding: 10,
    borderRadius: 10,
    marginRight: 20,
    alignItems: 'center',
    width: 100,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#347928',
  },
});

export default AddGoalScreen;
