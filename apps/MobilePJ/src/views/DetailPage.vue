<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/search" text="" />
        </ion-buttons>
        <ion-title class="ion-text-center">{{ place?.name || 'รายละเอียด' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="toggleFavorite">
            <ion-icon :icon="isFavorite ? heart : heartOutline" color="light" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content v-if="place">
      <!-- Hero Image -->
      <div class="hero-wrap">
        <img v-if="place.image" :src="place.image" :alt="place.name" class="hero-image" />
        <div v-else class="hero-placeholder">🏕️</div>
        <div class="hero-overlay">
          <h1 class="hero-title">{{ place.name }}</h1>
          <p class="hero-sub">📍 {{ place.province }}</p>
        </div>
      </div>

      <!-- Rating & Tags -->
      <div class="section-pad">
        <div class="rating-row">
          <span class="rating-big">⭐ {{ (place.rating || 0).toFixed(1) }}</span>
          <span class="review-count">({{ place.reviewCount || 0 }} รีวิว)</span>
          <ion-chip :class="['diff-chip', diffClass]">{{ place.difficulty }}</ion-chip>
        </div>
        <div class="type-row">
          <ion-chip v-for="t in (place.type || [])" :key="t" color="primary" outline class="type-chip">
            {{ t }}
          </ion-chip>
        </div>
        <p class="desc-text">{{ place.description }}</p>
      </div>

      <!-- Community Report -->
      <div class="section-pad community-section">
        <h2 class="section-title">🚦 รายงานสภาพปัจจุบัน</h2>
        <div v-if="latestReport" class="report-card" :class="reportStatusClass(latestReport.status)">
          <span class="report-icon">{{ reportIcon(latestReport.status) }}</span>
          <div class="report-text">
            <strong>{{ latestReport.status }}</strong>
            <p>รายงานเมื่อ {{ formatTimeAgo(latestReport.createdAt?.toDate?.()) }}</p>
          </div>
        </div>
        <div v-else class="report-empty">
          <p>ยังไม่มีรายงานใน 24 ชั่วโมงที่ผ่านมา</p>
        </div>
        <ion-button expand="block" fill="outline" color="primary" class="report-btn" @click="openReportSheet">
          📣 รายงานสภาพปัจจุบัน
        </ion-button>
      </div>

      <!-- Info Grid -->
      <div class="section-pad">
        <h2 class="section-title">ℹ️ ข้อมูลทั่วไป</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">💰 ค่าเข้า (ไทย)</span>
            <span class="info-value">{{ place.entryFee?.thai || 'ฟรี' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">💰 ค่าเข้า (ต่างชาติ)</span>
            <span class="info-value">{{ place.entryFee?.foreign || 'ฟรี' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">🕐 เวลาเปิด-ปิด</span>
            <span class="info-value">{{ place.openHours || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">🚶 ระยะจากที่จอดรถ</span>
            <span class="info-value">{{ place.distanceFromParking || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">📶 สัญญาณโทรศัพท์</span>
            <span class="info-value">{{ place.signal || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">💧 น้ำดื่ม</span>
            <span class="info-value">{{ place.water ? 'มี' : 'ไม่มี' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">⚡ ไฟฟ้า</span>
            <span class="info-value">{{ place.electricity ? 'มี' : 'ไม่มี' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">🅿️ จุดจอดรถ</span>
            <span class="info-value">{{ place.parking || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">📞 เบอร์ติดต่อ</span>
            <span class="info-value">{{ place.phone || '-' }}</span>
          </div>
        </div>
      </div>

      <!-- Mini Map -->
      <div class="section-pad">
        <h2 class="section-title">🗺️ ตำแหน่งที่ตั้ง</h2>
        <div ref="miniMapRef" class="mini-map" />
        <ion-button expand="block" color="tertiary" class="navigate-btn" @click="openMaps">
          🗺️ นำทางด้วย Google Maps
        </ion-button>
      </div>

      <!-- Reviews Filter -->
      <div class="section-pad">
        <div class="reviews-header">
          <h2 class="section-title">💬 รีวิวจากนักท่องเที่ยว</h2>
          <div class="review-filter">
            <ion-segment v-model="reviewFilter" class="review-segment">
              <ion-segment-button value="all"><ion-label>ทั้งหมด</ion-label></ion-segment-button>
              <ion-segment-button value="3m"><ion-label>3 เดือน</ion-label></ion-segment-button>
              <ion-segment-button value="6m"><ion-label>6 เดือน</ion-label></ion-segment-button>
            </ion-segment>
          </div>
        </div>

        <div v-if="filteredReviews.length === 0" class="no-reviews">
          <div>🌿</div>
          <p>ยังไม่มีรีวิว เป็นคนแรกสิ!</p>
        </div>
        <ReviewCard
          v-for="r in filteredReviews"
          :key="r.id"
          :review="r"
        />
      </div>

      <!-- Write Review Form -->
      <div class="section-pad review-form-section">
        <h2 class="section-title">✍️ เขียนรีวิว</h2>

        <ion-item lines="none" class="form-item">
          <ion-label position="stacked">วันที่ไป <span class="required">*</span></ion-label>
          <ion-datetime-button datetime="visitDatePicker" />
          <ion-modal :keep-contents-mounted="true">
            <ion-datetime
              id="visitDatePicker"
              v-model="reviewForm.visitDate"
              presentation="date"
              :max="today"
              locale="th-TH"
            />
          </ion-modal>
        </ion-item>

        <div class="form-item-plain">
          <label class="form-label">คะแนน <span class="required">*</span></label>
          <div class="stars-row">
            <span
              v-for="n in 5" :key="n"
              class="star-btn"
              :class="{ active: n <= reviewForm.rating }"
              @click="reviewForm.rating = n"
            >⭐</span>
            <span class="rating-text">{{ reviewForm.rating }}/5</span>
          </div>
        </div>

        <!-- Tags -->
        <div class="form-item-plain">
          <label class="form-label">แท็ก</label>
          <div class="tag-groups">
            <div class="tag-group">
              <p class="tag-group-label">ความแออัด:</p>
              <div class="tag-chips">
                <ion-chip
                  v-for="tag in crowdTags" :key="tag"
                  :color="reviewForm.tags.includes(tag) ? 'primary' : 'light'"
                  :outline="!reviewForm.tags.includes(tag)"
                  @click="toggleTag(tag)"
                  class="tag-chip"
                >{{ tag }}</ion-chip>
              </div>
            </div>
            <div class="tag-group">
              <p class="tag-group-label">เหมาะกับ:</p>
              <div class="tag-chips">
                <ion-chip
                  v-for="tag in suitableTags" :key="tag"
                  :color="reviewForm.tags.includes(tag) ? 'primary' : 'light'"
                  :outline="!reviewForm.tags.includes(tag)"
                  @click="toggleTag(tag)"
                  class="tag-chip"
                >{{ tag }}</ion-chip>
              </div>
            </div>
            <div class="tag-group">
              <p class="tag-group-label">ฤดูกาล:</p>
              <div class="tag-chips">
                <ion-chip
                  v-for="tag in seasonTags" :key="tag"
                  :color="reviewForm.tags.includes(tag) ? 'primary' : 'light'"
                  :outline="!reviewForm.tags.includes(tag)"
                  @click="toggleTag(tag)"
                  class="tag-chip"
                >{{ tag }}</ion-chip>
              </div>
            </div>
          </div>
        </div>

        <!-- Comment -->
        <ion-item lines="none" class="form-item">
          <ion-label position="stacked">ข้อความรีวิว</ion-label>
          <ion-textarea
            v-model="reviewForm.comment"
            placeholder="เล่าประสบการณ์ของคุณ..."
            :rows="4"
            auto-grow
          />
        </ion-item>

        <!-- Photo Upload -->
        <div class="form-item-plain">
          <label class="form-label">รูปภาพ (สูงสุด 3 รูป)</label>
          <div class="photo-row">
            <div
              v-for="(photo, idx) in reviewForm.imageFiles"
              :key="idx"
              class="photo-preview"
            >
              <img :src="photo.preview" alt="preview" />
              <ion-button fill="clear" class="remove-photo" @click="removePhoto(idx)">✕</ion-button>
            </div>
            <label v-if="reviewForm.imageFiles.length < 3" class="photo-add-btn" for="photo-input">
              <span>+</span>
              <input
                id="photo-input"
                type="file"
                accept="image/*"
                multiple
                class="hidden-input"
                @change="handlePhotoSelect"
              />
            </label>
          </div>
        </div>

        <ion-button
          expand="block"
          color="primary"
          class="submit-btn"
          :disabled="submitting"
          @click="submitReview"
        >
          <ion-spinner v-if="submitting" name="crescent" />
          <span v-else>ส่งรีวิว</span>
        </ion-button>
      </div>

      <div style="height:40px" />
    </ion-content>

    <ion-content v-else>
      <div class="loading-state"><ion-spinner name="crescent" color="primary" /></div>
    </ion-content>

    <!-- Report Action Sheet -->
    <ion-action-sheet
      :is-open="showReportSheet"
      header="รายงานสภาพปัจจุบัน"
      :buttons="reportButtons"
      @didDismiss="showReportSheet = false"
    />

    <ion-toast
      :is-open="showToast"
      :message="toastMsg"
      :duration="2500"
      :color="toastColor"
      position="top"
      @didDismiss="showToast = false"
    />
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue'
import { useRoute } from 'vue-router'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonButton, IonIcon, IonContent, IonChip, IonLabel,
  IonItem, IonTextarea, IonDatetime, IonDatetimeButton, IonModal,
  IonSegment, IonSegmentButton, IonActionSheet, IonToast, IonSpinner
} from '@ionic/vue'
import { heart, heartOutline } from 'ionicons/icons'
import L from 'leaflet'
import {
  doc, getDoc, collection, onSnapshot, query, orderBy,
  addDoc, updateDoc, increment, serverTimestamp,
  arrayUnion, arrayRemove, Timestamp
} from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../firebase/config'
import { useAuth } from '../composables/useAuth'
import ReviewCard from '../components/ReviewCard.vue'

import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl })

const route = useRoute()
const { currentUser } = useAuth()
const placeId = route.params.id as string

// Data
const place = ref<any>(null)
const reviews = ref<any[]>([])
const latestReport = ref<any>(null)
const isFavorite = ref(false)
const reviewFilter = ref('all')
const showReportSheet = ref(false)
const showToast = ref(false)
const toastMsg = ref('')
const toastColor = ref('success')
const submitting = ref(false)
const today = new Date().toISOString().split('T')[0]

const miniMapRef = ref<HTMLElement | null>(null)
let miniMap: L.Map | null = null
let unsubReviews: (() => void) | null = null
let unsubReports: (() => void) | null = null

// Review Form
const reviewForm = reactive({
  visitDate: today,
  rating: 5,
  tags: [] as string[],
  comment: '',
  imageFiles: [] as { file: File; preview: string }[]
})

const crowdTags = ['เงียบสงบ', 'พอประมาณ', 'แออัด']
const suitableTags = ['ครอบครัว', 'คู่รัก', 'กลุ่มเพื่อน', 'มาคนเดียว']
const seasonTags = ['ฝน', 'หนาว', 'ร้อน', 'ทุกฤดู']

// Computed
const diffClass = computed(() => {
  const d = place.value?.difficulty
  if (d === 'ยาก') return 'diff-hard'
  if (d === 'ปานกลาง') return 'diff-medium'
  return 'diff-easy'
})

const filteredReviews = computed(() => {
  const now = Date.now()
  return reviews.value.filter((r) => {
    if (reviewFilter.value === '3m') return now - r.createdAt?.toDate?.().getTime() <= 90 * 86400000
    if (reviewFilter.value === '6m') return now - r.createdAt?.toDate?.().getTime() <= 180 * 86400000
    return true
  })
})

const reportButtons = ref([
  { text: 'เส้นทางปกติ ✅', handler: () => submitReport('เส้นทางปกติ') },
  { text: 'โคลนลื่น ⚠️', handler: () => submitReport('โคลนลื่น') },
  { text: 'น้ำตกแห้ง 💧', handler: () => submitReport('น้ำตกแห้ง') },
  { text: 'แน่นมาก 👥', handler: () => submitReport('แน่นมาก') },
  { text: 'ปิดชั่วคราว 🚫', handler: () => submitReport('ปิดชั่วคราว') },
  { text: 'ยกเลิก', role: 'cancel' }
])

const reportIcon = (status: string) => {
  const map: Record<string, string> = {
    'เส้นทางปกติ': '✅', 'โคลนลื่น': '⚠️', 'น้ำตกแห้ง': '💧', 'แน่นมาก': '👥', 'ปิดชั่วคราว': '🚫'
  }
  return map[status] || '📢'
}
const reportStatusClass = (status: string) => {
  const map: Record<string, string> = {
    'เส้นทางปกติ': 'report-ok', 'โคลนลื่น': 'report-warn', 'น้ำตกแห้ง': 'report-warn',
    'แน่นมาก': 'report-info', 'ปิดชั่วคราว': 'report-danger'
  }
  return map[status] || 'report-info'
}

const formatTimeAgo = (date: Date | undefined) => {
  if (!date) return ''
  const diff = Math.round((Date.now() - date.getTime()) / 60000)
  if (diff < 60) return `${diff} นาทีที่แล้ว`
  if (diff < 1440) return `${Math.round(diff / 60)} ชั่วโมงที่แล้ว`
  return `${Math.round(diff / 1440)} วันที่แล้ว`
}

onMounted(async () => {
  // Fetch place
  const snap = await getDoc(doc(db, 'places', placeId))
  if (snap.exists()) {
    place.value = { id: snap.id, ...snap.data() }
    initMiniMap()
    checkFavorite()
  }

  // Subscribe reviews
  unsubReviews = onSnapshot(
    query(collection(db, 'places', placeId, 'reviews'), orderBy('createdAt', 'desc')),
    (s) => { reviews.value = s.docs.map((d) => ({ id: d.id, ...d.data() })) }
  )

  // Subscribe reports (latest 24h)
  unsubReports = onSnapshot(
    query(collection(db, 'places', placeId, 'reports'), orderBy('createdAt', 'desc')),
    (s) => {
      const cutoff = Date.now() - 24 * 3600000
      const recent = s.docs.find((d) => {
        const t = d.data().createdAt as Timestamp
        return t?.toDate?.().getTime() > cutoff
      })
      latestReport.value = recent ? { id: recent.id, ...recent.data() } : null
    }
  )
})

onUnmounted(() => {
  unsubReviews?.()
  unsubReports?.()
  miniMap?.remove()
})

const initMiniMap = () => {
  if (!miniMapRef.value || !place.value) return
  miniMap = L.map(miniMapRef.value, { zoomControl: false, dragging: false, scrollWheelZoom: false })
    .setView([place.value.lat, place.value.lng], 13)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(miniMap)
  L.marker([place.value.lat, place.value.lng]).addTo(miniMap)
}

const checkFavorite = () => {
  if (!currentUser.value) return
  const favorites: string[] = currentUser.value.photoURL ? [] : []
  // Will be checked from Firestore in a full implementation - simplified here
  isFavorite.value = false
}

const toggleFavorite = async () => {
  if (!currentUser.value) { showToastMsg('กรุณาเข้าสู่ระบบก่อน', 'warning'); return }
  const userRef = doc(db, 'users', currentUser.value.uid)
  if (isFavorite.value) {
    await updateDoc(userRef, { favorites: arrayRemove(placeId) })
    isFavorite.value = false
    showToastMsg('ลบออกจากรายการบันทึกแล้ว', 'medium')
  } else {
    await updateDoc(userRef, { favorites: arrayUnion(placeId) })
    isFavorite.value = true
    showToastMsg('บันทึกสถานที่แล้ว ❤️', 'success')
  }
}

const openMaps = () => {
  if (!place.value) return
  window.open(`https://maps.google.com/?q=${place.value.lat},${place.value.lng}`, '_blank')
}

const openReportSheet = () => {
  if (!currentUser.value) { showToastMsg('กรุณาเข้าสู่ระบบก่อน', 'warning'); return }
  showReportSheet.value = true
}

const submitReport = async (status: string) => {
  if (!currentUser.value) return
  await addDoc(collection(db, 'places', placeId, 'reports'), {
    uid: currentUser.value.uid,
    displayName: currentUser.value.displayName || 'ไม่ระบุ',
    status,
    createdAt: serverTimestamp()
  })
  showToastMsg('รายงานสภาพสำเร็จ! ขอบคุณ 🙏', 'success')
}

const toggleTag = (tag: string) => {
  const idx = reviewForm.tags.indexOf(tag)
  if (idx >= 0) reviewForm.tags.splice(idx, 1)
  else reviewForm.tags.push(tag)
}

const handlePhotoSelect = (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (!files) return
  for (let i = 0; i < files.length && reviewForm.imageFiles.length < 3; i++) {
    const file = files[i]
    const preview = URL.createObjectURL(file)
    reviewForm.imageFiles.push({ file, preview })
  }
  ;(e.target as HTMLInputElement).value = ''
}

const removePhoto = (idx: number) => {
  URL.revokeObjectURL(reviewForm.imageFiles[idx].preview)
  reviewForm.imageFiles.splice(idx, 1)
}

const submitReview = async () => {
  if (!currentUser.value) { showToastMsg('กรุณาเข้าสู่ระบบก่อน', 'warning'); return }
  if (!reviewForm.visitDate) { showToastMsg('กรุณาเลือกวันที่ไป', 'warning'); return }
  submitting.value = true
  try {
    // Upload images
    const imageUrls: string[] = []
    for (const { file } of reviewForm.imageFiles) {
      const ref = storageRef(storage, `reviews/${placeId}/${currentUser.value.uid}_${Date.now()}_${file.name}`)
      const snap = await uploadBytes(ref, file)
      const url = await getDownloadURL(snap.ref)
      imageUrls.push(url)
    }

    const visitTs = Timestamp.fromDate(new Date(reviewForm.visitDate))
    await addDoc(collection(db, 'places', placeId, 'reviews'), {
      uid: currentUser.value.uid,
      displayName: currentUser.value.displayName || 'ไม่ระบุชื่อ',
      rating: reviewForm.rating,
      visitDate: visitTs,
      tags: reviewForm.tags,
      comment: reviewForm.comment,
      images: imageUrls,
      createdAt: serverTimestamp()
    })

    // Update reviewCount on place and user
    await updateDoc(doc(db, 'places', placeId), { reviewCount: increment(1) })
    await updateDoc(doc(db, 'users', currentUser.value.uid), { reviewCount: increment(1) })

    // Reset form
    reviewForm.visitDate = today
    reviewForm.rating = 5
    reviewForm.tags = []
    reviewForm.comment = ''
    reviewForm.imageFiles.forEach((p) => URL.revokeObjectURL(p.preview))
    reviewForm.imageFiles = []

    showToastMsg('ส่งรีวิวสำเร็จ! ขอบคุณ 🌿', 'success')
  } catch (err) {
    showToastMsg('เกิดข้อผิดพลาดในการส่งรีวิว', 'danger')
  } finally {
    submitting.value = false
  }
}

const showToastMsg = (msg: string, color: string) => {
  toastMsg.value = msg
  toastColor.value = color
  showToast.value = true
}
</script>

<style scoped>
ion-header ion-toolbar {
  --background: #2D6A4F;
  --color: #ffffff;
}

.hero-wrap {
  position: relative;
  height: 240px;
}
.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.hero-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64px;
  background: linear-gradient(135deg, #c8e6c9, #a5d6a7);
}
.hero-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.6));
  padding: 16px;
}
.hero-title {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 4px;
}
.hero-sub {
  font-size: 13px;
  color: rgba(255,255,255,0.85);
  margin: 0;
}

.section-pad {
  padding: 16px;
  border-bottom: 1px solid #e8e0d0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1B4332;
  margin: 0 0 12px;
}

.rating-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.rating-big { font-size: 20px; font-weight: 700; color: #2D6A4F; }
.review-count { font-size: 13px; color: #888; }
.diff-chip { font-size: 12px; height: 26px; }
.diff-easy { --background: #52B788; --color: #fff; }
.diff-medium { --background: #E76F51; --color: #fff; }
.diff-hard { --background: #c62828; --color: #fff; }

.type-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}
.type-chip { font-size: 12px; height: 26px; }

.desc-text {
  font-size: 14px;
  color: #555;
  line-height: 1.7;
  margin: 0;
}

/* Community Report */
.community-section { background: #fffbf5; }
.report-card {
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 12px;
  border-left: 4px solid currentColor;
}
.report-ok { background: #e8f5e9; color: #2D6A4F; }
.report-warn { background: #fff8e1; color: #F9A825; }
.report-info { background: #e3f2fd; color: #1976d2; }
.report-danger { background: #ffebee; color: #c62828; }
.report-icon { font-size: 24px; }
.report-text strong { font-size: 14px; }
.report-text p { font-size: 12px; margin: 2px 0 0; opacity: 0.75; }
.report-empty { text-align: center; color: #999; font-size: 13px; padding: 8px 0 12px; }
.report-btn { --border-radius: 10px; }

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.info-item {
  background: #fff;
  border-radius: 10px;
  padding: 10px 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}
.info-label { display: block; font-size: 11px; color: #888; margin-bottom: 4px; }
.info-value { font-size: 13px; font-weight: 500; color: #333; }

/* Mini Map */
.mini-map {
  height: 180px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 12px;
}

.navigate-btn { --border-radius: 10px; }

/* Review Form */
.review-form-section { background: #fffbf5; }
.form-item {
  --background: #ffffff;
  --border-radius: 10px;
  margin-bottom: 12px;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.form-item-plain {
  margin-bottom: 14px;
}
.form-label {
  font-size: 13px;
  font-weight: 500;
  color: #555;
  display: block;
  margin-bottom: 8px;
}
.required { color: #E76F51; }

.stars-row {
  display: flex;
  align-items: center;
  gap: 6px;
}
.star-btn { font-size: 28px; cursor: pointer; opacity: 0.35; transition: opacity 0.15s; }
.star-btn.active { opacity: 1; }
.rating-text { font-size: 15px; font-weight: 600; color: #2D6A4F; margin-left: 4px; }

.tag-groups { display: flex; flex-direction: column; gap: 10px; }
.tag-group-label { font-size: 12px; color: #888; margin: 0 0 6px; }
.tag-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.tag-chip { font-size: 12px; height: 28px; cursor: pointer; }

.photo-row { display: flex; gap: 10px; flex-wrap: wrap; }
.photo-preview {
  width: 80px; height: 80px;
  border-radius: 10px; overflow: hidden;
  position: relative;
}
.photo-preview img { width: 100%; height: 100%; object-fit: cover; }
.remove-photo {
  position: absolute; top: 0; right: 0;
  --background: rgba(0,0,0,0.5);
  --color: #fff;
  --padding-start: 4px; --padding-end: 4px;
  width: 24px; height: 24px;
  font-size: 12px;
}
.photo-add-btn {
  width: 80px; height: 80px;
  border-radius: 10px;
  border: 2px dashed #2D6A4F;
  display: flex; align-items: center; justify-content: center;
  font-size: 28px; color: #2D6A4F;
  cursor: pointer;
}
.hidden-input { display: none; }

.submit-btn { --border-radius: 12px; height: 50px; font-size: 15px; margin-top: 8px; }

/* Reviews */
.reviews-header { margin-bottom: 12px; }
.review-segment { --background: #e8e0d0; margin-bottom: 8px; }
.no-reviews {
  text-align: center;
  padding: 24px;
  color: #999;
  font-size: 14px;
}
.no-reviews div { font-size: 32px; margin-bottom: 8px; }

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60vh;
}
</style>
