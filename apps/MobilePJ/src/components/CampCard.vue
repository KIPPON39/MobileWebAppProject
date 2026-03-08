<template>
  <div class="camp-card" @click="$emit('click')">
    <div class="card-image-wrap">
      <img v-if="place.image" :src="place.image" :alt="place.name" class="card-image" />
      <div v-else class="card-image-placeholder">🏕️</div>
      <div class="card-gradient" />
      <div class="difficulty-badge" :class="difficultyClass">{{ place.difficulty }}</div>
      <div class="rating-badge">⭐ {{ (place.rating || 0).toFixed(1) }}</div>
    </div>
    <div class="card-body">
      <h3 class="place-name">{{ place.name }}</h3>
      <p class="province">📍 {{ place.province }}</p>
      <div class="tag-row">
        <span v-for="t in (place.type || []).slice(0, 3)" :key="t" class="type-tag">{{ t }}</span>
      </div>
      <p v-if="place.description" class="description">
        {{ place.description.slice(0, 78) }}{{ place.description.length > 78 ? '…' : '' }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

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
  background: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  margin-bottom: 16px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.camp-card:active {
  transform: scale(0.985);
  box-shadow: 0 1px 6px rgba(0,0,0,0.06);
}

/* ── Image ── */
.card-image-wrap {
  position: relative;
  height: 180px;
  background: #C8E6D4;
  overflow: hidden;
}
.card-image {
  width: 100%; height: 100%;
  object-fit: cover;
}
.card-image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%; height: 100%;
  font-size: 54px;
  background: linear-gradient(135deg, #A8D5B5, #74C69D);
}
.card-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.38) 0%, transparent 55%);
}

/* ── Badges ── */
.difficulty-badge {
  position: absolute;
  top: 12px; left: 12px;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 11px; font-weight: 700;
  color: #fff;
  letter-spacing: 0.3px;
}
.diff-easy   { background: rgba(64,192,103,0.88); }
.diff-medium { background: rgba(245,158,11,0.9); }
.diff-hard   { background: rgba(239,68,68,0.9); }

.rating-badge {
  position: absolute;
  top: 12px; right: 12px;
  background: rgba(255,255,255,0.92);
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 12px; font-weight: 700;
  color: #1A2C1A;
}

/* ── Body ── */
.card-body {
  padding: 14px 16px 16px;
}
.place-name {
  font-size: 16px; font-weight: 700;
  color: #1A2C1A;
  margin: 0 0 4px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.province {
  font-size: 13px; color: #5A7560;
  margin: 0 0 10px;
}
.tag-row {
  display: flex; flex-wrap: wrap; gap: 5px;
  margin-bottom: 10px;
}
.type-tag {
  background: #E8F8EF;
  color: #1E6E43;
  font-size: 11px; font-weight: 600;
  padding: 3px 10px;
  border-radius: 999px;
}
.description {
  font-size: 13px; color: #6B8B6B;
  margin: 0; line-height: 1.55;
}
</style>
