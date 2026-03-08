<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="detail-toolbar">
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/search" text="" style="--color:#3DAA6B" />
        </ion-buttons>
        <ion-title class="ion-text-center detail-title">{{ place?.name || 'รายละเอียด' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="toggleFavorite">
            <ion-icon :icon="isFavorite ? heart : heartOutline" :style="{ color: isFavorite ? '#FF7B54' : '#3DAA6B' }" />
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
          <span :class="['diff-badge', diffClass]">{{ place.difficulty }}</span>
        </div>
        <div class="type-row">
          <span v-for="t in (place.type || [])" :key="t" class="type-chip">{{ t }}</span>
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
          :can-delete="r.uid === currentUser?.uid"
          @delete="deleteReview"
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
                <button
                  v-for="tag in crowdTags" :key="tag"
                  :class="['tag-chip', { 'tag-chip-active': reviewForm.tags.includes(tag) }]"
                  @click="toggleTag(tag)"
                >{{ tag }}</button>
              </div>
            </div>
            <div class="tag-group">
              <p class="tag-group-label">เหมาะกับ:</p>
              <div class="tag-chips">
                <button
                  v-for="tag in suitableTags" :key="tag"
                  :class="['tag-chip', { 'tag-chip-active': reviewForm.tags.includes(tag) }]"
                  @click="toggleTag(tag)"
                >{{ tag }}</button>
              </div>
            </div>
            <div class="tag-group">
              <p class="tag-group-label">ฤดูกาล:</p>
              <div class="tag-chips">
                <button
                  v-for="tag in seasonTags" :key="tag"
                  :class="['tag-chip', { 'tag-chip-active': reviewForm.tags.includes(tag) }]"
                  @click="toggleTag(tag)"
                >{{ tag }}</button>
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
  IonButton, IonIcon, IonContent, IonLabel,
  IonItem, IonTextarea, IonDatetime, IonDatetimeButton, IonModal,
  IonSegment, IonSegmentButton, IonActionSheet, IonToast, IonSpinner
} from '@ionic/vue'
import { heart, heartOutline } from 'ionicons/icons'
import L from 'leaflet'
import {
  doc, getDoc, collection, onSnapshot, query, orderBy,
  addDoc, updateDoc, deleteDoc, increment, serverTimestamp,
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

const checkFavorite = async () => {
  if (!currentUser.value) return
  try {
    const userSnap = await getDoc(doc(db, 'users', currentUser.value.uid))
    if (userSnap.exists()) {
      const favorites: string[] = userSnap.data().favorites || []
      isFavorite.value = favorites.includes(placeId)
    }
  } catch {}
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
    const reviewData = {
      uid: currentUser.value.uid,
      displayName: currentUser.value.displayName || 'ไม่ระบุชื่อ',
      rating: reviewForm.rating,
      visitDate: visitTs,
      tags: reviewForm.tags,
      comment: reviewForm.comment,
      images: imageUrls,
      placeName: place.value?.name || '',
      placeId: placeId,
      createdAt: serverTimestamp()
    }
    // Write to place reviews and get the ID
    const placeReviewRef = await addDoc(collection(db, 'places', placeId, 'reviews'), reviewData)
    // Write to user reviews with cross-reference
    const userReviewRef = await addDoc(collection(db, 'users', currentUser.value.uid, 'reviews'), {
      ...reviewData,
      placeReviewId: placeReviewRef.id
    })
    // Store back-reference in place review
    await updateDoc(placeReviewRef, { userReviewId: userReviewRef.id })

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

const deleteReview = async (review: any) => {
  if (!currentUser.value) return
  try {
    await deleteDoc(doc(db, 'places', placeId, 'reviews', review.id))
    if (review.userReviewId) {
      await deleteDoc(doc(db, 'users', review.uid, 'reviews', review.userReviewId))
    }
    await updateDoc(doc(db, 'places', placeId), { reviewCount: increment(-1) })
    await updateDoc(doc(db, 'users', review.uid), { reviewCount: increment(-1) })
    showToastMsg('ลบรีวิวเรียบร้อยแล้ว', 'medium')
  } catch {
    showToastMsg('เกิดข้อผิดพลาดในการลบรีวิว', 'danger')
  }
}
</script>

<style scoped>
/* ── Toolbar ── */
.detail-toolbar {
  --background: #ffffff;
  --border-color: #DAE8DA;
  border-bottom: 1px solid #DAE8DA;
}
.detail-title {
  font-size: 17px;
  font-weight: 700;
  color: #1A2C1A;
}

/* ── Hero ── */
.hero-wrap {
  position: relative;
  height: 260px;
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
  font-size: 72px;
  background: linear-gradient(135deg, #E8F8EF, #A8D5B5);
}
.hero-overlay {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.65));
  padding: 20px 16px 16px;
}
.hero-title {
  font-size: 24px;
  font-weight: 800;
  color: #fff;
  margin: 0 0 4px;
  text-shadow: 0 1px 6px rgba(0,0,0,0.3);
}
.hero-sub {
  font-size: 13px;
  color: rgba(255,255,255,0.88);
  margin: 0;
}

/* ── Sections ── */
.section-pad {
  padding: 18px 16px;
  border-bottom: 1px solid #DAE8DA;
}
.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #1A2C1A;
  margin: 0 0 14px;
}

/* ── Rating row ── */
.rating-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.rating-big { font-size: 20px; font-weight: 800; color: #3DAA6B; }
.review-count { font-size: 13px; color: #8BAA8B; }

.diff-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
}
.diff-easy  { background: #DCFCE7; color: #16A34A; }
.diff-medium { background: #FEF9C3; color: #B45309; }
.diff-hard  { background: #FEE2E2; color: #DC2626; }

.type-row { display: flex; flex-wrap: wrap; gap: 7px; margin-bottom: 12px; }
.type-chip {
  display: inline-block;
  background: #E8F8EF;
  color: #3DAA6B;
  border-radius: 20px;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 600;
}

.desc-text { font-size: 14px; color: #4A6A4A; line-height: 1.75; margin: 0; }

/* ── Community Report ── */
.community-section { background: #F8FFF9; }
.report-card {
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: 14px;
  padding: 13px 16px;
  margin-bottom: 12px;
  border-left: 4px solid currentColor;
}
.report-ok     { background: #DCFCE7; color: #16A34A; }
.report-warn   { background: #FEF9C3; color: #B45309; }
.report-info   { background: #DBEAFE; color: #1D4ED8; }
.report-danger { background: #FEE2E2; color: #DC2626; }
.report-icon { font-size: 24px; }
.report-text strong { font-size: 14px; font-weight: 700; }
.report-text p { font-size: 12px; margin: 2px 0 0; opacity: 0.75; }
.report-empty { text-align: center; color: #8BAA8B; font-size: 13px; padding: 8px 0 12px; }
.report-btn { --border-radius: 12px; --border-color: #3DAA6B; --color: #3DAA6B; }

/* ── Info Grid ── */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.info-item {
  background: #fff;
  border-radius: 14px;
  padding: 12px 13px;
  box-shadow: 0 2px 8px rgba(61,170,107,0.07);
  border: 1px solid #DAE8DA;
}
.info-label { display: block; font-size: 11px; color: #8BAA8B; margin-bottom: 5px; }
.info-value { font-size: 13px; font-weight: 600; color: #1A2C1A; }

/* ── Mini Map ── */
.mini-map {
  height: 190px;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 13px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}
.navigate-btn {
  --background: #3DAA6B;
  --background-activated: #1E6E43;
  --border-radius: 14px;
  --color: #fff;
  font-weight: 700;
}

/* ── Review Form ── */
.review-form-section { background: #F8FFF9; }
.form-item {
  --background: #ffffff;
  --border-radius: 14px;
  margin-bottom: 13px;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(61,170,107,0.07);
  border: 1px solid #DAE8DA;
}
.form-item-plain { margin-bottom: 16px; }
.form-label {
  font-size: 13px;
  font-weight: 600;
  color: #4A6A4A;
  display: block;
  margin-bottom: 9px;
}
.required { color: #FF7B54; }

.stars-row { display: flex; align-items: center; gap: 8px; }
.star-btn { font-size: 30px; cursor: pointer; opacity: 0.25; transition: opacity 0.15s, transform 0.1s; }
.star-btn.active { opacity: 1; }
.star-btn:active { transform: scale(0.9); }
.rating-text { font-size: 15px; font-weight: 700; color: #3DAA6B; margin-left: 6px; }

.tag-groups { display: flex; flex-direction: column; gap: 12px; }
.tag-group-label { font-size: 12px; color: #8BAA8B; margin: 0 0 7px; font-weight: 600; }
.tag-chips { display: flex; flex-wrap: wrap; gap: 7px; }
.tag-chip {
  background: #ffffff;
  border: 1.5px solid #DAE8DA;
  border-radius: 20px;
  padding: 5px 13px;
  font-size: 12px;
  font-weight: 500;
  color: #4A6A4A;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}
.tag-chip-active {
  background: #E8F8EF;
  border-color: #3DAA6B;
  color: #3DAA6B;
  font-weight: 700;
}

.photo-row { display: flex; gap: 10px; flex-wrap: wrap; }
.photo-preview {
  width: 82px; height: 82px;
  border-radius: 12px; overflow: hidden;
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
  width: 82px; height: 82px;
  border-radius: 12px;
  border: 2px dashed #3DAA6B;
  display: flex; align-items: center; justify-content: center;
  font-size: 30px; color: #3DAA6B;
  cursor: pointer;
  background: #F8FFF9;
  transition: background 0.15s;
}
.photo-add-btn:active { background: #E8F8EF; }
.hidden-input { display: none; }

.submit-btn {
  --background: #3DAA6B;
  --background-activated: #1E6E43;
  --border-radius: 14px;
  --color: #fff;
  height: 52px;
  font-size: 16px;
  font-weight: 700;
  margin-top: 10px;
}

/* ── Reviews ── */
.reviews-header { margin-bottom: 14px; }
.review-segment {
  --background: #E8F8EF;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 8px;
}
.no-reviews {
  text-align: center;
  padding: 28px;
  color: #8BAA8B;
  font-size: 14px;
}
.no-reviews div { font-size: 36px; margin-bottom: 10px; }

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60vh;
}
</style>
