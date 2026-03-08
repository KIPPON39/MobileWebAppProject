<template>
  <div class="review-card">
    <div class="reviewer-row">
      <div class="avatar">{{ getInitials(review.displayName) }}</div>
      <div class="reviewer-info">
        <div class="reviewer-name-row">
          <strong class="reviewer-name">{{ review.displayName }}</strong>
          <span class="reviewer-badge" :class="badgeClass">{{ badgeLabel }}</span>
        </div>
        <span class="visit-date">ไปเมื่อ {{ formatDate(review.visitDate) }}</span>
      </div>
      <div class="star-row">
        <span v-for="n in 5" :key="n" :class="n <= review.rating ? 'star-on' : 'star-off'">★</span>
      </div>
      <button v-if="canDelete" class="delete-btn" @click.stop="emit('delete', review)">🗑️</button>
    </div>

    <!-- Tags -->
    <div v-if="review.tags && review.tags.length > 0" class="tags-row">
      <span v-for="tag in review.tags" :key="tag" class="review-tag">{{ tag }}</span>
    </div>

    <!-- Place name (for profile page) -->
    <p v-if="showPlaceName && review.placeName" class="place-name-badge">
      📍 {{ review.placeName }}
    </p>

    <!-- Comment -->
    <p v-if="review.comment" class="review-comment">{{ review.comment }}</p>

    <!-- Images -->
    <div v-if="review.images && review.images.length > 0" class="image-row">
      <img
        v-for="(img, idx) in review.images"
        :key="idx"
        :src="img"
        :alt="`รูปที่ ${idx + 1}`"
        class="review-image"
        @click="openImage(img)"
      />
    </div>

    <!-- Image Modal -->
    <ion-modal :is-open="!!selectedImage" @didDismiss="selectedImage = ''">
      <ion-content>
        <div class="image-viewer" @click="selectedImage = ''">
          <img :src="selectedImage" alt="full" class="image-full" />
        </div>
      </ion-content>
    </ion-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { IonModal, IonContent } from '@ionic/vue'
import { Timestamp } from 'firebase/firestore'

interface Review {
  id?: string
  uid?: string
  displayName: string
  rating: number
  visitDate?: Timestamp | any
  tags?: string[]
  comment?: string
  images?: string[]
  createdAt?: Timestamp | any
  reviewerCount?: number
  placeName?: string
}

const props = defineProps<{
  review: Review
  showPlaceName?: boolean
  canDelete?: boolean
}>()

const emit = defineEmits<{
  (e: 'delete', review: Review): void
}>()

const selectedImage = ref('')

const getInitials = (name: string) => {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  return parts.length >= 2 ? parts[0][0] + parts[1][0] : name.slice(0, 2).toUpperCase()
}

const formatDate = (ts: Timestamp | string | undefined) => {
  if (!ts) return 'ไม่ระบุ'
  const d = typeof ts === 'string' ? new Date(ts) : ts?.toDate?.()
  if (!d) return 'ไม่ระบุ'
  return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })
}

// Badge calculated from reviewerCount (if available) or default to newbie
const reviewerCount = computed(() => props.review.reviewerCount || 1)
const badgeLabel = computed(() => {
  const c = reviewerCount.value
  if (c >= 21) return '🦅 นักสำรวจ'
  if (c >= 6) return '🏕️ นักแคมป์'
  return '🌱 มือใหม่'
})
const badgeClass = computed(() => {
  const c = reviewerCount.value
  if (c >= 21) return 'badge-explorer'
  if (c >= 6) return 'badge-camper'
  return 'badge-newbie'
})

const openImage = (url: string) => { selectedImage.value = url }
</script>

<style scoped>
.review-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 10px rgba(61,170,107,0.08);
  border-left: 4px solid #3DAA6B;
}

/* ── Reviewer Header ── */
.reviewer-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 10px;
}
.avatar {
  width: 42px; height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3DAA6B, #A8D5B5);
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700;
  color: #fff; flex-shrink: 0;
  letter-spacing: 0.5px;
}
.reviewer-info {
  flex: 1; min-width: 0;
}
.reviewer-name-row {
  display: flex; align-items: center; gap: 6px;
  flex-wrap: wrap; margin-bottom: 3px;
}
.reviewer-name {
  font-size: 14px; font-weight: 700;
  color: #1A2C1A;
}
.reviewer-badge {
  font-size: 10px; font-weight: 600;
  padding: 2px 8px; border-radius: 999px;
}
.badge-newbie   { background: #E8F8EF; color: #1E6E43; }
.badge-camper   { background: #FFF0EB; color: #C04E29; }
.badge-explorer { background: #FFF8E1; color: #B07A00; }

.visit-date { font-size: 11px; color: #8BAA8B; }

.star-row {
  display: flex; gap: 2px; flex-shrink: 0;
  font-size: 16px;
}
.star-on  { color: #F4A916; }
.star-off { color: #D8EAD8; }

.delete-btn {
  background: none; border: none;
  font-size: 16px; cursor: pointer;
  padding: 2px 0 2px 6px;
  flex-shrink: 0;
  opacity: 0.6;
  line-height: 1;
}
.delete-btn:active { opacity: 1; }

/* ── Tags ── */
.tags-row {
  display: flex; flex-wrap: wrap; gap: 5px;
  margin-bottom: 10px;
}
.review-tag {
  background: #E8F8EF; color: #1E6E43;
  font-size: 11px; font-weight: 600;
  padding: 3px 10px; border-radius: 999px;
}

.place-name-badge {
  font-size: 12px; color: #5A7560;
  margin: 0 0 8px; font-weight: 500;
}

/* ── Comment ── */
.review-comment {
  font-size: 14px; color: #2C3E2C;
  line-height: 1.6; margin: 0 0 10px;
}

/* ── Images ── */
.image-row {
  display: flex; gap: 8px; flex-wrap: wrap;
}
.review-image {
  width: 82px; height: 82px;
  border-radius: 12px; object-fit: cover;
  cursor: pointer;
}
.image-viewer {
  display: flex; align-items: center; justify-content: center;
  height: 100%; background: #000;
}
.image-full {
  max-width: 100%; max-height: 100%;
  object-fit: contain;
}
</style>
