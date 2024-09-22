import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ฟังก์ชันสำหรับลบรายการ
const removeTransaction = async (item, type) => {
  try {
    const existingData = await AsyncStorage.getItem(type);
    const currentData = existingData ? JSON.parse(existingData) : [];
    const updatedData = currentData.filter(transaction => transaction.title !== item.title || transaction.amount !== item.amount);
    await AsyncStorage.setItem(type, JSON.stringify(updatedData));
  } catch (error) {
    console.error('Error removing data:', error);
  }
};

const IncomeScreen = ({ income, setIncome }) => {
  const handleDelete = (item) => {
    // แสดงกล่องยืนยันการลบ
    Alert.alert(
      'ยืนยันการลบ', // หัวข้อของกล่องยืนยัน
      `คุณต้องการลบรายการ "${item.title}" จำนวน ฿${item.amount.toLocaleString()} ใช่หรือไม่?`, // ข้อความที่แสดง
      [
        {
          text: 'ยกเลิก', // ปุ่มยกเลิก
          style: 'cancel',
        },
        {
          text: 'ลบ', // ปุ่มยืนยันการลบ
          onPress: () => {
            removeTransaction(item, 'income');
            setIncome(prev => prev.filter(transaction => transaction.title !== item.title || transaction.amount !== item.amount));
          },
          style: 'destructive', // สไตล์ปุ่มเป็นการกระทำที่รุนแรง (สีแดง)
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {income.length === 0 ? (
        <Text style={styles.text}>ไม่มีรายรับ</Text>
      ) : (
        <FlatList
          data={income}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.amount}>+ ฿{item.amount.toLocaleString()}</Text>
              <TouchableOpacity onPress={() => handleDelete(item)}>
                <Text style={styles.delete}>ลบ</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default IncomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: '#f8f8f8',
  },
  listContainer: {
    paddingTop: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    fontWeight: 'bold',
  },
  itemText: {
    fontSize: 18,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'green',
  },
  delete: {
    color: 'red',
    fontWeight: 'bold',
  },
  text: {
    textAlign: 'center',
    fontSize: 20,
    color: 'red',
  }
});
