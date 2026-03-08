<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="fav-toolbar">
        <div class="fav-header-inner">
          <h1 class="header-title">รายการบันทึก</h1>
          <p class="header-sub">สถานที่ที่คุณรักและอยากไปสำรวจ</p>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <!-- Loading -->
      <div v-if="loading" class="loading-state">
        <ion-spinner name="crescent" color="primary" />
      </div>

      <!-- Empty State -->
      <div v-else-if="favorites.length === 0" class="empty-state">
        <div class="empty-emoji">🌿</div>
        <h2 class="empty-title">ยังไม่มีสถานที่บันทึก</h2>
        <p class="empty-desc">กด ❤️ ที่หน้ารายละเอียดเพื่อบันทึกสถานที่ที่ชอบ</p>
        <button class="explore-btn" @click="router.push('/tabs/search')">
          🔍 สำรวจสถานที่
        </button>
      </div>

      <!-- List -->
      <div v-else class="list-container">
        <p class="count-text">{{ favorites.length }} สถานที่ที่บันทึกไว้</p>
        <CampCard
          v-for="place in favorites"
          :key="place.id"
          :place="place"
          @click="router.push(`/detail/${place.id}`)"
        />
      </div>

      <ion-toast
        :is-open="showToast"
        :message="toastMsg"
        :duration="2000"
        color="medium"
        position="top"
        @didDismiss="showToast = false"
      />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonPage, IonHeader, IonToolbar, IonContent,
  IonSpinner, IonToast
} from '@ionic/vue'
import { doc, onSnapshot, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../composables/useAuth'
import CampCard from '../components/CampCard.vue'

const router = useRouter()
const { currentUser } = useAuth()

const loading = ref(true)
const favorites = ref<any[]>([])
const showToast = ref(false)
const toastMsg = ref('')
let unsubUser: (() => void) | null = null

onMounted(() => {
  if (!currentUser.value) { loading.value = false; return }
  unsubUser = onSnapshot(doc(db, 'users', currentUser.value.uid), async (snap) => {
    if (!snap.exists()) { loading.value = false; return }
    const favIds: string[] = snap.data().favorites || []
    if (favIds.length === 0) {
      favorites.value = []
      loading.value = false
      return
    }
    const places = await Promise.all(
      favIds.map(async (id) => {
        const d = await getDoc(doc(db, 'places', id))
        return d.exists() ? { id: d.id, ...d.data() } : null
      })
    )
    favorites.value = places.filter(Boolean)
    loading.value = false
  })
})

onUnmounted(() => unsubUser?.())
</script>

<style scoped>
/* ─ Header ─ */
.fav-toolbar {
  --background: #3DAA6B;
  --min-height: 60px;
  border-bottom: none;
}
.fav-header-inner {
  padding: 12px 20px 10px;
}
.header-title {
  font-size: 22px; font-weight: 800;
  color: #ffffff; margin: 0 0 2px;
}
.header-sub {
  font-size: 13px; color: rgba(255,255,255,0.8); margin: 0;
}

/* ─ States ─ */
.loading-state {
  display: flex; justify-content: center;
  padding: 80px 0;
}

.empty-state {
  display: flex; flex-direction: column;
  align-items: center;
  padding: 80px 32px; text-align: center;
}
.empty-emoji {
  font-size: 72px; margin-bottom: 16px;
}
.empty-title {
  font-size: 20px; font-weight: 700;
  color: #1A2C1A; margin: 0 0 10px;
}
.empty-desc {
  font-size: 14px; color: #8BAA8B;
  line-height: 1.6; margin: 0 0 24px;
}
.explore-btn {
  background: #3DAA6B;
  color: #fff;
  border: none; border-radius: 14px;
  padding: 13px 28px;
  font-size: 15px; font-weight: 600;
  font-family: 'Kanit', sans-serif;
  cursor: pointer; letter-spacing: 0.2px;
}

/* ─ List ─ */
.list-container {
  padding: 16px 16px 90px;
}
.count-text {
  font-size: 14px; color: #5A7560;
  font-weight: 600; margin: 0 0 14px;
}
</style>
