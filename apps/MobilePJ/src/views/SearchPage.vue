<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>ค้นหาสถานที่</ion-title>
      </ion-toolbar>
      <ion-toolbar color="primary">
        <ion-searchbar
          v-model="searchTerm"
          placeholder="ค้นหาสถานที่ท่องเที่ยว..."
          :debounce="300"
          show-cancel-button="never"
          class="custom-searchbar"
        />
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <!-- Type Filter Chips -->
      <div class="chips-row">
        <ion-chip
          v-for="t in typeFilters"
          :key="t.value"
          :color="selectedType === t.value ? 'primary' : 'light'"
          :outline="selectedType !== t.value"
          @click="selectedType = t.value"
          class="filter-chip"
        >
          {{ t.label }}
        </ion-chip>
      </div>

      <!-- Advanced Filters -->
      <div class="filter-row">
        <ion-select
          v-model="selectedRegion"
          placeholder="ภูมิภาค"
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
          placeholder="ความยาก"
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
          placeholder="คะแนน"
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
        พบ {{ filteredPlaces.length }} สถานที่
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-state">
        <ion-spinner name="crescent" color="primary" />
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
        <div class="empty-icon">🔍</div>
        <p>ไม่พบสถานที่ที่ค้นหา</p>
        <ion-button fill="outline" color="primary" @click="resetFilters">
          รีเซ็ตตัวกรอง
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonSearchbar, IonChip, IonSelect, IonSelectOption,
  IonSpinner, IonButton
} from '@ionic/vue'
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
ion-header ion-toolbar {
  --background: #2D6A4F;
  --color: #ffffff;
}

.custom-searchbar {
  --background: rgba(255,255,255,0.15);
  --color: #ffffff;
  --placeholder-color: rgba(255,255,255,0.7);
  --icon-color: rgba(255,255,255,0.8);
  --border-radius: 12px;
  padding: 4px 8px 8px;
}

.chips-row {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  overflow-x: auto;
  scrollbar-width: none;
}
.chips-row::-webkit-scrollbar { display: none; }

.filter-chip {
  flex-shrink: 0;
  --background: #f0ebe0;
  font-size: 13px;
}

.filter-row {
  display: flex;
  gap: 8px;
  padding: 0 16px 12px;
  overflow-x: auto;
  scrollbar-width: none;
}
.filter-row::-webkit-scrollbar { display: none; }

.filter-select {
  --background: #ffffff;
  --padding-start: 10px;
  --padding-end: 10px;
  border: 1px solid #d0c8b8;
  border-radius: 10px;
  font-size: 13px;
  min-width: 100px;
  flex-shrink: 0;
}

.result-count {
  padding: 0 16px 8px;
  font-size: 13px;
  color: #8B5E3C;
  font-weight: 500;
}

.results-list {
  padding: 0 16px 80px;
}

.loading-state {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}

.empty-state {
  text-align: center;
  padding: 60px 24px;
  color: #8B5E3C;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-state p {
  font-size: 16px;
  margin-bottom: 16px;
}
</style>
