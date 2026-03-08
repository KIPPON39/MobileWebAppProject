<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="home-toolbar">
        <div class="toolbar-inner">
          <div>
            <p class="toolbar-greeting">สวัสดี 👋</p>
            <h1 class="toolbar-title">สำรวจธรรมชาติไทย</h1>
          </div>
          <div class="logo-icon">🏕️</div>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="home-content">
      <!-- Quick search bar -->
      <div class="search-prompt" @click="goToSearch">
        <ion-icon :icon="searchOutline" class="search-icon" />
        <span>ค้นหาสถานที่...</span>
      </div>

      <!-- Categories -->
      <section class="section">
        <h2 class="section-title">หมวดหมู่</h2>
        <div class="category-row">
          <button
            v-for="cat in categories"
            :key="cat.label"
            class="cat-btn"
            @click="goToSearchWithFilter(cat.label)"
          >
            <span class="cat-icon">{{ cat.icon }}</span>
            <span class="cat-label">{{ cat.label }}</span>
          </button>
        </div>
      </section>

      <!-- Featured places -->
      <section class="section">
        <div class="section-header">
          <h2 class="section-title">แนะนำสำหรับคุณ</h2>
          <button class="see-all-btn" @click="goToSearch">ดูทั้งหมด</button>
        </div>

        <div v-if="loading" class="loading-row">
          <ion-spinner name="crescent" color="primary" />
        </div>

        <div v-else class="featured-list">
          <div
            v-for="place in featuredPlaces"
            :key="place.id"
            class="featured-card"
            @click="goToDetail(place.id)"
          >
            <div class="card-img-wrap">
              <img v-if="place.image" :src="place.image" :alt="place.name" class="card-img" />
              <div v-else class="card-img-placeholder">🏕️</div>
              <span :class="['diff-badge', diffClass(place.difficulty)]">{{ place.difficulty }}</span>
            </div>
            <div class="card-body">
              <h3 class="card-name">{{ place.name }}</h3>
              <p class="card-province">📍 {{ place.province }}</p>
              <div class="card-footer">
                <span class="card-rating">⭐ {{ (place.rating || 0).toFixed(1) }}</span>
                <span v-for="t in (place.type || []).slice(0,2)" :key="t" class="card-tag">{{ t }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div style="height: 24px" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { IonPage, IonHeader, IonToolbar, IonContent, IonIcon, IonSpinner } from '@ionic/vue'
import { searchOutline } from 'ionicons/icons'
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase/config'

const router = useRouter()

const loading = ref(true)
const featuredPlaces = ref<any[]>([])

const categories = [
  { icon: '🌊', label: 'น้ำตก' },
  { icon: '⛰️', label: 'ดอย' },
  { icon: '🌿', label: 'ป่า' },
  { icon: '🏖️', label: 'ทะเล' },
  { icon: '🏕️', label: 'แคมป์' },
  { icon: '🌅', label: 'จุดชมวิว' },
]

const diffClass = (d: string) => {
  if (d === 'ยาก') return 'diff-hard'
  if (d === 'ปานกลาง') return 'diff-medium'
  return 'diff-easy'
}

const goToSearch = () => router.push('/tabs/search')
const goToSearchWithFilter = (_filter: string) => router.push('/tabs/search')
const goToDetail = (id: string) => router.push(`/detail/${id}`)

onMounted(async () => {
  try {
    const snap = await getDocs(query(collection(db, 'places'), orderBy('rating', 'desc'), limit(6)))
    featuredPlaces.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  } catch {
    featuredPlaces.value = []
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.home-toolbar {
  --background: #ffffff;
  --border-color: transparent;
  padding: 6px 0 4px;
}
.toolbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 18px 4px;
}
.toolbar-greeting {
  font-size: 13px;
  color: #8BAA8B;
  margin: 0 0 2px;
  font-weight: 500;
}
.toolbar-title {
  font-size: 22px;
  font-weight: 800;
  color: #1A2C1A;
  margin: 0;
  letter-spacing: -0.3px;
}
.logo-icon { font-size: 40px; }

.home-content {
  --background: #F4F9F5;
}

.search-prompt {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #ffffff;
  border-radius: 16px;
  margin: 14px 16px 0;
  padding: 13px 18px;
  box-shadow: 0 4px 16px rgba(61,170,107,0.1);
  border: 1.5px solid #DAE8DA;
  cursor: pointer;
  color: #8BAA8B;
  font-size: 15px;
}
.search-icon {
  color: #3DAA6B;
  font-size: 20px;
  flex-shrink: 0;
}

.section { padding: 20px 16px 0; }
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.section-title {
  font-size: 17px;
  font-weight: 800;
  color: #1A2C1A;
  margin: 0 0 14px;
}
.section-header .section-title { margin: 0; }
.see-all-btn {
  background: none;
  border: none;
  color: #3DAA6B;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  padding: 0;
}

/* Categories */
.category-row {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.category-row::-webkit-scrollbar { display: none; }
.cat-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  background: #ffffff;
  border: 1.5px solid #DAE8DA;
  border-radius: 16px;
  padding: 12px 14px;
  cursor: pointer;
  flex-shrink: 0;
  font-family: inherit;
  transition: all 0.15s;
  box-shadow: 0 2px 8px rgba(61,170,107,0.06);
}
.cat-btn:active { background: #E8F8EF; border-color: #3DAA6B; }
.cat-icon { font-size: 24px; }
.cat-label { font-size: 11px; font-weight: 600; color: #4A6A4A; }

/* Featured cards */
.loading-row {
  display: flex;
  justify-content: center;
  padding: 32px 0;
}
.featured-list { display: flex; flex-direction: column; gap: 13px; }

.featured-card {
  background: #ffffff;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0,0,0,0.07);
  cursor: pointer;
  transition: transform 0.15s;
  border: 1px solid #DAE8DA;
}
.featured-card:active { transform: scale(0.98); }

.card-img-wrap {
  position: relative;
  height: 170px;
}
.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.card-img-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 56px;
  background: linear-gradient(135deg, #E8F8EF, #A8D5B5);
}

.diff-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
}
.diff-easy   { background: rgba(220,252,231,0.92); color: #16A34A; }
.diff-medium { background: rgba(254,249,195,0.92); color: #B45309; }
.diff-hard   { background: rgba(254,226,226,0.92); color: #DC2626; }

.card-body { padding: 13px 14px 14px; }
.card-name {
  font-size: 17px;
  font-weight: 800;
  color: #1A2C1A;
  margin: 0 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.card-province { font-size: 12px; color: #8BAA8B; margin: 0 0 10px; }
.card-footer {
  display: flex;
  align-items: center;
  gap: 7px;
  flex-wrap: wrap;
}
.card-rating { font-size: 13px; font-weight: 700; color: #3DAA6B; }
.card-tag {
  background: #E8F8EF;
  color: #3DAA6B;
  border-radius: 20px;
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 600;
}
</style>

