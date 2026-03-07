<template>
  <ion-card class="camp-card" @click="$emit('click')">
    <div class="card-image-wrap">
      <img
        v-if="place.image"
        :src="place.image"
        :alt="place.name"
        class="card-image"
      />
      <div v-else class="card-image-placeholder">🏕️</div>
      <div class="difficulty-badge" :class="difficultyClass">
        {{ place.difficulty }}
      </div>
    </div>

    <ion-card-content class="card-content">
      <div class="card-header-row">
        <div class="card-title-group">
          <h3 class="place-name">{{ place.name }}</h3>
          <p class="province">📍 {{ place.province }}</p>
        </div>
        <div class="rating-box">
          <span class="rating-star">⭐</span>
          <span class="rating-num">{{ (place.rating || 0).toFixed(1) }}</span>
        </div>
      </div>

      <div class="tag-row">
        <ion-chip
          v-for="t in (place.type || []).slice(0, 3)"
          :key="t"
          class="type-chip"
          color="primary"
          outline
        >
          {{ t }}
        </ion-chip>
      </div>

      <p v-if="place.description" class="description">
        {{ place.description.slice(0, 80) }}{{ place.description.length > 80 ? '...' : '' }}
      </p>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { IonCard, IonCardContent, IonChip } from '@ionic/vue'

interface Place {
  id?: string
  name: string
  province: string
  region?: string
  type?: string[]
  difficulty?: string
  rating?: number
  reviewCount?: number
  image?: string
  description?: string
}

const props = defineProps<{ place: Place }>()
defineEmits<{ (e: 'click'): void }>()

const difficultyClass = computed(() => {
  const d = props.place.difficulty
  if (d === 'ยาก') return 'diff-hard'
  if (d === 'ปานกลาง') return 'diff-medium'
  return 'diff-easy'
})
</script>

<style scoped>
.camp-card {
  margin: 0 0 16px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 3px 12px rgba(0,0,0,0.1);
  --background: #ffffff;
  cursor: pointer;
}

.card-image-wrap {
  position: relative;
  height: 180px;
  background: #e8e0d0;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  background: linear-gradient(135deg, #c8e6c9, #a5d6a7);
}

.difficulty-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
}

.diff-easy { background: #52B788; }
.diff-medium { background: #E76F51; }
.diff-hard { background: #c62828; }

.card-content {
  padding: 12px 16px 16px;
}

.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.card-title-group {
  flex: 1;
  min-width: 0;
}

.place-name {
  font-size: 16px;
  font-weight: 600;
  color: #1B4332;
  margin: 0 0 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.province {
  font-size: 12px;
  color: #8B5E3C;
  margin: 0;
}

.rating-box {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
  margin-left: 8px;
}

.rating-star { font-size: 14px; }
.rating-num { font-size: 14px; font-weight: 600; color: #2D6A4F; }

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 8px;
}

.type-chip {
  --background: #e8f5e9;
  --color: #2D6A4F;
  font-size: 11px;
  height: 22px;
  margin: 0;
}

.description {
  font-size: 13px;
  color: #666;
  margin: 0;
  line-height: 1.5;
}
</style>
