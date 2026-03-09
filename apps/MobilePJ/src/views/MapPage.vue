<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="map-toolbar">
        <div class="app-header">
          <div class="app-header-left">
            <span class="app-logo">🏕️</span>
            <div>
              <p class="app-tagline">สำรวจธรรมชาติไทย</p>
              <h1 class="app-name">ไปกันเธอ</h1>
            </div>
          </div>
          <ion-button fill="clear" class="locate-header-btn" @click="locateMe">
            <ion-icon :icon="locateOutline" style="color:#ffffff;font-size:22px" />
          </ion-button>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="map-content">
      <!-- Map Section -->
      <div class="map-section">
        <div ref="mapContainer" class="map-container" />
        <!-- Search overlay on map -->
        <div class="search-bar-float">
          <div class="search-inner" @click="goToSearch">
            <ion-icon :icon="searchOutline" class="search-icon" />
            <span class="search-placeholder">ค้นหาสถานที่ท่องเที่ยว...</span>
          </div>
        </div>
      </div>

      <!-- Info Content (scrollable) -->
      <div class="info-content">
        <!-- Quick Stats -->
        <div class="stats-strip">
          <div class="stat-pill">
            <span class="stat-num">{{ totalPlaces }}</span>
            <span class="stat-lbl">สถานที่</span>
          </div>
          <div class="stat-divider" />
          <div class="stat-pill">
            <span class="stat-num">{{ totalProvinces }}</span>
            <span class="stat-lbl">จังหวัด</span>
          </div>
          <div class="stat-divider" />
          <div class="stat-pill">
            <span class="stat-num">{{ topRatedCount }}</span>
            <span class="stat-lbl">คะแนน 4.5+</span>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions">
          <button class="action-card" @click="goToSearch">
            <span class="action-icon">🔍</span>
            <span class="action-label">ค้นหา</span>
          </button>
          <button class="action-card" @click="router.push('/tabs/favorite')">
            <span class="action-icon">❤️</span>
            <span class="action-label">บันทึก</span>
          </button>
          <button class="action-card" @click="router.push('/tabs/profile')">
            <span class="action-icon">👤</span>
            <span class="action-label">โปรไฟล์</span>
          </button>
          <button class="action-card" @click="locateMe">
            <span class="action-icon">📍</span>
            <span class="action-label">ตำแหน่งฉัน</span>
          </button>
        </div>

        <!-- Nearby / Featured -->
        <div class="section">
          <div class="section-header">
            <h2 class="section-title">📌 สถานที่แนะนำ</h2>
            <button class="see-all-btn" @click="goToSearch">ดูทั้งหมด</button>
          </div>
          <div class="place-chips-row">
            <div
              v-for="place in featuredPlaces"
              :key="place.id"
              class="place-chip"
              @click="router.push(`/detail/${place.id}`)"
            >
              <div class="chip-img-wrap">
                <img v-if="place.image" :src="place.image" class="chip-img" :alt="place.name" />
                <div v-else class="chip-img-placeholder">🏕️</div>
              </div>
              <div class="chip-info">
                <span class="chip-name">{{ place.name }}</span>
                <span class="chip-province">{{ place.province }}</span>
                <span class="chip-rating">⭐ {{ (place.rating || 0).toFixed(1) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Difficulty breakdown -->
        <div class="section">
          <h2 class="section-title">🥾 ระดับความยาก</h2>
          <div class="diff-row">
            <div class="diff-card diff-easy-card" @click="router.push('/tabs/search')">
              <span class="diff-icon">😊</span>
              <span class="diff-name">ง่าย</span>
              <span class="diff-count">{{ easyCnt }} แห่ง</span>
            </div>
            <div class="diff-card diff-med-card" @click="router.push('/tabs/search')">
              <span class="diff-icon">🧗</span>
              <span class="diff-name">ปานกลาง</span>
              <span class="diff-count">{{ medCnt }} แห่ง</span>
            </div>
            <div class="diff-card diff-hard-card" @click="router.push('/tabs/search')">
              <span class="diff-icon">⛰️</span>
              <span class="diff-name">ยาก</span>
              <span class="diff-count">{{ hardCnt }} แห่ง</span>
            </div>
          </div>
        </div>
      </div>

      <div style="height:20px" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { IonPage, IonHeader, IonToolbar, IonContent, IonButton, IonIcon } from '@ionic/vue'
import { searchOutline, locateOutline } from 'ionicons/icons'
import L from 'leaflet'
import { collection, onSnapshot, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'

import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl })

const router = useRouter()
const mapContainer = ref<HTMLElement | null>(null)
let map: L.Map | null = null
let unsubscribe: (() => void) | null = null
const markers: L.Marker[] = []

const allPlaces = ref<any[]>([])
const featuredPlaces = ref<any[]>([])

const totalPlaces = computed(() => allPlaces.value.length)
const totalProvinces = computed(() => new Set(allPlaces.value.map((p) => p.province)).size)
const topRatedCount = computed(() => allPlaces.value.filter((p) => (p.rating || 0) >= 4.5).length)
const easyCnt = computed(() => allPlaces.value.filter((p) => p.difficulty === 'ง่าย').length)
const medCnt = computed(() => allPlaces.value.filter((p) => p.difficulty === 'ปานกลาง').length)
const hardCnt = computed(() => allPlaces.value.filter((p) => p.difficulty === 'ยาก').length)

const greenIcon = L.divIcon({
  className: '',
  html: `<div style="
    background: #3DAA6B;
    width:32px; height:32px;
    border-radius:50% 50% 50% 0;
    transform:rotate(-45deg);
    border:3px solid #fff;
    box-shadow:0 2px 10px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -34]
})

onMounted(async () => {
  // Load featured places
  try {
    const snap = await getDocs(query(collection(db, 'places'), orderBy('rating', 'desc'), limit(6)))
    featuredPlaces.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  } catch {}

  if (!mapContainer.value) return
  map = L.map(mapContainer.value, {
    center: [13.7563, 100.5018],
    zoom: 6,
    zoomControl: false,
    scrollWheelZoom: true,
    dragging: true,
  })
  L.control.zoom({ position: 'bottomright' }).addTo(map)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map)

  const q = query(collection(db, 'places'))
  unsubscribe = onSnapshot(q, (snapshot) => {
    markers.forEach((m) => m.remove())
    markers.length = 0
    allPlaces.value = []

    snapshot.forEach((doc) => {
      const place = doc.data()
      allPlaces.value.push({ id: doc.id, ...place })
      if (!place.lat || !place.lng || !map) return
      const marker = L.marker([place.lat, place.lng], { icon: greenIcon })
        .addTo(map!)
        .bindPopup(`
          <div style="font-family:'Kanit',sans-serif;min-width:160px;padding:4px">
            <strong style="font-size:14px;color:#1E6E43">${place.name}</strong><br/>
            <span style="color:#666;font-size:12px">${place.province}</span><br/>
            <span style="color:#3DAA6B;font-size:13px;font-weight:700">⭐ ${(place.rating || 0).toFixed(1)}</span>
            <br/><br/>
            <button onclick="window.dispatchEvent(new CustomEvent('go-detail',{detail:'${doc.id}'}))"
              style="background:#3DAA6B;color:#fff;border:none;border-radius:10px;padding:8px 12px;font-family:'Kanit',sans-serif;font-size:13px;cursor:pointer;width:100%;font-weight:600">
              ดูรายละเอียด →
            </button>
          </div>
        `, { maxWidth: 210 })
      markers.push(marker)
    })
  })

  window.addEventListener('go-detail', handleGoDetail)
})

onUnmounted(() => {
  unsubscribe?.()
  window.removeEventListener('go-detail', handleGoDetail)
  map?.remove()
})

const handleGoDetail = (e: Event) => {
  const event = e as CustomEvent
  router.push(`/detail/${event.detail}`)
}
const goToSearch = () => router.push('/tabs/search')

const locateMe = () => {
  if (!navigator.geolocation || !map) return
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      map!.setView([pos.coords.latitude, pos.coords.longitude], 13)
      L.marker([pos.coords.latitude, pos.coords.longitude])
        .addTo(map!)
        .bindPopup('คุณอยู่ที่นี่ 📍')
        .openPopup()
    },
    () => console.warn('Geolocation denied')
  )
}
</script>

<style scoped>
/* ── Header ── */
.map-toolbar {
  --background: #3DAA6B;
  --min-height: 60px;
}
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px 8px 16px;
}
.app-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.app-logo { font-size: 32px; line-height: 1; }
.app-tagline {
  font-size: 11px;
  color: rgba(255,255,255,0.8);
  margin: 0;
  font-weight: 500;
  letter-spacing: 0.3px;
}
.app-name {
  font-size: 20px;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
  letter-spacing: -0.3px;
  line-height: 1.1;
}
.locate-header-btn {
  --padding-start: 8px;
  --padding-end: 8px;
}

/* ── Map ── */
.map-content { --background: #F4F9F5; }

.map-section {
  position: relative;
  height: 52vh;
  min-height: 260px;
}
.map-container {
  width: 100%;
  height: 100%;
  z-index: 0;
}

/* ── Floating Search ── */
.search-bar-float {
  position: absolute;
  top: 12px;
  left: 14px;
  right: 14px;
  z-index: 1000;
}
.search-inner {
  display: flex;
  align-items: center;
  background: #ffffff;
  border-radius: 14px;
  padding: 11px 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.18);
  cursor: pointer;
  gap: 10px;
}
.search-icon { color: #3DAA6B; font-size: 18px; flex-shrink: 0; }
.search-placeholder {
  color: #8BAA8B;
  font-size: 14px;
  font-family: 'Kanit', sans-serif;
  font-weight: 500;
}

/* ── Info Content ── */
.info-content {
  background: #F4F9F5;
  padding: 16px 16px 0;
}

/* Stats Strip */
.stats-strip {
  display: flex;
  align-items: center;
  background: #3DAA6B;
  border-radius: 16px;
  padding: 14px 20px;
  margin-bottom: 16px;
}
.stat-pill { flex: 1; text-align: center; }
.stat-num {
  display: block;
  font-size: 22px;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.1;
}
.stat-lbl {
  font-size: 11px;
  color: rgba(255,255,255,0.82);
  font-weight: 500;
}
.stat-divider { width: 1px; height: 36px; background: rgba(255,255,255,0.3); }

/* Quick Actions */
.quick-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
.action-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  background: #ffffff;
  border: 1.5px solid #DAE8DA;
  border-radius: 14px;
  padding: 14px 6px;
  cursor: pointer;
  font-family: 'Kanit', sans-serif;
  transition: all 0.15s;
  box-shadow: 0 2px 8px rgba(61,170,107,0.07);
}
.action-card:active { background: #E8F8EF; border-color: #3DAA6B; }
.action-icon { font-size: 22px; }
.action-label { font-size: 11px; font-weight: 600; color: #4A6A4A; }

/* Section */
.section { margin-bottom: 20px; }
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.section-title {
  font-size: 16px;
  font-weight: 800;
  color: #1A2C1A;
  margin: 0 0 12px;
}
.section-header .section-title { margin: 0; }
.see-all-btn {
  background: none; border: none;
  color: #3DAA6B; font-size: 13px;
  font-weight: 700; cursor: pointer;
  font-family: 'Kanit', sans-serif; padding: 0;
}

/* Place Chips */
.place-chips-row {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 6px;
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.place-chips-row::-webkit-scrollbar { display: none; }
.place-chip {
  flex-shrink: 0;
  width: 140px;
  background: #ffffff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.07);
  border: 1px solid #DAE8DA;
  cursor: pointer;
  transition: transform 0.15s;
}
.place-chip:active { transform: scale(0.97); }
.chip-img-wrap { height: 80px; }
.chip-img { width: 100%; height: 100%; object-fit: cover; }
.chip-img-placeholder {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  font-size: 28px;
  background: linear-gradient(135deg, #E8F8EF, #A8D5B5);
}
.chip-info { padding: 8px 10px; }
.chip-name {
  display: block;
  font-size: 13px; font-weight: 700;
  color: #1A2C1A;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.chip-province { display: block; font-size: 11px; color: #8BAA8B; }
.chip-rating { display: block; font-size: 12px; font-weight: 700; color: #3DAA6B; margin-top: 2px; }

/* Difficulty */
.diff-row { display: flex; gap: 10px; }
.diff-card {
  flex: 1;
  display: flex; flex-direction: column;
  align-items: center; gap: 4px;
  border-radius: 14px; padding: 14px 8px;
  cursor: pointer; transition: transform 0.15s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
}
.diff-card:active { transform: scale(0.97); }
.diff-easy-card  { background: #DCFCE7; }
.diff-med-card   { background: #FEF9C3; }
.diff-hard-card  { background: #FEE2E2; }
.diff-icon { font-size: 24px; }
.diff-name { font-size: 12px; font-weight: 700; color: #1A2C1A; }
.diff-count { font-size: 11px; color: #6B7280; }
</style>

