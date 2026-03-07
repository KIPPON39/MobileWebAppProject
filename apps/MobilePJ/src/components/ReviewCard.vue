<template>
  <div class="review-card">
    <div class="reviewer-row">
      <div class="avatar">{{ getInitials(review.displayName) }}</div>
      <div class="reviewer-info">
        <div class="reviewer-name-row">
          <strong class="reviewer-name">{{ review.displayName }}</strong>
          <span class="reviewer-badge" :class="badgeClass">{{ badgeLabel }}</span>
        </div>
        <span class="visit-date">ไปเมื่อ: {{ formatDate(review.visitDate) }}</span>
      </div>
      <div class="review-rating">
        <span v-for="n in 5" :key="n" :class="n <= review.rating ? 'star-on' : 'star-off'">⭐</span>
      </div>
    </div>

    <!-- Tags -->
    <div v-if="review.tags && review.tags.length > 0" class="tags-row">
      <ion-chip v-for="tag in review.tags" :key="tag" color="primary" outline class="review-tag">
        {{ tag }}
      </ion-chip>
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
import { IonChip, IonModal, IonContent } from '@ionic/vue'
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
  border-radius: 14px;
  padding: 14px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.reviewer-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 8px;
}

.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2D6A4F, #52B788);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}

.reviewer-info {
  flex: 1;
  min-width: 0;
}

.reviewer-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.reviewer-name {
  font-size: 14px;
  color: #1B4332;
}

.reviewer-badge {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
}
.badge-newbie { background: #e8f5e9; color: #2D6A4F; }
.badge-camper { background: #fff3e0; color: #E76F51; }
.badge-explorer { background: #fff8e1; color: #F9A825; }

.visit-date {
  font-size: 11px;
  color: #999;
  display: block;
  margin-top: 2px;
}

.review-rating {
  flex-shrink: 0;
  font-size: 12px;
}
.star-on { opacity: 1; }
.star-off { opacity: 0.2; }

.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 8px;
}

.review-tag {
  font-size: 11px;
  height: 22px;
  margin: 0;
}

.place-name-badge {
  font-size: 12px;
  color: #8B5E3C;
  margin: 0 0 8px;
  font-weight: 500;
}

.review-comment {
  font-size: 13px;
  color: #444;
  line-height: 1.6;
  margin: 0 0 8px;
}

.image-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.review-image {
  width: 90px;
  height: 90px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
}

.image-viewer {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.9);
  cursor: pointer;
}

.image-full {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
</style>
