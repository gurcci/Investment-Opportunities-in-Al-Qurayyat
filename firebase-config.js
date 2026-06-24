import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD05yaUAGoIyi64Swm1HRyaxjmeqbGG8uA",
  authDomain: "al-qurayat.firebaseapp.com",
  projectId: "al-qurayat",
  storageBucket: "al-qurayat.firebasestorage.app",
  messagingSenderId: "477796324637",
  appId: "1:477796324637:web:1d17a7744bcde2ccd93df4"
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);
const auth = getAuth(app);

const COLL = "opportunities";

// البيانات الافتراضية تُرفع مرة واحدة فقط إن كانت القاعدة فارغة
const defaultOpportunities = [
  { number:"QR-2024-001", activity:"تجاري",  neighborhood:"حي النزهة",    area:1200,  duration:"10 سنوات", docsPrice:500,  announceDate:"2024-01-15", tenderDate:"2024-02-01", lat:31.3421, lng:37.3612, description:"أرض تجارية على الشارع الرئيسي مناسبة للمحلات والمراكز التجارية", status:"متاح" },
  { number:"QR-2024-002", activity:"صناعي",  neighborhood:"حي الصناعية",  area:5000,  duration:"15 سنة",   docsPrice:1000, announceDate:"2024-01-20", tenderDate:"2024-02-10", lat:31.3180, lng:37.3450, description:"أرض صناعية في المنطقة الصناعية بالقريات مجهزة بالخدمات", status:"متاح" },
  { number:"QR-2024-003", activity:"سياحي",  neighborhood:"حي الورود",    area:3500,  duration:"20 سنة",   docsPrice:800,  announceDate:"2024-02-01", tenderDate:"2024-02-20", lat:31.3350, lng:37.3700, description:"موقع سياحي مميز قرب وادي السرحان يصلح لمشاريع الضيافة والسياحة", status:"متاح" },
  { number:"QR-2024-004", activity:"تجاري",  neighborhood:"حي الروضة",    area:800,   duration:"10 سنوات", docsPrice:500,  announceDate:"2024-02-05", tenderDate:"2024-02-25", lat:31.3290, lng:37.3580, description:"قطعة أرض تجارية في حي الروضة قرب الخدمات والمرافق", status:"متاح" },
  { number:"QR-2024-005", activity:"زراعي",  neighborhood:"حي المروج",    area:15000, duration:"25 سنة",   docsPrice:300,  announceDate:"2024-02-10", tenderDate:"2024-03-01", lat:31.3500, lng:37.3400, description:"أرض زراعية خصبة في منطقة المروج تصلح لمشاريع الزراعة المحمية", status:"متاح" },
  { number:"QR-2024-006", activity:"خدمي",   neighborhood:"حي الملك فهد", area:2000,  duration:"12 سنة",   docsPrice:600,  announceDate:"2024-02-15", tenderDate:"2024-03-05", lat:31.3380, lng:37.3520, description:"موقع خدمي استراتيجي في حي الملك فهد مناسب لمحطات الوقود والخدمات", status:"متاح" },
  { number:"QR-2024-007", activity:"تعليمي", neighborhood:"حي الخزامى",   area:4000,  duration:"30 سنة",   docsPrice:400,  announceDate:"2024-02-20", tenderDate:"2024-03-10", lat:31.3260, lng:37.3660, description:"أرض تعليمية مخصصة لإنشاء مدارس أو مراكز تدريب وتطوير", status:"متاح" },
  { number:"QR-2024-008", activity:"ترفيهي", neighborhood:"حي السلام",    area:6000,  duration:"15 سنة",   docsPrice:700,  announceDate:"2024-03-01", tenderDate:"2024-03-20", lat:31.3440, lng:37.3480, description:"موقع ترفيهي واسع يصلح لإنشاء مجمع ترفيهي أو حديقة عامة", status:"متاح" },
  { number:"QR-2024-009", activity:"صناعي",  neighborhood:"حي الصناعية",  area:8000,  duration:"20 سنة",   docsPrice:1200, announceDate:"2024-03-05", tenderDate:"2024-03-25", lat:31.3150, lng:37.3420, description:"مصنع كبير في المنطقة الصناعية مجهز بجميع البنية التحتية اللازمة", status:"محجوز" },
  { number:"QR-2024-010", activity:"تجاري",  neighborhood:"حي النزهة",    area:950,   duration:"10 سنوات", docsPrice:500,  announceDate:"2024-03-10", tenderDate:"2024-03-30", lat:31.3460, lng:37.3630, description:"محل تجاري في موقع مميز بحي النزهة قرب المراكز التجارية", status:"متاح" }
];

// جلب كل الفرص
async function getOpportunities() {
  const snap = await getDocs(collection(db, COLL));
  if (!snap.empty) {
    return snap.docs.map(d => ({ ...d.data(), id: d.id }));
  }
  // تحقق من علامة التهيئة في Firestore
  const flagRef = doc(db, '_meta', 'seeded');
  const flagSnap = await getDoc(flagRef);
  if (!flagSnap.exists()) {
    await seedData();
    await setDoc(flagRef, { done: true });
    return defaultOpportunities.map((o, i) => ({ ...o, id: `seed-${i}` }));
  }
  return [];
}

// رفع البيانات الافتراضية
async function seedData() {
  for (const o of defaultOpportunities) {
    await addDoc(collection(db, COLL), o);
  }
}

// إضافة فرصة
async function addOpportunity(opp) {
  const ref = await addDoc(collection(db, COLL), opp);
  return { ...opp, id: ref.id };
}

// تعديل فرصة
async function updateOpportunity(id, updated) {
  await updateDoc(doc(db, COLL, id), updated);
  return true;
}

// حذف فرصة
async function deleteOpportunity(id) {
  await deleteDoc(doc(db, COLL, id));
}

const NEIGHBORHOODS = ["حي النزهة","حي الروضة","حي الملك فهد","حي الصناعية","حي الورود","حي المروج","حي الخزامى","حي السلام"];
const ACTIVITIES    = ["تجاري","صناعي","سياحي","زراعي","خدمي","تعليمي","ترفيهي"];
const ACTIVITY_COLORS = {
  "تجاري":"#e74c3c","صناعي":"#8e44ad","سياحي":"#2ecc71",
  "زراعي":"#27ae60","خدمي":"#e67e22","تعليمي":"#3498db","ترفيهي":"#f39c12"
};

export {
  auth,
  signInWithEmailAndPassword,
  getOpportunities,
  addOpportunity,
  updateOpportunity,
  deleteOpportunity,
  NEIGHBORHOODS,
  ACTIVITIES,
  ACTIVITY_COLORS
};