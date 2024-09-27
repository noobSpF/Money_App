import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';

const GoalScreen = ({ navigation, route }) => {
  const [goals, setGoals] = useState([]);
  const isFocused = useIsFocused();

  // ดึงข้อมูลเป้าหมายจาก Firestore
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'Goals'));
        const goalsData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: data.date.toDate ? data.date.toDate().toLocaleDateString('th-TH') : data.date, // ตรวจสอบว่าเป็น Timestamp หรือ string แล้วแปลงเป็น Date
          };
        });
        setGoals(goalsData);
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', error);
      }
    };

    if (isFocused || route.params?.refresh) {
      fetchGoals();
    }
  }, [isFocused, route.params?.refresh]);

  const handleDeleteGoal = async (goal) => {
    Alert.alert(
      "ยืนยันการลบ",
      `คุณต้องการลบเป้าหมาย "${goal.title}" ใช่หรือไม่?`,
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
            await deleteDoc(doc(db, 'Goals', goal.id)); // ลบข้อมูลจาก Firebase
          },
        },
      ],
      { cancelable: true }
    );
  };

  const getCategoryIcon = (categoryName) => {
    switch (categoryName) {
      case 'อาหาร':
        return require('../../assets/Food-icon.png');
      case 'การเดินทาง':
        return require('../../assets/Transport-icon.png');
      case 'แฟชั่น':
        return require('../../assets/Fashion-icon.png');
      case 'ที่อยู่อาศัย':
        return require('../../assets/House-icon.png');
      case 'สังคม':
        return require('../../assets/Social-icon.png');
      case 'สิ่งของ':
        return require('../../assets/Items-icon.png');
      case 'การศึกษา':
        return require('../../assets/Edu-icon.png');
      case 'สุขภาพ':
        return require('../../assets/Health-icon.png');
    }
  };

  const renderGoalItem = ({ item }) => (
    <View style={styles.goalItem}>
      <Image 
        source={getCategoryIcon(item.title)} 
        style={styles.goalIcon} 
      />
      <View style={styles.goalDetails}>
        <Text style={styles.goalTitle}>{item.title}</Text>
        <Text style={styles.goalAmount}>ยอดเงินเป้าหมาย: {item.amount} บาท</Text>
        <Text style={styles.goalAmount}>ยอดเงินคงเหลือ: {item.remainingAmount} บาท</Text>
        <Text style={styles.goalDate}>วันที่สิ้นสุด: {item.date}</Text>
      </View>
      <TouchableOpacity onPress={() => handleDeleteGoal(item)}>
        <Text style={styles.deleteText}>ลบ</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>รายการแสดงยอดคงเหลือ</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('เพิ่มเป้าหมายการเงิน')}>
          <Text style={styles.addButtonText}>เพิ่ม</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={goals}
        keyExtractor={(item) => item.id}
        renderItem={renderGoalItem}
        contentContainerStyle={styles.goalList}
      />
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
});

export default GoalScreen;
