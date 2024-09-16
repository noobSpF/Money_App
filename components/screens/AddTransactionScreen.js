import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Keyboard, TouchableWithoutFeedback, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ฟังก์ชันสำหรับบันทึกรายการ
const saveTransaction = async (transaction, type) => {
  try {
    const { title, amount } = transaction; // รับค่า title และ amount จาก transaction
    const transactionData = { title, amount: parseFloat(amount) }; // เปลี่ยน amount เป็น float
    const existingData = await AsyncStorage.getItem(type);
    const currentData = existingData ? JSON.parse(existingData) : [];
    const updatedData = [...currentData, transactionData];
    await AsyncStorage.setItem(type, JSON.stringify(updatedData));
    console.log('Transaction saved:', updatedData); // ตรวจสอบข้อมูลที่บันทึก
  } catch (error) {
    console.error('Error saving transaction:', error);
  }
};

const AddTransactionScreen = ({ route, navigation }) => {
  const [isShowingExpenses, setIsShowingExpenses] = useState(true);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');

  // หมวดหมู่สำหรับรายจ่าย
  const expenseCategories = [
    'ค่าอาหาร',
    'ค่าเดินทาง',
    'สังคม',
    'ค่าเช่าบ้าน',
    'แฟชั่น',
    'สุขภาพ',
    'สิ่งของ',
  ];

  // หมวดหมู่สำหรับรายรับ
  const incomeCategories = [
    'เงินเดือน',
    'โบนัส',
    'เงินปันผล',
    'รายได้จากงานเสริม',
  ];

  // เลือกหมวดหมู่ที่จะแสดงตามประเภทที่เลือก
  const categories = isShowingExpenses ? expenseCategories : incomeCategories;

  const handleSave = async () => {
  if (title && amount) {
    const transaction = { title, amount: parseFloat(amount) };
    const type = isShowingExpenses ? 'expense' : 'income';
    
    try {
      const existingData = await AsyncStorage.getItem(type);
      const currentData = existingData ? JSON.parse(existingData) : [];
      
      // ตรวจสอบว่า transaction นี้มีอยู่แล้วใน currentData หรือไม่
      const isDuplicate = currentData.some(item => item.title === transaction.title && item.amount === transaction.amount);
      
      if (!isDuplicate) {
        const updatedData = [...currentData, transaction];
        await AsyncStorage.setItem(type, JSON.stringify(updatedData));
        console.log('Transaction saved:', updatedData);

        // Navigate to HomeScreen with updated data
        navigation.navigate('HomeScreen', {
          transaction,
          type
        });

        setTitle('');
        setAmount('');
      } else {
        alert('รายการนี้มีอยู่แล้ว');
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  } else {
    alert('กรุณากรอกข้อมูลให้ครบถ้วน');
  }
};


  // ฟังก์ชันสำหรับการเลือก Category
  const handleCategorySelect = (category) => {
    setTitle(category); // ตั้งค่าช่องชื่อรายการเป็น Category ที่เลือก
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.tab, isShowingExpenses && styles.activeTab]}
            onPress={() => setIsShowingExpenses(true)}
          >
            <Text style={styles.tabText}>รายจ่าย</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, !isShowingExpenses && styles.activeTab]}
            onPress={() => setIsShowingExpenses(false)}
          >
            <Text style={styles.tabText}>รายรับ</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.category}>
          {categories.map((category, index) => (
            <TouchableOpacity key={index} style={styles.categoryButton} onPress={() => handleCategorySelect(category)}>
              <Text style={styles.categoryText}>{category}</Text>
            </TouchableOpacity>
          ))}
        </View>

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
    marginTop: 70,
    padding: 20,
    paddingTop: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  category: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  categoryButton: {
    padding: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    margin: 5,
  },
  categoryText: {
    fontSize: 16,
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
  tab: {
    padding: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: 'black',
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default AddTransactionScreen;
