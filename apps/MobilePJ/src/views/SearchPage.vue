<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="search-toolbar">
        <div class="searchbar-wrap">
          <ion-icon :icon="searchOutline" class="search-icon" />
          <input
            v-model="searchTerm"
            type="text"
            class="search-input"
            placeholder="ค้นหาชื่อ, จังหวัด..."
          />
          <button v-if="searchTerm" class="clear-btn" @click="searchTerm = ''">
            <ion-icon :icon="closeCircleOutline" />
          </button>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <!-- Type Filter Chips -->
      <div class="chips-row">
        <button
          v-for="t in typeFilters"
          :key="t.value"
          :class="['chip-btn', selectedType === t.value ? 'chip-active' : '']"
          @click="selectedType = t.value"
        >
          {{ t.label }}
        </button>
      </div>

      <!-- Advanced Filters -->
      <div class="filter-row">
        <ion-select
          v-model="selectedRegion"
          placeholder="🌐 ภูมิภาค"
          interface="action-sheet"
          class="filter-select"
        >
          <ion-select-option value="">ทุกภูมิภาค</ion-select-option>
          <ion-select-option value="เหนือ">ภาคเหนือ</ion-select-option>
          <ion-select-option value="กลาง">ภาคกลาง</ion-select-option>
          <ion-select-option value="อีสาน">ภาคอีสาน</ion-select-option>
          <ion-select-option value="ตะวันออก">ภาคตะวันออก</ion-select-option>
          <ion-select-option value="ใต้">ภาคใต้</ion-select-option>
          <ion-select-option value="ตะวันตก">ภาคตะวันตก</ion-select-option>
        </ion-select>
        <ion-select
          v-model="selectedDifficulty"
          placeholder=" ความยาก"
          interface="action-sheet"
          class="filter-select"
        >
          <ion-select-option value="">ทุกระดับ</ion-select-option>
          <ion-select-option value="ง่าย">ง่าย</ion-select-option>
          <ion-select-option value="ปานกลาง">ปานกลาง</ion-select-option>
          <ion-select-option value="ยาก">ยาก</ion-select-option>
        </ion-select>
        <ion-select
          v-model="minRating"
          placeholder="⭐ คะแนน"
          interface="action-sheet"
          class="filter-select"
        >
          <ion-select-option :value="0">ทุกคะแนน</ion-select-option>
          <ion-select-option :value="3">3+ ⭐</ion-select-option>
          <ion-select-option :value="4">4+ ⭐</ion-select-option>
          <ion-select-option :value="4.5">4.5+ ⭐</ion-select-option>
        </ion-select>
      </div>

      <!-- Results Count -->
      <div class="result-count" v-if="!loading">
        <span>พบ </span><strong>{{ filteredPlaces.length }}</strong><span> สถานที่</span>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-state">
        <ion-spinner name="crescent" color="primary" />
        <p class="loading-text">กำลังโหลดข้อมูล...</p>
      </div>

      <!-- Results -->
      <div v-else-if="filteredPlaces.length > 0" class="results-list">
        <CampCard
          v-for="place in filteredPlaces"
          :key="place.id"
          :place="place"
          @click="router.push(`/detail/${place.id}`)"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-icon">🌿</div>
        <h3 class="empty-title">ไม่พบสถานที่</h3>
        <p class="empty-desc">ลองเปลี่ยนตัวกรองอื่น หรือค้นหาด้วยคำอื่น</p>
        <button class="reset-btn" @click="resetFilters">ล้างตัวกรองทั้งหมด</button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonPage, IonHeader, IonToolbar, IonContent, IonIcon,
  IonSelect, IonSelectOption,
  IonSpinner
} from '@ionic/vue'
import { searchOutline, closeCircleOutline } from 'ionicons/icons'
import { collection, onSnapshot, query } from 'firebase/firestore'
import { db } from '../firebase/config'
import CampCard from '../components/CampCard.vue'

interface Place {
  id: string
  name: string
  province: string
  region: string
  type: string[]
  difficulty: string
  rating: number
  reviewCount: number
  image: string
  description: string
  lat: number
  lng: number
}

const router = useRouter()
const places = ref<Place[]>([])
const loading = ref(true)
const searchTerm = ref('')
const selectedType = ref('')
const selectedRegion = ref('')
const selectedDifficulty = ref('')
const minRating = ref(0)

let unsubscribe: (() => void) | null = null

const typeFilters = [
  { label: '🌿 ทั้งหมด', value: '' },
  { label: '⛺ แคมป์ปิ้ง', value: 'แคมป์ปิ้ง' },
  { label: '🥾 เดินป่า', value: 'เดินป่า' },
  { label: '💧 ริมน้ำ', value: 'ริมน้ำ' },
  { label: '🌠 ดูดาว', value: 'ดูดาว' }
]

onMounted(() => {
  unsubscribe = onSnapshot(query(collection(db, 'places')), (snap) => {
    places.value = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Place))
    loading.value = false
  })
})

onUnmounted(() => unsubscribe?.())

const filteredPlaces = computed(() => {
  return places.value.filter((p) => {
    const matchName = !searchTerm.value || p.name.includes(searchTerm.value) || p.province.includes(searchTerm.value)
    const matchType = !selectedType.value || (p.type && p.type.includes(selectedType.value))
    const matchRegion = !selectedRegion.value || p.region === selectedRegion.value
    const matchDiff = !selectedDifficulty.value || p.difficulty === selectedDifficulty.value
    const matchRating = (p.rating || 0) >= minRating.value
    return matchName && matchType && matchRegion && matchDiff && matchRating
  })
})

const resetFilters = () => {
  searchTerm.value = ''
  selectedType.value = ''
  selectedRegion.value = ''
  selectedDifficulty.value = ''
  minRating.value = 0
}
</script>

<style scoped>
/* ─ Header ─ */
.search-toolbar {
  --background: #3DAA6B;
  --min-height: 52px;
}
.searchbar-wrap {
  display: flex; align-items: center;
  background: rgba(255,255,255,0.2);
  border: 1.5px solid rgba(255,255,255,0.4);
  border-radius: 14px;
  margin: 6px 12px 8px;
  padding: 0 14px;
  height: 44px;
  gap: 8px;
}
.search-icon {
  color: rgba(255,255,255,0.9); font-size: 18px; flex-shrink: 0;
}
.search-input {
  flex: 1;
  border: none; outline: none;
  background: transparent;
  font-size: 15px; color: #ffffff;
  font-family: 'Kanit', sans-serif;
}
.search-input::placeholder { color: rgba(255,255,255,0.7); }
.clear-btn {
  background: none; border: none;
  color: rgba(255,255,255,0.8); cursor: pointer;
  font-size: 18px; display: flex; align-items: center;
  padding: 0;
}

/* ─ Chips ─ */
.chips-row {
  display: flex; gap: 8px;
  padding: 12px 16px 8px;
  overflow-x: auto; scrollbar-width: none;
}
.chips-row::-webkit-scrollbar { display: none; }
.chip-btn {
  flex-shrink: 0;
  background: #F4F9F5;
  border: 1.5px solid #DAE8DA;
  border-radius: 999px;
  color: #4A6A4A;
  font-size: 13px; font-weight: 600;
  padding: 6px 14px;
  cursor: pointer;
  font-family: 'Kanit', sans-serif;
  transition: all 0.15s;
  white-space: nowrap;
}
.chip-btn.chip-active {
  background: #3DAA6B;
  border-color: #3DAA6B;
  color: #ffffff;
}

/* ─ Selects ─ */
.filter-row {
  display: flex; gap: 8px;
  padding: 0 16px 12px;
  overflow-x: auto; scrollbar-width: none;
}
.filter-row::-webkit-scrollbar { display: none; }
.filter-select {
  --background: #ffffff;
  --padding-start: 12px;
  --padding-end: 8px;
  --color: #1A2C1A;
  border: 1.5px solid #DAE8DA;
  border-radius: 12px;
  font-size: 13px; font-weight: 500;
  min-width: 108px; flex-shrink: 0;
  height: 38px;
}

/* ─ Result count ─ */
.result-count {
  padding: 2px 16px 10px;
  font-size: 14px; color: #5A7560;
}
.result-count strong { color: #3DAA6B; }

/* ─ List ─ */
.results-list {
  padding: 4px 16px 90px;
}

/* ─ Loading ─ */
.loading-state {
  display: flex; flex-direction: column;
  align-items: center; padding: 64px 0 40px;
  gap: 12px;
}
.loading-text {
  font-size: 14px; color: #8BAA8B; margin: 0;
}

/* ─ Empty ─ */
.empty-state {
  display: flex; flex-direction: column;
  align-items: center;
  padding: 64px 32px; text-align: center;
}
.empty-icon {
  font-size: 56px; margin-bottom: 16px;
}
.empty-title {
  font-size: 18px; font-weight: 700;
  color: #1A2C1A; margin: 0 0 8px;
}
.empty-desc {
  font-size: 14px; color: #8BAA8B;
  line-height: 1.6; margin: 0 0 20px;
}
.reset-btn {
  background: #3DAA6B;
  color: #fff;
  border: none;
  border-radius: 14px;
  padding: 12px 28px;
  font-size: 15px; font-weight: 600;
  font-family: 'Kanit', sans-serif;
  cursor: pointer;
}
</style>
