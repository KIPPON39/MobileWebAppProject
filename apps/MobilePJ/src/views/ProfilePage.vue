<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>โปรไฟล์</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div v-if="userData" class="profile-content">
        <!-- Header -->
        <div class="profile-header">
          <div class="avatar-circle">
            {{ getInitials(userData.displayName) }}
          </div>
          <h1 class="display-name">{{ userData.displayName }}</h1>
          <p class="email">{{ userData.email }}</p>
          <div class="badge-box" :class="badgeClass">
            {{ badgeLabel }}
          </div>
        </div>

        <!-- Stats -->
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-num">{{ userData.reviewCount || 0 }}</span>
            <span class="stat-label">รีวิว</span>
          </div>
          <div class="stat-card">
            <span class="stat-num">{{ userData.favorites?.length || 0 }}</span>
            <span class="stat-label">บันทึกแล้ว</span>
          </div>
          <div class="stat-card">
            <span class="stat-num">{{ reportCount }}</span>
            <span class="stat-label">รายงาน</span>
          </div>
        </div>

        <!-- My Reviews -->
        <div class="section">
          <h2 class="section-title">📖 ประวัติรีวิวของฉัน</h2>
          <div v-if="myReviews.length === 0" class="no-reviews">
            <p>ยังไม่เคยรีวิวสถานที่ใด</p>
          </div>
          <div v-else>
            <ReviewCard
              v-for="r in myReviews"
              :key="r.id"
              :review="r"
              :show-place-name="true"
            />
          </div>
        </div>

        <!-- Logout -->
        <div class="logout-section">
          <ion-button expand="block" fill="outline" color="danger" class="logout-btn" @click="handleLogout">
            <ion-icon :icon="logOutOutline" slot="start" />
            ออกจากระบบ
          </ion-button>
        </div>
      </div>

      <div v-else class="loading-state">
        <ion-spinner name="crescent" color="primary" />
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonIcon, IonSpinner
} from '@ionic/vue'
import { logOutOutline } from 'ionicons/icons'
import { doc, onSnapshot, collectionGroup, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../composables/useAuth'
import ReviewCard from '../components/ReviewCard.vue'

const router = useRouter()
const { currentUser, logout } = useAuth()

const userData = ref<any>(null)
const myReviews = ref<any[]>([])
const reportCount = ref(0)
let unsubUser: (() => void) | null = null

const badgeLabel = computed(() => {
  const count = userData.value?.reviewCount || 0
  if (count >= 21) return '🦅 นักสำรวจ'
  if (count >= 6) return '🏕️ นักแคมป์'
  return '🌱 มือใหม่'
})

const badgeClass = computed(() => {
  const count = userData.value?.reviewCount || 0
  if (count >= 21) return 'badge-explorer'
  if (count >= 6) return 'badge-camper'
  return 'badge-newbie'
})

const getInitials = (name: string) => {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  return parts.length >= 2
    ? parts[0][0] + parts[1][0]
    : name.slice(0, 2).toUpperCase()
}

onMounted(async () => {
  if (!currentUser.value) return
  const uid = currentUser.value.uid

  // Subscribe to user data
  unsubUser = onSnapshot(doc(db, 'users', uid), (snap) => {
    if (snap.exists()) userData.value = snap.data()
  })

  // Fetch this user's reviews from all places
  try {
    const q = query(collectionGroup(db, 'reviews'), where('uid', '==', uid))
    const snap = await getDocs(q)
    myReviews.value = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
  } catch (_) {
    // collectionGroup requires Firestore index - show empty if not set up
  }

  // Count reports
  try {
    const r = query(collectionGroup(db, 'reports'), where('uid', '==', uid))
    const rs = await getDocs(r)
    reportCount.value = rs.size
  } catch (_) {}
})

onUnmounted(() => unsubUser?.())

const handleLogout = async () => {
  await logout()
  router.replace('/login')
}
</script>

<style scoped>
ion-header ion-toolbar {
  --background: #2D6A4F;
  --color: #ffffff;
}

.profile-content {
  padding-bottom: 40px;
}

.profile-header {
  background: linear-gradient(160deg, #1B4332 0%, #2D6A4F 100%);
  padding: 40px 20px 32px;
  text-align: center;
}

.avatar-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 auto 12px;
  border: 3px solid rgba(255,255,255,0.4);
}

.display-name {
  font-size: 22px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 4px;
}

.email {
  font-size: 13px;
  color: rgba(255,255,255,0.7);
  margin: 0 0 12px;
}

.badge-box {
  display: inline-block;
  padding: 5px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}
.badge-newbie { background: rgba(82,183,136,0.25); color: #c8f0d4; }
.badge-camper { background: rgba(231,111,81,0.25); color: #ffd6cc; }
.badge-explorer { background: rgba(255,193,7,0.2); color: #ffe08a; }

.stats-grid {
  display: flex;
  gap: 1px;
  background: #e8e0d0;
  margin-bottom: 1px;
}

.stat-card {
  flex: 1;
  background: #F9F3E3;
  padding: 20px 8px;
  text-align: center;
}
.stat-num {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #2D6A4F;
}
.stat-label {
  font-size: 12px;
  color: #888;
}

.section {
  padding: 16px;
}
.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1B4332;
  margin: 0 0 12px;
}
.no-reviews {
  text-align: center;
  padding: 24px;
  color: #999;
  font-size: 14px;
}

.logout-section {
  padding: 8px 16px 24px;
}
.logout-btn {
  --border-radius: 12px;
  height: 48px;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60vh;
}
</style>
