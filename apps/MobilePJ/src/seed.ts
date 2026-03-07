/**
 * seed.ts — รันครั้งเดียวเพื่อเพิ่มข้อมูลสถานที่ 8 แห่งลง Firestore
 * วิธีรัน: npx tsx src/seed.ts
 */
import 'dotenv/config'
import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

// Seed account — สร้างอัตโนมัติถ้ายังไม่มี
const SEED_EMAIL = 'seed@paikanthoe.app'
const SEED_PASSWORD = 'PaiKanThoe@2024'

const places = [
  {
    name: 'ดอยอินทนนท์',
    province: 'เชียงใหม่',
    region: 'เหนือ',
    type: ['เดินป่า', 'ดูดาว', 'แคมป์ปิ้ง'],
    difficulty: 'ยาก',
    rating: 4.7,
    reviewCount: 0,
    lat: 18.5887,
    lng: 98.4868,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Doi_Inthanon_National_Park.jpg/800px-Doi_Inthanon_National_Park.jpg',
    description: 'ยอดเขาที่สูงที่สุดในประเทศไทย ความสูง 2,565 เมตร เต็มไปด้วยป่าดิบชื้นและธรรมชาติที่งดงาม',
    entryFee: { thai: '30 บาท', foreign: '200 บาท' },
    openHours: '05:30 - 18:00 น. ทุกวัน',
    distanceFromParking: '500 เมตร - 3 กิโลเมตร',
    signal: 'บางจุด',
    water: true,
    electricity: false,
    parking: 'ฟรี',
    phone: '053-286729',
    facilities: ['ห้องน้ำ', 'จุดชมวิว', 'ร้านอาหาร']
  },
  {
    name: 'เขาค้อ',
    province: 'เพชรบูรณ์',
    region: 'เหนือ',
    type: ['แคมป์ปิ้ง', 'ดูดาว', 'เดินป่า'],
    difficulty: 'ปานกลาง',
    rating: 4.5,
    reviewCount: 0,
    lat: 16.7333,
    lng: 101.0500,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Khao_Kho_District.jpg/800px-Khao_Kho_District.jpg',
    description: 'ทะเลหมอกที่สวยงามยามเช้า อากาศเย็นสบาย เหมาะสำหรับการพักผ่อนท่ามกลางธรรมชาติ',
    entryFee: { thai: 'ฟรี', foreign: 'ฟรี' },
    openHours: 'ตลอด 24 ชั่วโมง',
    distanceFromParking: '100 เมตร - 2 กิโลเมตร',
    signal: 'มี',
    water: true,
    electricity: true,
    parking: 'ฟรี',
    phone: '056-729000',
    facilities: ['ห้องน้ำ', 'ที่พัก', 'จุดชมวิว']
  },
  {
    name: 'ภูกระดึง',
    province: 'เลย',
    region: 'อีสาน',
    type: ['เดินป่า', 'แคมป์ปิ้ง', 'ดูดาว'],
    difficulty: 'ยาก',
    rating: 4.8,
    reviewCount: 0,
    lat: 16.8667,
    lng: 101.7833,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Phu_Kradung_National_Park.jpg/800px-Phu_Kradung_National_Park.jpg',
    description: 'ที่ราบสูงรูปทรงกลมขนาดใหญ่ เส้นทางขึ้น 9 กิโลเมตร ด้านบนมีทุ่งหญ้า ป่าสนสวยงาม',
    entryFee: { thai: '40 บาท', foreign: '200 บาท' },
    openHours: 'ปิดฤดูฝน (มิ.ย. - ก.ย.) เปิด 07:00 - 14:30 น.',
    distanceFromParking: '9 กิโลเมตร (เดินขึ้น)',
    signal: 'ไม่มี',
    water: true,
    electricity: false,
    parking: 'เสียเงิน',
    phone: '042-801716',
    facilities: ['ห้องน้ำ', 'ที่พัก', 'ลานกางเต็นท์', 'ร้านอาหาร']
  },
  {
    name: 'เขาใหญ่',
    province: 'นครราชสีมา',
    region: 'กลาง',
    type: ['เดินป่า', 'ริมน้ำ', 'แคมป์ปิ้ง'],
    difficulty: 'ง่าย',
    rating: 4.6,
    reviewCount: 0,
    lat: 14.4380,
    lng: 101.3700,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Khao_Yai_National_Park_viewpoint.jpg/800px-Khao_Yai_National_Park_viewpoint.jpg',
    description: 'อุทยานแห่งชาติมรดกโลก เต็มไปด้วยสัตว์ป่าและน้ำตกสวยงาม เหมาะสำหรับทุกวัย',
    entryFee: { thai: '40 บาท', foreign: '400 บาท' },
    openHours: '06:00 - 18:00 น. ทุกวัน',
    distanceFromParking: '200 เมตร - 5 กิโลเมตร',
    signal: 'บางจุด',
    water: true,
    electricity: true,
    parking: 'ฟรี',
    phone: '044-756002',
    facilities: ['ห้องน้ำ', 'ที่พัก', 'ร้านอาหาร', 'ศูนย์บริการนักท่องเที่ยว']
  },
  {
    name: 'เกาะช้าง',
    province: 'ตราด',
    region: 'ตะวันออก',
    type: ['ริมน้ำ', 'แคมป์ปิ้ง'],
    difficulty: 'ง่าย',
    rating: 4.4,
    reviewCount: 0,
    lat: 12.0833,
    lng: 102.3167,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Koh_Chang_Thailand.jpg/800px-Koh_Chang_Thailand.jpg',
    description: 'เกาะธรรมชาติที่ใหญ่เป็นอันดับสองของไทย มีป่าดิบชื้น น้ำตก และหาดทรายสวยงาม',
    entryFee: { thai: 'ฟรี', foreign: 'ฟรี' },
    openHours: 'ตลอด 24 ชั่วโมง',
    distanceFromParking: '0 - 3 กิโลเมตร',
    signal: 'มี',
    water: true,
    electricity: true,
    parking: 'ฟรี',
    phone: '039-558000',
    facilities: ['ห้องน้ำ', 'ที่พัก', 'ร้านอาหาร']
  },
  {
    name: 'ดอยสุเทพ',
    province: 'เชียงใหม่',
    region: 'เหนือ',
    type: ['เดินป่า', 'ดูดาว'],
    difficulty: 'ง่าย',
    rating: 4.3,
    reviewCount: 0,
    lat: 18.8054,
    lng: 98.9216,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Doi_Suthep_National_Park.jpg/800px-Doi_Suthep_National_Park.jpg',
    description: 'ภูเขาศักดิ์สิทธิ์ของเชียงใหม่ มีวัดพระธาตุดอยสุเทพที่มีชื่อเสียง มองเห็นวิวเมืองเชียงใหม่',
    entryFee: { thai: '30 บาท', foreign: '100 บาท' },
    openHours: '06:00 - 18:00 น. ทุกวัน',
    distanceFromParking: '300 เมตร',
    signal: 'มี',
    water: true,
    electricity: true,
    parking: 'เสียเงิน',
    phone: '053-295117',
    facilities: ['ห้องน้ำ', 'ลิฟท์', 'ร้านอาหาร', 'ลานัสมบัติ']
  },
  {
    name: 'ภูทับเบิก',
    province: 'เพชรบูรณ์',
    region: 'เหนือ',
    type: ['ดูดาว', 'แคมป์ปิ้ง', 'เดินป่า'],
    difficulty: 'ปานกลาง',
    rating: 4.6,
    reviewCount: 0,
    lat: 16.6000,
    lng: 101.0667,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Phu_Thap_Buek.jpg/800px-Phu_Thap_Buek.jpg',
    description: 'ที่ราบสูงที่อากาศหนาวเย็น ทะเลหมอกสวยงาม มีทุ่งดอกไม้และวิวภูเขาที่น่าตื่นตา',
    entryFee: { thai: '30 บาท', foreign: 'ฟรี' },
    openHours: '05:00 - 18:00 น. ทุกวัน',
    distanceFromParking: '500 เมตร - 2 กิโลเมตร',
    signal: 'บางจุด',
    water: true,
    electricity: false,
    parking: 'ฟรี',
    phone: '056-729075',
    facilities: ['ห้องน้ำ', 'ลานกางเต็นท์', 'จุดชมวิว']
  },
  {
    name: 'น้ำตกทีลอซู',
    province: 'ตาก',
    region: 'ตะวันตก',
    type: ['ริมน้ำ', 'เดินป่า'],
    difficulty: 'ปานกลาง',
    rating: 4.9,
    reviewCount: 0,
    lat: 17.5667,
    lng: 98.1167,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Thi_Lo_Su_waterfall.jpg/800px-Thi_Lo_Su_waterfall.jpg',
    description: 'น้ำตกที่ใหญ่ที่สุดในประเทศไทย ความกว้าง 500 เมตร ความสูง 200 เมตร สวยงามยิ่งนักในฤดูฝน',
    entryFee: { thai: '200 บาท', foreign: '600 บาท' },
    openHours: 'ปิดฤดูฝน (พ.ค. - พ.ย.) เปิด 07:30 - 15:30 น.',
    distanceFromParking: '2.5 กิโลเมตร (เดินป่า)',
    signal: 'ไม่มี',
    water: false,
    electricity: false,
    parking: 'ฟรี',
    phone: '055-557000',
    facilities: ['ห้องน้ำ', 'จุดพักผ่อน']
  }
]

async function seed() {
  // 1. Authenticate ก่อน write
  console.log('🔐 กำลัง authenticate...')
  try {
    await signInWithEmailAndPassword(auth, SEED_EMAIL, SEED_PASSWORD)
    console.log('✅ Signed in with existing seed account')
  } catch (e: any) {
    if (e.code === 'auth/user-not-found' || e.code === 'auth/invalid-credential' || e.code === 'auth/invalid-email') {
      await createUserWithEmailAndPassword(auth, SEED_EMAIL, SEED_PASSWORD)
      console.log('✅ Created seed account and signed in')
    } else {
      throw e
    }
  }

  // 2. เพิ่มข้อมูล
  console.log('เริ่ม seed ข้อมูล...')
  for (const place of places) {
    const docRef = await addDoc(collection(db, 'places'), {
      ...place,
      createdAt: serverTimestamp()
    })
    console.log(`✅ เพิ่ม: ${place.name} (${docRef.id})`)
  }
  console.log('🌿 seed เสร็จสิ้น!')
}

seed().catch(console.error)
