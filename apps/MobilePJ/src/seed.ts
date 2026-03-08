/**
 * seed.ts — รันครั้งเดียวเพื่อเพิ่มข้อมูลสถานที่ 8 แห่งลง Firestore
 * วิธีรัน: npx tsx src/seed.ts
 */
import 'dotenv/config'
import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, collection, addDoc, serverTimestamp, getDocs, deleteDoc } from 'firebase/firestore'

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
   // --- ภาคเหนือ (30 แห่ง) ---
  { name: 'ดอยอินทนนท์', province: 'เชียงใหม่', region: 'เหนือ', type: ['เดินป่า', 'ดูดาว'], difficulty: 'ยาก', rating: 4.8, lat: 18.5887, lng: 98.4868, description: 'จุดสูงสุดของสยาม อากาศเย็นตลอดปี มีเส้นทางกิ่วแม่ปาน', image: 'https://images.unsplash.com/photo-1580193183317-068303f88975' },
  { name: 'ดอยหลวงเชียงดาว', province: 'เชียงใหม่', region: 'เหนือ', type: ['เดินป่า', 'ดูดาว'], difficulty: 'ยาก', rating: 4.9, lat: 19.3930, lng: 98.8830, description: 'ยอดเขาสูงอันดับ 3 ของไทย โดดเด่นด้วยพรรณไม้กึ่งอัลไพน์', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b' },
  { name: 'ม่อนจอง', province: 'เชียงใหม่', region: 'เหนือ', type: ['เดินป่า', 'แคมป์ปิ้ง'], difficulty: 'ปานกลาง', rating: 4.7, lat: 17.5461, lng: 98.5125, description: 'ภูเขาหัวสิงห์ และทุ่งหญ้าสีทองกว้างไกล', image: 'https://images.unsplash.com/photo-1520113232655-6b1d7d70eddf' },
  { name: 'แม่กำปอง', province: 'เชียงใหม่', region: 'เหนือ', type: ['ถ่ายรูป', 'ริมน้ำ'], difficulty: 'ง่าย', rating: 4.6, lat: 18.8655, lng: 99.3516, description: 'หมู่บ้านเล็กๆ กลางหุบเขา อากาศเย็นสบายและวิถีชีวิตดั้งเดิม', image: 'https://images.unsplash.com/photo-1510797215324-95aa89f43c33' },
  { name: 'ม่อนแจ่ม', province: 'เชียงใหม่', region: 'เหนือ', type: ['ถ่ายรูป', 'แคมป์ปิ้ง'], difficulty: 'ง่าย', rating: 4.3, lat: 18.9360, lng: 98.8220, description: 'ทุ่งดอกไม้เมืองหนาวและวิวมุมกว้างของยอดเขา', image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470' },
  { name: 'ขุนช่างเคี่ยน', province: 'เชียงใหม่', region: 'เหนือ', type: ['ถ่ายรูป'], difficulty: 'ปานกลาง', rating: 4.5, lat: 18.8390, lng: 98.8970, description: 'จุดชมซากุระเมืองไทยหรือดอกพญาเสือโคร่งยอดนิยม', image: 'https://images.unsplash.com/photo-1493246507139-91e8bef99c02' },
  { name: 'ภูชี้ฟ้า', province: 'เชียงราย', region: 'เหนือ', type: ['ดูดาว', 'เดินป่า'], difficulty: 'ปานกลาง', rating: 4.9, lat: 19.8510, lng: 100.4530, description: 'หน้าผาสูงยอดแหลมที่ชี้ขึ้นฟ้า จุดชมทะเลหมอกที่สวยที่สุด', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb' },
  { name: 'ดอยผาตั้ง', province: 'เชียงราย', region: 'เหนือ', type: ['ถ่ายรูป', 'เดินป่า'], difficulty: 'ปานกลาง', rating: 4.7, lat: 19.9320, lng: 100.5160, description: 'จุดชมวิวไทย-ลาว และดอกไม้นานาพันธุ์', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e' },
  { name: 'ภูชี้ดาว', province: 'เชียงราย', region: 'เหนือ', type: ['เดินป่า', 'ดูดาว'], difficulty: 'ยาก', rating: 4.8, lat: 19.8790, lng: 100.4820, description: 'จุดชมทะเลหมอก 360 องศาที่ยังคงความดิบและธรรมชาติ', image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e' },
  { name: 'ปางอุ๋ง', province: 'แม่ฮ่องสอน', region: 'เหนือ', type: ['ริมน้ำ', 'แคมป์ปิ้ง'], difficulty: 'ง่าย', rating: 4.8, lat: 19.4991, lng: 97.9086, description: 'ทะเลสาบในม่านหมอกและทิวสน สวิตเซอร์แลนด์เมืองไทย', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef' },
  { name: 'บ้านรักไทย', province: 'แม่ฮ่องสอน', region: 'เหนือ', type: ['ถ่ายรูป', 'ริมน้ำ'], difficulty: 'ง่าย', rating: 4.7, lat: 19.5855, lng: 97.9427, description: 'หมู่บ้านชาวจีนยูนนานกลางหุบเขา มีไร่ชาและบ้านดิน', image: 'https://images.unsplash.com/photo-1518173946687-a4c8a9833d8e' },
  { name: 'ทุ่งดอกบัวตอง ดอยแม่อูคอ', province: 'แม่ฮ่องสอน', region: 'เหนือ', type: ['ถ่ายรูป'], difficulty: 'ปานกลาง', rating: 4.6, lat: 18.8950, lng: 98.0870, description: 'ทุ่งดอกไม้สีเหลืองอร่ามเต็มขุนเขาในช่วงปลายปี', image: 'https://images.unsplash.com/photo-1490750916424-85a05b659ad0' },
  { name: 'ภูสอยดาว', province: 'อุตรดิตถ์', region: 'เหนือ', type: ['เดินป่า', 'แคมป์ปิ้ง'], difficulty: 'ยาก', rating: 4.9, lat: 17.7530, lng: 100.9520, description: 'ทุ่งดอกหงอนนาคและป่าสนที่สวยที่สุดในหน้าฝน', image: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716' },
  { name: 'ดอยเสมอดาว', province: 'น่าน', region: 'เหนือ', type: ['ดูดาว', 'แคมป์ปิ้ง'], difficulty: 'ง่าย', rating: 4.8, lat: 18.3616, lng: 100.5147, description: 'สัมผัสทะเลหมอกยามเช้า และนอนนับดาวเคียงดาวในยามคืน', image: 'https://images.unsplash.com/photo-1444464666168-49d633b867ad' },
  { name: 'ถนนเลข 3', province: 'น่าน', region: 'เหนือ', type: ['ถ่ายรูป'], difficulty: 'ง่าย', rating: 4.5, lat: 19.0322, lng: 100.9981, description: 'ถนนสวยโค้งเลข 3 แลนด์มาร์คถ่ายรูปสุดฮิตในจังหวัดน่าน', image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e' },
  { name: 'บ่อเกลือโบราณ', province: 'น่าน', region: 'เหนือ', type: ['ถ่ายรูป'], difficulty: 'ง่าย', rating: 4.4, lat: 19.1495, lng: 101.1545, description: 'บ่อเกลือภูเขาหนึ่งเดียวในโลกที่ยังคงวิธีการผลิตแบบโบราณ', image: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d' },
  { name: 'ภูลังกา', province: 'พะเยา', region: 'เหนือ', type: ['ถ่ายรูป', 'ดูดาว'], difficulty: 'ปานกลาง', rating: 4.7, lat: 19.3490, lng: 100.5160, description: 'จุดชมวิวเขาหินปูนท่ามกลางทะเลหมอกที่สวยงามระดับโลก', image: 'https://images.unsplash.com/photo-1516214104703-d870798883c5' },
  { name: 'กว๊านพะเยา', province: 'พะเยา', region: 'เหนือ', type: ['ริมน้ำ', 'ถ่ายรูป'], difficulty: 'ง่าย', rating: 4.5, lat: 19.1666, lng: 99.9022, description: 'ทะเลสาบน้ำจืดขนาดใหญ่ที่สุดในภาคเหนือ', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e' },
  { name: 'น้ำตกทีลอซู', province: 'ตาก', region: 'เหนือ', type: ['ริมน้ำ', 'เดินป่า'], difficulty: 'ยาก', rating: 5.0, lat: 17.5667, lng: 98.1167, description: 'ราชาแห่งน้ำตกไทย ความยิ่งใหญ่ระดับเอเชีย', image: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8' },
  { name: 'ดอยขุนตาน', province: 'ลำพูน', region: 'เหนือ', type: ['เดินป่า', 'แคมป์ปิ้ง'], difficulty: 'ปานกลาง', rating: 4.4, lat: 18.4910, lng: 99.2720, description: 'อุทยานที่นั่งรถไฟไปเที่ยวได้ มีอุโมงค์รถไฟที่ยาวที่สุด', image: 'https://images.unsplash.com/photo-1511497584788-876760111969' },
  { name: 'ทุ่งแสลงหลวง', province: 'พิษณุโลก', region: 'เหนือ', type: ['แคมป์ปิ้ง', 'พายเรือ'], difficulty: 'ง่าย', rating: 4.6, lat: 16.5819, lng: 100.8831, description: 'ทุ่งหญ้าสะวันนาเมืองไทย กว้างใหญ่และอากาศดี', image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9' },
  { name: 'ภูทับเบิก', province: 'เพชรบูรณ์', region: 'เหนือ', type: ['แคมป์ปิ้ง', 'ถ่ายรูป'], difficulty: 'ปานกลาง', rating: 4.7, lat: 16.6000, lng: 101.0667, description: 'ยอดเขาที่สูงที่สุดของเพชรบูรณ์ กับไร่กะหล่ำปลีสุดลูกหูลูกตา', image: 'https://images.unsplash.com/photo-1510797215324-95aa89f43c33' },
  { name: 'เขาค้อ', province: 'เพชรบูรณ์', region: 'เหนือ', type: ['แคมป์ปิ้ง', 'ถ่ายรูป'], difficulty: 'ง่าย', rating: 4.6, lat: 16.7333, lng: 101.0500, description: 'สวิตเซอร์แลนด์เมืองไทย ทะเลหมอกหน้าฝนที่สวยงาม', image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470' },
  { name: 'อ่าวคุ้งกระเบน', province: 'จันทบุรี', region: 'ตะวันออก', type: ['ริมน้ำ', 'เดินป่า'], difficulty: 'ง่าย', rating: 4.5, lat: 12.6366, lng: 101.8841, description: 'ศูนย์ศึกษาธรรมชาติป่าชายเลนที่สมบูรณ์ที่สุด', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5' },
  { name: 'ดอยแม่สลอง', province: 'เชียงราย', region: 'เหนือ', type: ['ถ่ายรูป'], difficulty: 'ง่าย', rating: 4.6, lat: 20.1666, lng: 99.6166, description: 'วิถีชีวิตชาวไทยภูเขาและไร่ชาสีเขียวขจี', image: 'https://images.unsplash.com/photo-1518173946687-a4c8a9833d8e' },
  { name: 'น้ำพุร้อนฝาง', province: 'เชียงใหม่', region: 'เหนือ', type: ['ถ่ายรูป'], difficulty: 'ง่าย', rating: 4.4, lat: 19.9322, lng: 99.1678, description: 'บ่อน้ำพุร้อนธรรมชาติขนาดใหญ่ มีไอน้ำพุ่งสูงถึง 50 เมตร', image: 'https://images.unsplash.com/photo-1516214104703-d870798883c5' },
  { name: 'กิ่วแม่ปาน', province: 'เชียงใหม่', region: 'เหนือ', type: ['เดินป่า'], difficulty: 'ปานกลาง', rating: 4.9, lat: 18.5887, lng: 98.4868, description: 'เส้นทางเดินเท้าชมวิวที่เห็นทะเลหมอกได้อย่างสวยงาม', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb' },
  { name: 'วนอุทยานโกสัมพี', province: 'มหาสารคาม', region: 'อีสาน', type: ['ถ่ายรูป'], difficulty: 'ง่าย', rating: 4.2, lat: 16.2416, lng: 103.2666, description: 'ที่ตั้งของลิงแสมสีทองหายาก และป่าริมน้ำชี', image: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716' },
  { name: 'ผาช่อ', province: 'เชียงใหม่', region: 'เหนือ', type: ['ถ่ายรูป', 'เดินป่า'], difficulty: 'ง่าย', rating: 4.4, lat: 18.5190, lng: 98.7420, description: 'ปรากฏการณ์ทางธรรมชาติจากการกัดเซาะจนเป็นประติมากรรมหินทราย', image: 'https://images.unsplash.com/photo-1520113232655-6b1d7d70eddf' },
  { name: 'หุบป่าตาด', province: 'อุทัยธานี', region: 'กลาง', type: ['เดินป่า', 'ถ่ายรูป'], difficulty: 'ง่าย', rating: 4.7, lat: 15.3780, lng: 99.6290, description: 'ป่าดึกดำบรรพ์ที่ซ่อนตัวอยู่ในถ้ำ ให้ความรู้สึกเหมือนหลุดเข้าสู่โลกยุคไดโนเสาร์', image: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8' },

  // --- ภาคอีสาน (25 แห่ง) ---
  { name: 'ภูกระดึง', province: 'เลย', region: 'อีสาน', type: ['เดินป่า', 'แคมป์ปิ้ง'], difficulty: 'ยาก', rating: 5.0, lat: 16.8667, lng: 101.7833, description: 'ตำนานการพิสูจน์รักแท้ เส้นทาง 9 กม. ที่สวยงามคุ้มค่า', image: 'https://images.unsplash.com/photo-1511497584788-876760111969' },
  { name: 'ภูเรือ', province: 'เลย', region: 'อีสาน', type: ['แคมป์ปิ้ง', 'ดูดาว'], difficulty: 'ง่าย', rating: 4.6, lat: 17.5133, lng: 101.3411, description: 'เมืองที่หนาวที่สุดในสยาม ยอดเขารูปเรือสำเภา', image: 'https://images.unsplash.com/photo-1516214104703-d870798883c5' },
  { name: 'เชียงคาน', province: 'เลย', region: 'อีสาน', type: ['ถ่ายรูป', 'ริมน้ำ'], difficulty: 'ง่าย', rating: 4.7, lat: 17.8920, lng: 101.6520, description: 'หมู่บ้านเก่าแก่ริมโขง บรรยากาศสุดสโลว์ไลฟ์', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e' },
  { name: 'ภูป่าเปาะ', province: 'เลย', region: 'อีสาน', type: ['ถ่ายรูป'], difficulty: 'ง่าย', rating: 4.5, lat: 17.1510, lng: 101.7310, description: 'ฟูจิเมืองเลย จุดชมวิวภูหอที่มีลักษณะคล้ายภูเขาไฟฟูจิ', image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470' },
  { name: 'ผาแต้ม', province: 'อุบลราชธานี', region: 'อีสาน', type: ['ถ่ายรูป', 'ดูดาว'], difficulty: 'ง่าย', rating: 4.8, lat: 15.3980, lng: 105.5080, description: 'ภาพเขียนสีก่อนประวัติศาสตร์และแสงแรกของเมืองไทย', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb' },
  { name: 'สามพันโบก', province: 'อุบลราชธานี', region: 'อีสาน', type: ['ถ่ายรูป', 'ริมน้ำ'], difficulty: 'ปานกลาง', rating: 4.7, lat: 15.7936, lng: 105.3936, description: 'แกรนด์แคนยอนเมืองไทย หลุมหินทรายใต้ลำน้ำโขง', image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e' },
  { name: 'ทุ่งดอกกระเจียว อุทยานฯ ป่าหินงาม', province: 'ชัยภูมิ', region: 'อีสาน', type: ['ถ่ายรูป', 'เดินป่า'], difficulty: 'ง่าย', rating: 4.6, lat: 15.6310, lng: 101.3930, description: 'ทุ่งดอกไม้งามกลางป่าหินในช่วงฤดูฝน', image: 'https://images.unsplash.com/photo-1490750916424-85a05b659ad0' },
  { name: 'มอหินขาว', province: 'ชัยภูมิ', region: 'อีสาน', type: ['ถ่ายรูป', 'ดูดาว'], difficulty: 'ง่าย', rating: 4.5, lat: 16.0375, lng: 101.9861, description: 'สโตนเฮนจ์เมืองไทย กลุ่มหินทรายรูปทรงแปลกประหลาด', image: 'https://images.unsplash.com/photo-1444464666168-49d633b867ad' },
  { name: 'ผามออีแดง', province: 'ศรีสะเกษ', region: 'อีสาน', type: ['ถ่ายรูป'], difficulty: 'ง่าย', rating: 4.6, lat: 14.3930, lng: 104.6830, description: 'จุดชมวิวพรมแดนไทย-กัมพูชา และภาพแกะสลักนูนต่ำ', image: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716' },
  { name: 'หินสามวาฬ', province: 'บึงกาฬ', region: 'อีสาน', type: ['ถ่ายรูป', 'เดินป่า'], difficulty: 'ปานกลาง', rating: 4.9, lat: 18.2320, lng: 103.6210, description: 'กลุ่มหินขนาดใหญ่รูปทรงวาฬแม่ลูกบนยอดภูสิงห์', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b' },
  { name: 'ภูทอก', province: 'บึงกาฬ', region: 'อีสาน', type: ['เดินป่า', 'ถ่ายรูป'], difficulty: 'ยาก', rating: 4.8, lat: 18.1320, lng: 103.8820, description: 'สะพานไม้เวียนรอบภูเขาสูง ความศรัทธาและความเสียว', image: 'https://images.unsplash.com/photo-1520113232655-6b1d7d70eddf' },
  { name: 'ทะเลบัวแดง', province: 'อุดรธานี', region: 'อีสาน', type: ['ถ่ายรูป', 'ริมน้ำ'], difficulty: 'ง่าย', rating: 4.7, lat: 17.2250, lng: 103.0420, description: 'บัวสายสีชมพูแดงบานสะพรั่งเต็มบึงหนองหาน', image: 'https://images.unsplash.com/photo-1510797215324-95aa89f43c33' },
  { name: 'อุทยานฯ ไทรทอง', province: 'ชัยภูมิ', region: 'อีสาน', type: ['ถ่ายรูป', 'เดินป่า'], difficulty: 'ปานกลาง', rating: 4.5, lat: 15.8670, lng: 101.5030, description: 'ผาหำหดที่น่าตื่นเต้น และทุ่งดอกกระเจียวสีชมพู', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5' },
  { name: 'พนมรุ้ง', province: 'บุรีรัมย์', region: 'อีสาน', type: ['ถ่ายรูป'], difficulty: 'ง่าย', rating: 4.8, lat: 14.5320, lng: 102.9410, description: 'ปราสาทหินทรายบนยอดภูเขาไฟเก่าที่สวยที่สุดในไทย', image: 'https://images.unsplash.com/photo-1516214104703-d870798883c5' },
  { name: 'ทุ่งกะมัง', province: 'ชัยภูมิ', region: 'อีสาน', type: ['ถ่ายรูป'], difficulty: 'ง่าย', rating: 4.6, lat: 16.2080, lng: 101.5670, description: 'พื้นที่ราบทุ่งหญ้าบนเขาสูง แหล่งอาศัยของฝูงเนื้อทราย', image: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8' },
  { name: 'ภูห้วยอีสัน', province: 'หนองคาย', region: 'อีสาน', type: ['ดูดาว', 'ถ่ายรูป'], difficulty: 'ง่าย', rating: 4.7, lat: 18.0650, lng: 102.1670, description: 'จุดชมทะเลหมอกริมแม่น้ำโขง Unseen หนองคาย', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb' },
  { name: 'พระธาตุพนม', province: 'นครพนม', region: 'อีสาน', type: ['ถ่ายรูป'], difficulty: 'ง่าย', rating: 4.9, lat: 16.9420, lng: 104.7210, description: 'ปูชนียสถานอันศักดิ์สิทธิ์คู่บ้านคู่เมืองสองฝั่งโขง', image: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d' },
  { name: 'ภูเวียง', province: 'ขอนแก่น', region: 'อีสาน', type: ['เดินป่า', 'ถ่ายรูป'], difficulty: 'ปานกลาง', rating: 4.4, lat: 16.7410, lng: 102.2620, description: 'แหล่งขุดค้นไดโนเสาร์และธรรมชาติป่าเขาที่อุดมสมบูรณ์', image: 'https://images.unsplash.com/photo-1511497584788-876760111969' },
  { name: 'น้ำตกเหวสุวัต', province: 'นครราชสีมา', region: 'อีสาน', type: ['ริมน้ำ'], difficulty: 'ง่าย', rating: 4.6, lat: 14.4320, lng: 101.4170, description: 'น้ำตกชื่อดังในเขาใหญ่ มีสายน้ำตกลงมาจากหน้าผาสูง 20 เมตร', image: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8' },
  { name: 'ผาพญากูปรี', province: 'ศรีสะเกษ', region: 'อีสาน', type: ['ถ่ายรูป'], difficulty: 'ง่าย', rating: 4.3, lat: 14.3980, lng: 104.1420, description: 'จุดชมวิวแนวหน้าผาชายแดนไทย-กัมพูชา', image: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716' },
  { name: 'ภูแลนคา', province: 'ชัยภูมิ', region: 'อีสาน', type: ['แคมป์ปิ้ง', 'ถ่ายรูป'], difficulty: 'ง่าย', rating: 4.4, lat: 15.9320, lng: 101.8920, description: 'อุทยานที่มีกลุ่มหินและหน้าผาจุดชมวิวที่สวยงาม', image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9' },
  { name: 'แก่งคุดคู้', province: 'เลย', region: 'อีสาน', type: ['ริมน้ำ', 'ถ่ายรูป'], difficulty: 'ง่าย', rating: 4.5, lat: 17.9220, lng: 101.6920, description: 'แก่งหินขนาดใหญ่ขวางลำน้ำโขง มองเห็นฝั่งลาวได้ชัดเจน', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e' },
  { name: 'ภูสิงห์', province: 'บึงกาฬ', region: 'อีสาน', type: ['เดินป่า', 'ถ่ายรูป'], difficulty: 'ปานกลาง', rating: 4.8, lat: 18.2320, lng: 103.6210, description: 'สถานที่ตั้งของหินสามวาฬ จุดชมวิวที่สวยงามที่สุดในบึงกาฬ', image: 'https://images.unsplash.com/photo-1520113232655-6b1d7d70eddf' },
  { name: 'ภูผาเทิบ', province: 'มุกดาหาร', region: 'อีสาน', type: ['ถ่ายรูป', 'เดินป่า'], difficulty: 'ง่าย', rating: 4.3, lat: 16.4320, lng: 104.7210, description: 'กลุ่มหินมหัศจรรย์รูปทรงคล้ายร่ม ซ้อนทับกันตามธรรมชาติ', image: 'https://images.unsplash.com/photo-1510797215324-95aa89f43c33' },
  { name: 'ทุ่งกะมัง', province: 'ชัยภูมิ', region: 'อีสาน', type: ['ถ่ายรูป'], difficulty: 'ง่าย', rating: 4.6, lat: 16.2080, lng: 101.5670, description: 'อาณาจักรเนื้อทรายกลางทุ่งหญ้าบนเขาสูง', image: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8' },

  // --- ภาคกลาง และ ตะวันตก (20 แห่ง) ---
  { name: 'เขาใหญ่', province: 'นครราชสีมา', region: 'กลาง', type: ['เดินป่า', 'แคมป์ปิ้ง'], difficulty: 'ง่าย', rating: 4.9, lat: 14.4380, lng: 101.3700, description: 'มรดกโลกและป่าไม้ที่อุดมสมบูรณ์ที่สุดใกล้กรุงเทพฯ', image: 'https://images.unsplash.com/photo-1511497584788-876760111969' },
  { name: 'น้ำตกเอราวัณ', province: 'กาญจนบุรี', region: 'กลาง', type: ['ริมน้ำ', 'เดินป่า'], difficulty: 'ปานกลาง', rating: 4.8, lat: 14.3752, lng: 99.1444, description: 'น้ำตก 7 ชั้นที่มีน้ำสีฟ้ามรกตใสดุจกระจก', image: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8' },
  { name: 'สังขละบุรี', province: 'กาญจนบุรี', region: 'กลาง', type: ['ถ่ายรูป', 'ริมน้ำ'], difficulty: 'ง่าย', rating: 4.8, lat: 15.1520, lng: 98.4520, description: 'เมืองมนต์ขลัง สะพานไม้ที่ยาวที่สุดและวิถีชาวมอญ', image: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d' },
  { name: 'น้ำตกห้วยแม่ขมิ้น', province: 'กาญจนบุรี', region: 'กลาง', type: ['ริมน้ำ', 'แคมป์ปิ้ง'], difficulty: 'ง่าย', rating: 4.7, lat: 14.6380, lng: 99.0350, description: 'น้ำตกหินปูนที่สวยงาม อากาศเย็นสบายตลอดทั้งปี', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef' },
  { name: 'พุเตย', province: 'สุพรรณบุรี', region: 'กลาง', type: ['แคมป์ปิ้ง', 'เดินป่า'], difficulty: 'ปานกลาง', rating: 4.3, lat: 14.9320, lng: 99.4170, description: 'ยอดเขาสูงสุดของสุพรรณบุรี และป่าสนสองใบผืนสุดท้ายของภาคกลาง', image: 'https://images.unsplash.com/photo-1520113232655-6b1d7d70eddf' },
  { name: 'เจ็ดคต-โป่งก้อนเส้า', province: 'สระบุรี', region: 'กลาง', type: ['แคมป์ปิ้ง', 'ริมน้ำ'], difficulty: 'ง่าย', rating: 4.4, lat: 14.4820, lng: 101.1620, description: 'จุดกางเต็นท์ริมอ่างเก็บน้ำยอดฮิต บรรยากาศเงียบสงบ', image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9' },
  { name: 'แก่งกระจาน', province: 'เพชรบุรี', region: 'ตะวันตก', type: ['พายเรือ', 'ดูดาว'], difficulty: 'ง่าย', rating: 4.6, lat: 12.8910, lng: 99.6420, description: 'อุทยานที่กว้างใหญ่และจุดดูผีเสื้อที่น่าตื่นตาตื่นใจ', image: 'https://images.unsplash.com/photo-1516214104703-d870798883c5' },
  { name: 'เขาพะเนินทุ่ง', province: 'เพชรบุรี', region: 'ตะวันตก', type: ['แคมป์ปิ้ง', 'ดูดาว'], difficulty: 'ยาก', rating: 4.7, lat: 12.8320, lng: 99.3670, description: 'จุดชมทะเลหมอกที่เห็นได้ตลอดทั้งปีแม้ในช่วงฤดูร้อน', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb' },
  { name: 'ทองผาภูมิ', province: 'กาญจนบุรี', region: 'กลาง', type: ['เดินป่า', 'แคมป์ปิ้ง'], difficulty: 'ปานกลาง', rating: 4.5, lat: 14.7410, lng: 98.6320, description: 'ดินแดนแห่งขุนเขาและหมอก สัมผัสวิถีชีวิตคนเหมืองเก่า', image: 'https://images.unsplash.com/photo-1510797215324-95aa89f43c33' },
  { name: 'น้ำตกปิเต็งโกร', province: 'ตาก', region: 'ตะวันตก', type: ['เดินป่า', 'ริมน้ำ'], difficulty: 'ยาก', rating: 4.9, lat: 16.0320, lng: 98.7410, description: 'น้ำตกรูปหัวใจ กลางป่าลึกอุ้มผาง', image: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8' },
  { name: 'ถ้ำพระยานคร', province: 'ประจวบคีรีขันธ์', region: 'ตะวันตก', type: ['เดินป่า', 'ถ่ายรูป'], difficulty: 'ปานกลาง', rating: 4.8, lat: 12.1930, lng: 99.9820, description: 'พลับพลาที่ตั้งสง่าอยู่ในถ้ำขนาดใหญ่ แสงส่องสว่างยามเช้า', image: 'https://images.unsplash.com/photo-1516214104703-d870798883c5' },
  { name: 'เขาสามร้อยยอด', province: 'ประจวบคีรีขันธ์', region: 'ตะวันตก', type: ['ถ่ายรูป', 'ริมน้ำ'], difficulty: 'ง่าย', rating: 4.6, lat: 12.2170, lng: 99.9670, description: 'จุดชมวิวบึงบัวและเขาหินปูนเรียงรายริมทะเล', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e' },
  { name: 'กุยบุรี', province: 'ประจวบคีรีขันธ์', region: 'ตะวันตก', type: ['ส่องสัตว์'], difficulty: 'ง่าย', rating: 4.7, lat: 12.1156, lng: 99.6306, description: 'ซาฟารีเมืองไทย ชมช้างป่าและกระทิงออกมาหากิน', image: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716' },
  { name: 'อุทยานฯ ไทรโยค', province: 'กาญจนบุรี', region: 'กลาง', type: ['ริมน้ำ', 'พายเรือ'], difficulty: 'ง่าย', rating: 4.5, lat: 14.4330, lng: 98.8500, description: 'น้ำตกไทรโยคน้อยและไทรโยคใหญ่ ริมแม่น้ำแควน้อย', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5' },
  { name: 'เขาล้อมหมวก', province: 'ประจวบคีรีขันธ์', region: 'ตะวันตก', type: ['เดินป่า'], difficulty: 'ยาก', rating: 4.8, lat: 11.8170, lng: 99.8170, description: 'จุดชมวิวอ่าวประจวบแบบ 360 องศา และถิ่นที่อยู่ของค่างแว่น', image: 'https://images.unsplash.com/photo-1520113232655-6b1d7d70eddf' },
  { name: 'น้ำตกสาริกา', province: 'นครนายก', region: 'กลาง', type: ['ริมน้ำ'], difficulty: 'ง่าย', rating: 4.4, lat: 14.3170, lng: 101.2500, description: 'น้ำตกขนาดใหญ่ 9 ชั้น ไหลลงมาอย่างสวยงามตลอดปี', image: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8' },
  { name: 'อุทยานฯ เจ็ดสาวน้อย', province: 'สระบุรี', region: 'กลาง', type: ['ริมน้ำ'], difficulty: 'ง่าย', rating: 4.3, lat: 14.7170, lng: 101.1820, description: 'น้ำตกน้ำใสไหลรินตลอดปี พื้นที่พักผ่อนใกล้ชิดธรรมชาติ', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e' },
  { name: 'เขาช่องลม', province: 'นครนายก', region: 'กลาง', type: ['ถ่ายรูป', 'ริมน้ำ'], difficulty: 'ปานกลาง', rating: 4.6, lat: 14.3170, lng: 101.3170, description: 'หุบเขาลึกที่มีลำน้ำไหลผ่าน กรีนแลนด์เมืองไทยในหน้าฝน', image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9' },
  { name: 'หุบเขาดินพอก', province: 'กาญจนบุรี', region: 'กลาง', type: ['ถ่ายรูป'], difficulty: 'ง่าย', rating: 4.2, lat: 14.2320, lng: 99.3170, description: 'ประติมากรรมหินทรายและดินที่เกิดจากธรรมชาติกัดเซาะ', image: 'https://images.unsplash.com/photo-1510797215324-95aa89f43c33' },
  { name: 'ทุ่งหญ้าสวรรค์', province: 'เพชรบุรี', region: 'ตะวันตก', type: ['ถ่ายรูป'], difficulty: 'ง่าย', rating: 4.4, lat: 12.8320, lng: 99.7170, description: 'ทุ่งหญ้ากว้างใหญ่สีทองในช่วงปลายปี บรรยากาศเงียบสงบ', image: 'https://images.unsplash.com/photo-1444464666168-49d633b867ad' },

  // --- ภาคตะวันออก (10 แห่ง) ---
  { name: 'เกาะช้าง', province: 'ตราด', region: 'ตะวันออก', type: ['ริมน้ำ', 'แคมป์ปิ้ง'], difficulty: 'ง่าย', rating: 4.7, lat: 12.0833, lng: 102.3167, description: 'เกาะขนาดใหญ่ที่มีทั้งน้ำตกและหาดทรายสวยงาม', image: 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5' },
  { name: 'เกาะเสม็ด', province: 'ระยอง', region: 'ตะวันออก', type: ['ริมน้ำ'], difficulty: 'ง่าย', rating: 4.5, lat: 12.5630, lng: 101.4670, description: 'ทรายขาวละเอียดและน้ำทะเลใสใกล้กรุงเทพฯ', image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206' },
  { name: 'เกาะกูด', province: 'ตราด', region: 'ตะวันออก', type: ['ริมน้ำ', 'พายเรือ'], difficulty: 'ง่าย', rating: 4.9, lat: 11.6666, lng: 102.5500, description: 'อัญมณีแห่งอ่าวไทย น้ำใสและความสงบที่เป็นส่วนตัว', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5' },
  { name: 'เขาคิชฌกูฏ', province: 'จันทบุรี', region: 'ตะวันออก', type: ['เดินป่า'], difficulty: 'ยาก', rating: 4.8, lat: 12.8320, lng: 102.1670, description: 'นมัสการรอยพระพุทธบาทพลวงบนยอดเขาสูง', image: 'https://images.unsplash.com/photo-1516214104703-d870798883c5' },
  { name: 'ทุ่งโปร่งทอง', province: 'ระยอง', region: 'ตะวันออก', type: ['ถ่ายรูป', 'เดินป่า'], difficulty: 'ง่าย', rating: 4.6, lat: 12.7120, lng: 101.7170, description: 'ทุ่งต้นโป่งสีเหลืองทองสะท้อนแสงแดดยามเช้า', image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e' },
  { name: 'เขาแหลมหญ้า', province: 'ระยอง', region: 'ตะวันออก', type: ['แคมป์ปิ้ง', 'ถ่ายรูป'], difficulty: 'ง่าย', rating: 4.6, lat: 12.5830, lng: 101.4500, description: 'จุดกางเต็นท์ริมทะเลและเส้นทางเดินชมธรรมชาติหน้าผา', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e' },
  { name: 'เกาะขาม', province: 'ชลบุรี', region: 'ตะวันออก', type: ['ริมน้ำ', 'ดำน้ำ'], difficulty: 'ง่าย', rating: 4.7, lat: 12.5670, lng: 100.9500, description: 'เกาะอนุรักษ์น้ำใสปิ๊ง ดำน้ำดูปะการังใกล้ๆ สัตหีบ', image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206' },
  { name: 'น้ำตกพลิ้ว', province: 'จันทบุรี', region: 'ตะวันออก', type: ['ริมน้ำ'], difficulty: 'ง่าย', rating: 4.4, lat: 12.5320, lng: 102.1670, description: 'น้ำตกน้ำใสและฝูงปลาพลวงจำนวนมาก ท่ามกลางป่าร่มรื่น', image: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8' },
  { name: 'เขาสอยดาว', province: 'จันทบุรี', region: 'ตะวันออก', type: ['เดินป่า', 'แคมป์ปิ้ง'], difficulty: 'ยาก', rating: 4.5, lat: 13.0320, lng: 102.1670, description: 'ป่าดิบชื้นขนาดใหญ่และน้ำตกสวยงาม 16 ชั้น', image: 'https://images.unsplash.com/photo-1511497584788-876760111969' },
  { name: 'หาดทรายดำ', province: 'ตราด', region: 'ตะวันออก', type: ['ถ่ายรูป'], difficulty: 'ง่าย', rating: 4.3, lat: 12.1670, lng: 102.4170, description: 'หนึ่งในหาดทรายดำมหัศจรรย์ของโลก ริมป่าชายเลน', image: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d' },

  // --- ภาคใต้ (15 แห่ง) ---
  { name: 'หมู่เกาะสิมิลัน', province: 'พังงา', region: 'ใต้', type: ['ริมน้ำ', 'ดำน้ำ'], difficulty: 'ง่าย', rating: 5.0, lat: 8.6472, lng: 97.6397, description: 'สวรรค์แห่งอันดามัน น้ำใสดุจกระจกและหินเรือใบแลนด์มาร์ค', image: 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5' },
  { name: 'หมู่เกาะสุรินทร์', province: 'พังงา', region: 'ใต้', type: ['ดำน้ำ', 'แคมป์ปิ้ง'], difficulty: 'ง่าย', rating: 4.9, lat: 9.4120, lng: 97.8710, description: 'จุดดำน้ำตื้นที่ดีที่สุดและสัมผัสวิถีชีวิตชาวมอแกน', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5' },
  { name: 'อ่าวมาหยา', province: 'กระบี่', region: 'ใต้', type: ['ริมน้ำ'], difficulty: 'ง่าย', rating: 4.9, lat: 7.6775, lng: 98.7656, description: 'หาดทรายที่โอบล้อมด้วยภูเขาหินปูน มีชื่อเสียงระดับโลก', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e' },
  { name: 'เกาะหลีเป๊ะ', province: 'สตูล', region: 'ใต้', type: ['ริมน้ำ', 'ดำน้ำ'], difficulty: 'ง่าย', rating: 4.9, lat: 6.4890, lng: 99.3020, description: 'มัลดีฟส์เมืองไทย ทรายขาวละเอียดและปะการังที่สมบูรณ์', image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206' },
  { name: 'เขื่อนเชี่ยวหลาน', province: 'สุราษฎร์ธานี', region: 'ใต้', type: ['ริมน้ำ', 'พายเรือ'], difficulty: 'ง่าย', rating: 4.9, lat: 8.9770, lng: 98.8180, description: 'กุ้ยหลินเมืองไทย พักแพนอนกลางสายน้ำสีมรกต', image: 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5' },
  { name: 'เสม็ดนางชี', province: 'พังงา', region: 'ใต้', type: ['ถ่ายรูป', 'ดูดาว'], difficulty: 'ง่าย', rating: 4.8, lat: 8.2410, lng: 98.4520, description: 'จุดชมวิวอ่าวพังงาที่สวยที่สุด เห็นภูเขาหินปูนเรียงรายในทะเล', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb' },
  { name: 'ทะเลแหวก', province: 'กระบี่', region: 'ใต้', type: ['ริมน้ำ'], difficulty: 'ง่าย', rating: 4.7, lat: 7.9670, lng: 98.8170, description: 'ปรากฏการณ์ธรรมชาติเมื่อน้ำลดจะเกิดสันทรายเชื่อมต่อกัน', image: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d' },
  { name: 'แหลมพรหมเทพ', province: 'ภูเก็ต', region: 'ใต้', type: ['ถ่ายรูป'], difficulty: 'ง่าย', rating: 4.8, lat: 7.7590, lng: 98.3030, description: 'จุดชมพระอาทิตย์ตกที่สวยที่สุดและเป็นที่รู้จักไปทั่วโลก', image: 'https://images.unsplash.com/photo-1510797215324-95aa89f43c33' },
  { name: 'เกาะรอก', province: 'กระบี่', region: 'ใต้', type: ['ริมน้ำ', 'ดำน้ำ'], difficulty: 'ง่าย', rating: 4.8, lat: 7.2140, lng: 99.0680, description: 'ราชินีแห่งอันดามัน น้ำใสและปะการังหลากสีสัน', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5' },
  { name: 'อ่าวพังงา', province: 'พังงา', region: 'ใต้', type: ['ริมน้ำ', 'พายเรือ'], difficulty: 'ง่าย', rating: 4.7, lat: 8.4320, lng: 98.5320, description: 'ชมเขาพิงกันและเขาตะปู แลนด์มาร์คสำคัญจากหนังเจมส์ บอนด์', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e' },
  { name: 'เกาะเต่า', province: 'สุราษฎร์ธานี', region: 'ใต้', type: ['ดำน้ำ'], difficulty: 'ปานกลาง', rating: 4.9, lat: 10.0930, lng: 99.8410, description: 'ศูนย์กลางการเรียนดำน้ำระดับโลก และธรรมชาติใต้ทะเลที่สวยงาม', image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206' },
  { name: 'หาดไร่เลย์', province: 'กระบี่', region: 'ใต้', type: ['ถ่ายรูป', 'ริมน้ำ'], difficulty: 'ง่าย', rating: 4.8, lat: 8.0120, lng: 98.8320, description: 'สวรรค์ของนักปีนเขาและหาดทรายขาวที่โอบล้อมด้วยภูเขา', image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470' },
  { name: 'น้ำตกคลองลาน', province: 'กำแพงเพชร', region: 'ใต้', type: ['ริมน้ำ'], difficulty: 'ง่าย', rating: 4.7, lat: 16.1170, lng: 99.2820, description: 'น้ำตกที่ไหลลงมาเป็นม่านน้ำกว้างและสวยงามที่สุดแห่งหนึ่ง', image: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8' },
  { name: 'คลองน้ำใส', province: 'กระบี่', region: 'ใต้', type: ['พายเรือ', 'ริมน้ำ'], difficulty: 'ง่าย', rating: 4.6, lat: 8.1320, lng: 98.8170, description: 'พายเรือคายัคในคลองน้ำใสที่เห็นพื้นน้ำได้อย่างชัดเจน', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5' },
  { name: 'หมู่เกาะอ่างทอง', province: 'สุราษฎร์ธานี', region: 'ใต้', type: ['พายเรือ', 'ถ่ายรูป'], difficulty: 'ปานกลาง', rating: 4.7, lat: 9.6170, lng: 99.6670, description: 'หมู่เกาะหินปูนที่ตั้งเรียงรายและทะเลสาบน้ำเค็มในหุบเขา', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e' }

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

  // 2. ลบข้อมูลเดิมทั้งหมด
  console.log('🗑️  กำลังลบข้อมูลเดิม...')
  const snapshot = await getDocs(collection(db, 'places'))
  for (const d of snapshot.docs) {
    await deleteDoc(d.ref)
  }
  console.log(`✅ ลบแล้ว ${snapshot.size} รายการ`)

  // 3. เพิ่มข้อมูลใหม่
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
