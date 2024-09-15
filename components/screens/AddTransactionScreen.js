import React, { useState, useLayoutEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Keyboard, TouchableWithoutFeedback, TouchableOpacity, } from 'react-native';
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

  const handleSave = async () => {
    if (title && amount) {
      const transaction = { title, amount: parseFloat(amount) };
      const type = isShowingExpenses ? 'expense' : 'income';
      
      try {
        const existingData = await AsyncStorage.getItem(type);
        const currentData = existingData ? JSON.parse(existingData) : [];
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
      } catch (error) {
        console.error('Error saving transaction:', error);
      }
    } else {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
    }
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
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
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
