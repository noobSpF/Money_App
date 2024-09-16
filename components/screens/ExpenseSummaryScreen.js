import React, { useState, useEffect } from 'react';
import { View, Text, Dimensions, StyleSheet, FlatList } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ExpenseSummaryScreen = () => {
  const [expenses, setExpenses] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const existingData = await AsyncStorage.getItem('expense');
        const parsedData = existingData ? JSON.parse(existingData) : [];
        setExpenses(parsedData);
        const total = parsedData.reduce((sum, item) => sum + item.amount, 0);
        setTotalExpense(total);
      } catch (error) {
        console.error('Error fetching expenses:', error);
      }
    };

    fetchExpenses();
  }, []);

  const data = [
    { name: 'รายจ่าย', amount: totalExpense, color: '#ff3b30', legendFontColor: '#7F7F7F', legendFontSize: 15 },
  ];

  const renderItem = ({ item }) => (
    <View style={styles.listItem}>
      <Text style={styles.itemText}>{item.title}: {item.amount} บาท</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>สรุปรายจ่าย</Text>
      <PieChart
        data={data}
        width={Dimensions.get('window').width - 40}
        height={220}
        chartConfig={{
          backgroundColor: '#1cc910',
          backgroundGradientFrom: '#eff3ff',
          backgroundGradientTo: '#efefef',
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor="amount"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />
      <FlatList
        data={expenses}
        renderItem={renderItem}
        keyExtractor={(item) => item.title}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  list: {
    width: '100%',
    marginTop: 20,
  },
  listItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  itemText: {
    fontSize: 16,
  },
});

export default ExpenseSummaryScreen;
