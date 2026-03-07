<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet />
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="map" href="/tabs/map">
          <ion-icon :icon="mapOutline" />
          <ion-label>แผนที่</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="search" href="/tabs/search">
          <ion-icon :icon="searchOutline" />
          <ion-label>ค้นหา</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="favorite" href="/tabs/favorite">
          <ion-icon :icon="heartOutline" />
          <ion-label>บันทึก</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="profile" href="/tabs/profile">
          <ion-icon :icon="personOutline" />
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
ion-tab-bar {
  --background: #ffffff;
  --color: #92949c;
  --color-selected: #2D6A4F;
  border-top: 1px solid #e0d8c8;
}
ion-tab-button {
  font-size: 11px;
}
</style>
