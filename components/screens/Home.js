import React, { useState, useEffect } from 'react'; 
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
  tabContainer: {
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: 'black',
    borderRadius: 10,
    overflow: 'hidden',
    width: 250,
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
});


export default HomeScreen;
