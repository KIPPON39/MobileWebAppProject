<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="profile-toolbar">
        <div class="toolbar-title">โปรไฟล์</div>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div v-if="userData" class="profile-content">
        <!-- Profile Hero -->
        <div class="profile-hero">
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
        <div class="stats-row">
          <div class="stat-card">
            <span class="stat-num">{{ userData.reviewCount || 0 }}</span>
            <span class="stat-label">📝 รีวิว</span>
          </div>
          <div class="stat-divider" />
          <div class="stat-card">
            <span class="stat-num">{{ userData.favorites?.length || 0 }}</span>
            <span class="stat-label">❤️ บันทึก</span>
          </div>
          <div class="stat-divider" />
          <div class="stat-card">
            <span class="stat-num">{{ reportCount }}</span>
            <span class="stat-label">🚦 รายงาน</span>
          </div>
        </div>

        <!-- My Reviews -->
        <div class="section">
          <h2 class="section-title">📖 ประวัติรีวิวของฉัน</h2>
          <div v-if="myReviews.length === 0" class="no-reviews">
            <div class="no-reviews-icon">🌿</div>
            <p>ยังไม่เคยรีวิวสถานที่ใด</p>
          </div>
          <div v-else>
            <ReviewCard
              v-for="r in myReviews"
              :key="r.id"
              :review="r"
              :show-place-name="true"
              :can-delete="true"
              @delete="deleteReview"
            />
          </div>
        </div>

        <!-- Logout -->
        <div class="logout-section">
          <button class="logout-btn" @click="handleLogout">
            ออกจากระบบ
          </button>
        </div>
      </div>

      <div v-else class="loading-state">
        <ion-spinner name="crescent" color="primary" />
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonPage, IonHeader, IonToolbar, IonContent,
  IonSpinner, IonToast
} from '@ionic/vue'
import { doc, collection, onSnapshot, getDocs, deleteDoc, updateDoc, increment } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../composables/useAuth'
import ReviewCard from '../components/ReviewCard.vue'

const router = useRouter()
const { currentUser, logout } = useAuth()

const userData = ref<any>(null)
const myReviews = ref<any[]>([])
const reportCount = ref(0)
const showToast = ref(false)
const toastMsg = ref('')
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

  // Fetch this user's reviews from users/{uid}/reviews subcollection (no index needed)
  try {
    const snap = await getDocs(collection(db, 'users', uid, 'reviews'))
    myReviews.value = snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as any))
      .sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
  } catch (_) {}

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

const deleteReview = async (review: any) => {
  if (!currentUser.value) return
  const uid = currentUser.value.uid
  try {
    await deleteDoc(doc(db, 'users', uid, 'reviews', review.id))
    if (review.placeId && review.placeReviewId) {
      await deleteDoc(doc(db, 'places', review.placeId, 'reviews', review.placeReviewId))
    }
    if (review.placeId) {
      await updateDoc(doc(db, 'places', review.placeId), { reviewCount: increment(-1) })
    }
    await updateDoc(doc(db, 'users', uid), { reviewCount: increment(-1) })
    myReviews.value = myReviews.value.filter((r: any) => r.id !== review.id)
    toastMsg.value = 'ลบรีวิวเรียบร้อยแล้ว'
    showToast.value = true
  } catch {
    toastMsg.value = 'เกิดข้อผิดพลาด'
    showToast.value = true
  }
}
</script>

<style scoped>
/* ─ Toolbar ─ */
.profile-toolbar {
  --background: #3DAA6B;
  --min-height: 52px;
}
.toolbar-title {
  padding: 12px 20px 8px;
  font-size: 20px; font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.2px;
}

/* ─ Hero ─ */
.profile-hero {
  background: linear-gradient(160deg, #1E6E43 0%, #3DAA6B 100%);
  padding: 36px 20px 30px;
  text-align: center;
}
.avatar-circle {
  width: 84px; height: 84px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  display: flex; align-items: center; justify-content: center;
  font-size: 28px; font-weight: 700; color: #ffffff;
  margin: 0 auto 14px;
  border: 3px solid rgba(255,255,255,0.45);
  letter-spacing: 1px;
}
.display-name {
  font-size: 22px; font-weight: 700;
  color: #ffffff; margin: 0 0 5px;
}
.email {
  font-size: 13px; color: rgba(255,255,255,0.72);
  margin: 0 0 14px;
}
.badge-box {
  display: inline-block;
  padding: 5px 18px; border-radius: 999px;
  font-size: 13px; font-weight: 600;
}
.badge-newbie   { background: rgba(64,192,103,0.25); color: #c8f0d4; }
.badge-camper   { background: rgba(255,123,84,0.25);  color: #ffd6cc; }
.badge-explorer { background: rgba(244,169,22,0.25);  color: #ffe08a; }

/* ─ Stats ─ */
.stats-row {
  display: flex; align-items: center;
  background: #ffffff;
  margin-bottom: 8px;
  border-bottom: 1px solid #DAE8DA;
}
.stat-card {
  flex: 1; text-align: center;
  padding: 18px 8px;
}
.stat-num {
  display: block;
  font-size: 26px; font-weight: 700;
  color: #3DAA6B; line-height: 1.1;
}
.stat-label {
  font-size: 12px; color: #8BAA8B;
  margin-top: 4px; display: block;
}
.stat-divider {
  width: 1px; height: 40px;
  background: #DAE8DA;
}

/* ─ Section ─ */
.section {
  padding: 20px 16px;
}
.section-title {
  font-size: 17px; font-weight: 700;
  color: #1A2C1A; margin: 0 0 14px;
}
.no-reviews {
  text-align: center; padding: 32px 24px;
  color: #8BAA8B;
}
.no-reviews-icon {
  font-size: 40px; margin-bottom: 10px;
}
.no-reviews p {
  font-size: 14px; margin: 0;
}

/* ─ Logout ─ */
.logout-section {
  padding: 4px 16px 40px;
}
.logout-btn {
  width: 100%;
  background: transparent;
  border: 1.5px solid #EF4444;
  color: #EF4444;
  border-radius: 14px;
  padding: 14px;
  font-size: 15px; font-weight: 600;
  font-family: 'Kanit', sans-serif;
  cursor: pointer; letter-spacing: 0.2px;
}

/* ─ Loading ─ */
.loading-state {
  display: flex; justify-content: center;
  align-items: center; height: 60vh;
}

.profile-content { padding-bottom: 40px; }
</style>
