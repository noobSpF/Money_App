import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "moneybroapp-6bbdb.firebaseapp.com",
    projectId: "moneybroapp-6bbdb",
    storageBucket: "moneybroapp-6bbdb.appspot.com",
    messagingSenderId: "264953065855",
    appId: "1:264953065855:android:fb660269f344578684aa4a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // ตั้งค่า Firestore ที่นี่

export { app, db }; // ส่งออกทั้ง app และ db

