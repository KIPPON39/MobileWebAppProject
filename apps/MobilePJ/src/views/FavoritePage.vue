<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>รายการบันทึก ❤️</ion-title>
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
        <h2>ยังไม่มีสถานที่บันทึก</h2>
        <p>กด ❤️ ที่หน้ารายละเอียดเพื่อบันทึกสถานที่ที่ชอบ</p>
        <ion-button router-link="/tabs/search" color="primary" class="explore-btn">
          สำรวจสถานที่
        </ion-button>
      </div>

      <!-- List -->
      <div v-else class="list-container">
        <p class="count-text">{{ favorites.length }} สถานที่บันทึก</p>
        <CampCard
          v-for="place in favorites"
          :key="place.id"
          :place="place"
          @click="router.push(`/detail/${place.id}`)"
        />
      </div>

      <!-- Long Press info hint -->
      <div v-if="favorites.length > 0" class="hint-text">
        กดที่การ์ดเพื่อดูรายละเอียด
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
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonSpinner, IonToast
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
ion-header ion-toolbar {
  --background: #2D6A4F;
  --color: #ffffff;
}

.loading-state {
  display: flex;
  justify-content: center;
  padding: 80px 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 32px;
  text-align: center;
}

.empty-emoji {
  font-size: 72px;
  margin-bottom: 16px;
}

.empty-state h2 {
  font-size: 20px;
  font-weight: 600;
  color: #2D6A4F;
  margin: 0 0 10px;
}

.empty-state p {
  font-size: 14px;
  color: #888;
  line-height: 1.6;
  margin: 0 0 24px;
}

.explore-btn {
  --border-radius: 12px;
  height: 46px;
  padding: 0 24px;
}

.list-container {
  padding: 16px;
}

.count-text {
  font-size: 13px;
  color: #8B5E3C;
  font-weight: 500;
  margin: 0 0 12px;
}

.hint-text {
  text-align: center;
  font-size: 12px;
  color: #aaa;
  padding: 8px 0 24px;
}
</style>
