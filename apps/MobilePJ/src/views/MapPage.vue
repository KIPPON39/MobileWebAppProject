<template>
  <ion-page>
    <div class="map-wrapper">
      <!-- Map -->
      <div ref="mapContainer" class="map-container" />

      <!-- Search Bar Floating -->
      <div class="search-bar-float">
        <div class="search-inner" @click="goToSearch">
          <ion-icon :icon="searchOutline" class="search-icon" />
          <span class="search-placeholder">ค้นหาสถานที่ท่องเที่ยว...</span>
        </div>
      </div>

      <!-- FAB Locate Me -->
      <ion-fab vertical="bottom" horizontal="end" slot="fixed" class="locate-fab">
        <ion-fab-button @click="locateMe" color="light">
          <ion-icon :icon="locateOutline" />
        </ion-fab-button>
      </ion-fab>
    </div>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { IonPage, IonFab, IonFabButton, IonIcon } from '@ionic/vue'
import { searchOutline, locateOutline } from 'ionicons/icons'
import L from 'leaflet'
import { collection, onSnapshot, query } from 'firebase/firestore'
import { db } from '../firebase/config'

// Fix Leaflet default icon
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

const greenIcon = L.divIcon({
  className: '',
  html: `<div style="
    background: #2D6A4F;
    width:32px; height:32px;
    border-radius:50% 50% 50% 0;
    transform:rotate(-45deg);
    border:3px solid #fff;
    box-shadow:0 2px 8px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -34]
})

onMounted(() => {
  if (!mapContainer.value) return

  map = L.map(mapContainer.value, {
    center: [13.7563, 100.5018],
    zoom: 6,
    zoomControl: true
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map)

  // Load places from Firestore
  const q = query(collection(db, 'places'))
  unsubscribe = onSnapshot(q, (snapshot) => {
    // Clear old markers
    markers.forEach((m) => m.remove())
    markers.length = 0

    snapshot.forEach((doc) => {
      const place = doc.data()
      if (!place.lat || !place.lng || !map) return

      const marker = L.marker([place.lat, place.lng], { icon: greenIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:'Kanit',sans-serif;min-width:160px;padding:4px">
            <strong style="font-size:14px;color:#1B4332">${place.name}</strong><br/>
            <span style="color:#666;font-size:12px">${place.province}</span><br/>
            <span style="color:#E76F51;font-size:13px">⭐ ${(place.rating || 0).toFixed(1)}</span>
            <br/><br/>
            <button onclick="window.dispatchEvent(new CustomEvent('go-detail', {detail:'${doc.id}'}))"
              style="background:#2D6A4F;color:#fff;border:none;border-radius:8px;padding:6px 12px;font-family:'Kanit',sans-serif;font-size:12px;cursor:pointer;width:100%">
              ดูรายละเอียด
            </button>
          </div>
        `, { maxWidth: 200 })

      markers.push(marker)
    })
  })

  // Listen for popup button clicks
  window.addEventListener('go-detail', handleGoDetail as EventListener)
})

onUnmounted(() => {
  unsubscribe?.()
  window.removeEventListener('go-detail', handleGoDetail as EventListener)
  map?.remove()
})

const handleGoDetail = (e: CustomEvent) => {
  router.push(`/detail/${e.detail}`)
}

const goToSearch = () => {
  router.push('/tabs/search')
}

const locateMe = () => {
  if (!navigator.geolocation || !map) return
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords
      map!.setView([latitude, longitude], 13)
      L.marker([latitude, longitude])
        .addTo(map!)
        .bindPopup('คุณอยู่ที่นี่ 📍')
        .openPopup()
    },
    () => {
      console.warn('Geolocation denied')
    }
  )
}
</script>

<style scoped>
.map-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.map-container {
  width: 100%;
  height: 100vh;
  z-index: 0;
}

.search-bar-float {
  position: absolute;
  top: calc(env(safe-area-inset-top) + 12px);
  left: 16px;
  right: 16px;
  z-index: 1000;
}

.search-inner {
  display: flex;
  align-items: center;
  background: #ffffff;
  border-radius: 14px;
  padding: 12px 16px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  cursor: pointer;
  gap: 10px;
}

.search-icon {
  color: #2D6A4F;
  font-size: 18px;
  flex-shrink: 0;
}

.search-placeholder {
  color: #9e9e9e;
  font-size: 14px;
  font-family: 'Kanit', sans-serif;
}

.locate-fab {
  bottom: calc(env(safe-area-inset-bottom) + 80px) !important;
}
</style>
