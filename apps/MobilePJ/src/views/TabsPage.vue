<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet />
      <ion-tab-bar slot="bottom" class="tab-bar">
        <ion-tab-button tab="map" href="/tabs/map" class="tab-btn">
          <div class="tab-icon-wrap">
            <ion-icon :icon="mapOutline" />
          </div>
          <ion-label>แผนที่</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="search" href="/tabs/search" class="tab-btn">
          <div class="tab-icon-wrap">
            <ion-icon :icon="searchOutline" />
          </div>
          <ion-label>ค้นหา</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="favorite" href="/tabs/favorite" class="tab-btn">
          <div class="tab-icon-wrap">
            <ion-icon :icon="heartOutline" />
          </div>
          <ion-label>บันทึก</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="profile" href="/tabs/profile" class="tab-btn">
          <div class="tab-icon-wrap">
            <ion-icon :icon="personOutline" />
          </div>
          <ion-label>โปรไฟล์</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage, IonTabs, IonTabBar, IonTabButton,
  IonIcon, IonLabel, IonRouterOutlet
} from '@ionic/vue'
import { mapOutline, searchOutline, heartOutline, personOutline } from 'ionicons/icons'
</script>

<style scoped>
.tab-bar {
  --background: #ffffff;
  --color: #8BAA8B;
  --color-selected: #3DAA6B;
  border-top: 1px solid #DAE8DA;
  height: 62px;
  padding-bottom: env(safe-area-inset-bottom);
  box-shadow: 0 -4px 16px rgba(0,0,0,0.06);
}

.tab-btn {
  --padding-top: 8px;
}

.tab-btn ion-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.2px;
  margin-top: 3px;
}

.tab-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 28px;
  border-radius: 14px;
  transition: background 0.2s ease;
}

.tab-btn.tab-selected .tab-icon-wrap,
:global(.tab-selected) .tab-icon-wrap {
  background: #3DAA6B;
}

.tab-btn.tab-selected ion-icon,
:global(.tab-selected) ion-icon {
  color: #ffffff;
}

.tab-btn ion-icon {
  font-size: 22px;
}
</style>
