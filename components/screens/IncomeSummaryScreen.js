import React, { useState, useEffect } from 'react';
import { View, Text, Dimensions, StyleSheet, FlatList } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const IncomeSummaryScreen = () => {
  const [income, setIncome] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);

  useEffect(() => {
    const fetchIncome = async () => {
      try {
        const existingData = await AsyncStorage.getItem('income');
        const parsedData = existingData ? JSON.parse(existingData) : [];
        setIncome(parsedData);
        const total = parsedData.reduce((sum, item) => sum + item.amount, 0);
        setTotalIncome(total);
      } catch (error) {
        console.error('Error fetching income:', error);
      }
    };

    fetchIncome();
  }, []);

  const data = [
    { name: 'รายรับ', amount: totalIncome, color: '#34c759', legendFontColor: '#7F7F7F', legendFontSize: 15 },
  ];

  // ฟังก์ชันสำหรับเรนเดอร์รายการใน FlatList
  const renderItem = ({ item }) => (
    <View style={styles.listItem}>
      <Text style={styles.itemText}>{item.title}: {item.amount} บาท</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>สรุปรายรับ</Text>
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
        data={income}
        renderItem={renderItem} // ใช้ฟังก์ชัน renderItem
        keyExtractor={(item) => item.title} // ใช้ title เป็น key
        style={styles.list} // ใช้สไตล์
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

export default IncomeSummaryScreen;
