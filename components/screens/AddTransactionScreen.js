import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Keyboard, TouchableWithoutFeedback, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { app, db } from '../../firebase'; // เส้นทางที่ถูกต้องไปยังไฟล์ firebase.js
import { collection, getDocs, addDoc } from 'firebase/firestore';


// ฟังก์ชันสำหรับบันทึกรายการ
const saveTransaction = async (transaction, type, navigation) => {
  try {
    const { title, amount } = transaction;
    const transactionData = { title, amount: parseFloat(amount) };

    const existingData = await AsyncStorage.getItem(type);
    const currentData = existingData ? JSON.parse(existingData) : [];
    const isDuplicate = currentData.some(item => item.title === transaction.title && item.amount === transaction.amount);

    if (!isDuplicate) {
      const updatedData = [...currentData, transactionData];
      await AsyncStorage.setItem(type, JSON.stringify(updatedData));
      console.log('Transaction saved:', updatedData);

      // บันทึกลง Firestore
      //await db.collection(type === 'expense' ? 'Expenses' : 'Incomes').add(transactionData);
      await addDoc(collection(db, type === 'expense' ? 'Expenses' : 'Incomes'), transactionData);

      navigation.navigate('HomeScreen', {
        transaction: transactionData,
        type
      });
    } else {
      Alert.alert('ข้อมูลซ้ำ', 'รายการนี้มีอยู่แล้ว');
    }
  } catch (error) {
    console.error('Error saving transaction:', error);
  }
};

const AddTransactionScreen = ({ navigation }) => {
  const [isShowingExpenses, setIsShowingExpenses] = useState(true);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null); // สถานะสำหรับเก็บหมวดหมู่ที่เลือก

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // ใช้ getDocs และ collection เพื่อดึงข้อมูลจาก Firestore
        const expenseSnapshot = await getDocs(collection(db, 'ExpenseCategories'));
        const expenses = expenseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const incomeSnapshot = await getDocs(collection(db, 'IncomeCategories'));
        const incomes = incomeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setExpenseCategories(expenses);
        setIncomeCategories(incomes);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const categories = isShowingExpenses ? expenseCategories : incomeCategories;

  const handleSave = async () => {
    if (title && amount && selectedCategory) { // ตรวจสอบว่าหมวดหมู่ถูกเลือกด้วย
      const transaction = { title, amount: parseFloat(amount), category: selectedCategory.name }; // บันทึกหมวดหมู่
      const type = isShowingExpenses ? 'expense' : 'income';

      await saveTransaction(transaction, type, navigation);

      setTitle('');
      setAmount('');
      setSelectedCategory(null); // รีเซ็ตหมวดหมู่ที่เลือก
    } else {
      Alert.alert('ข้อมูลไม่ครบ', 'กรุณากรอกข้อมูลให้ครบถ้วน');
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category); // ตั้งค่าหมวดหมู่ที่เลือก
    setTitle(category.name); // ตั้งค่าช่องชื่อรายการเป็น Category ที่เลือก
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, isShowingExpenses && styles.activeTabExpense]}
              onPress={() => setIsShowingExpenses(true)}>
              <Text style={[styles.tabText, isShowingExpenses && styles.activeText]}>รายจ่าย</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, !isShowingExpenses && styles.activeTabIncome]}
              onPress={() => setIsShowingExpenses(false)}>
              <Text style={[styles.tabText, !isShowingExpenses && styles.activeText]}>รายรับ</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.categoryContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[styles.categoryButton, selectedCategory?.id === category.id && styles.selectedCategory]}
              onPress={() => handleCategorySelect(category)}
            >
              {category.imageUrl && (
                <Image source={{ uri: category.imageUrl }} style={styles.categoryImage} />
              )}
              <Text style={styles.categoryText}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>ชื่อรายการ:</Text>
        <TextInput
          style={styles.input}
          placeholder="เช่น ค่าใช้จ่ายอาหาร"
          value={title}
          onChangeText={setTitle}
        />
        <Text style={styles.label}>จำนวนเงิน:</Text>
        <TextInput
          style={styles.input}
          placeholder="0"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
        <Button title="บันทึก" onPress={handleSave} />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  categoryButton: {
    padding: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    margin: 5,
  },
  selectedCategory: {
    backgroundColor: 'gray',
    borderColor: 'black',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryText: {
    fontSize: 10,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: 'black',
    borderRadius: 10,
    overflow: 'hidden',
    width: 250,
    justifyContent: 'center',
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 30,
  },
  activeTabExpense: {
    backgroundColor: 'black',
    borderBottomLeftRadius: 7,
    borderTopLeftRadius: 7,
  },
  activeTabIncome: {
    backgroundColor: 'black',
    borderBottomRightRadius: 7,
    borderTopRightRadius: 7,
  },
  activeText: {
    color: 'white',
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  categoryImage: {
    width: 50, // กำหนดความกว้าง
    height: 50, // กำหนดความสูง
    borderRadius: 8, // ทำให้ภาพมุมมน
    marginTop: 5, // ระยะห่างระหว่างชื่อและภาพ
  },
});

export default AddTransactionScreen;
