import React, { useState, useEffect } from 'react'; // ลบ route, navigation
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ExpenseScreen from './ExpenseScreen';
import IncomeScreen from './IncomeScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ฟังก์ชันสำหรับโหลดรายการ
const loadTransactions = async (type) => {
  try {
    const data = await AsyncStorage.getItem(type);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading data:', error);
    return [];
  }
};


const HomeScreen = ({ route, navigation }) => {
  const [isShowingExpenses, setIsShowingExpenses] = useState(true);
  const [expense, setExpense] = useState([]);
  const [income, setIncome] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
        const expenseData = await loadTransactions('expense');
        setExpense(expenseData);
        const incomeData = await loadTransactions('income');
        setIncome(incomeData);
      };
      fetchData();
    }, []);
  useEffect(() => {
    if (route.params?.transaction) {
      const { title, amount } = route.params.transaction;
      const type = route.params.type;
        if (type === 'expense') {
          setExpense(prevExpense => [...prevExpense, { title, amount }]);
          saveTransaction({ title, amount }, 'expense');
        } else if (type === 'income') {
          setIncome(prevIncome => [...prevIncome, { title, amount }]);
          saveTransaction({ title, amount }, 'income');
        }
              // Clear route params
      route.params = {};
    }
  }, [route.params?.transaction, route.params?.type]);

  const saveTransaction = async (transaction, type) => {
    try {
      if (!transaction.title || transaction.amount === undefined) {
        console.error('Transaction data is incomplete:', transaction);
        return;
      }
  
      const existingData = await AsyncStorage.getItem(type);
      const currentData = existingData ? JSON.parse(existingData) : [];
      const updatedData = [...currentData, transaction];
      await AsyncStorage.setItem(type, JSON.stringify(updatedData));
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.tab, isShowingExpenses && styles.activeTab]}
          onPress={() => setIsShowingExpenses(true)}>
          <Text style={styles.tabText}>รายจ่าย</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, !isShowingExpenses && styles.activeTab]}
          onPress={() => setIsShowingExpenses(false)}>
          <Text style={styles.tabText}>รายรับ</Text>
        </TouchableOpacity>
      </View>
      {isShowingExpenses ? (
        <ExpenseScreen expense={expense} setExpense={setExpense} />
      ) : (
        <IncomeScreen income={income} setIncome={setIncome}/>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F7F7F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
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

export default HomeScreen;
