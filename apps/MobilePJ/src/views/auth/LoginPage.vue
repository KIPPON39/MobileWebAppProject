<template>
  <ion-page class="login-page">
    <ion-content :fullscreen="true">
      <div class="login-container">
        <!-- Logo & Title -->
        <div class="logo-section">
          <div class="logo-icon">🏕️</div>
          <h1 class="app-title">ไปกันเธอ</h1>
          <p class="app-subtitle">สำรวจธรรมชาติไทยด้วยกัน</p>
        </div>

        <!-- Form -->
        <div class="form-section">
          <ion-item class="input-item" lines="none">
            <ion-icon :icon="mailOutline" slot="start" color="medium" />
            <ion-input
              v-model="email"
              type="email"
              placeholder="อีเมล"
              autocomplete="email"
            />
          </ion-item>

          <ion-item class="input-item" lines="none">
            <ion-icon :icon="lockClosedOutline" slot="start" color="medium" />
            <ion-input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="รหัสผ่าน"
            />
            <ion-button slot="end" fill="clear" @click="showPassword = !showPassword">
              <ion-icon :icon="showPassword ? eyeOffOutline : eyeOutline" color="medium" />
            </ion-button>
          </ion-item>

          <ion-button
            expand="block"
            class="login-btn"
            :disabled="loading"
            @click="handleLogin"
          >
            <ion-spinner v-if="loading" name="crescent" />
            <span v-else>เข้าสู่ระบบ</span>
          </ion-button>

          <div class="register-link">
            <span>ยังไม่มีบัญชี?</span>
            <ion-button fill="clear" router-link="/register" class="link-btn">
              สมัครสมาชิก
            </ion-button>
          </div>
        </div>
      </div>

      <ion-toast
        :is-open="showToast"
        :message="toastMessage"
        :duration="3000"
        color="danger"
        position="top"
        @didDismiss="showToast = false"
      />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonPage, IonContent, IonItem, IonInput, IonButton,
  IonIcon, IonToast, IonSpinner
} from '@ionic/vue'
import { mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline } from 'ionicons/icons'
import { useAuth } from '../../composables/useAuth'

const router = useRouter()
const { login } = useAuth()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const showToast = ref(false)
const toastMessage = ref('')

const handleLogin = async () => {
  if (!email.value || !password.value) {
    toastMessage.value = 'กรุณากรอกอีเมลและรหัสผ่าน'
    showToast.value = true
    return
  }
  loading.value = true
  try {
    await login(email.value, password.value)
    router.replace('/tabs/map')
  } catch (err: any) {
    const code = err?.code || ''
    if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
      toastMessage.value = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
    } else {
      toastMessage.value = 'เกิดข้อผิดพลาด: ' + (err?.message || 'ไม่ทราบสาเหตุ')
    }
    showToast.value = true
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  --background: linear-gradient(160deg, #1B4332 0%, #2D6A4F 50%, #52B788 100%);
}

.login-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 40px 24px 24px;
}

.logo-section {
  text-align: center;
  padding: 48px 0 40px;
}

.logo-icon {
  font-size: 72px;
  line-height: 1;
  margin-bottom: 12px;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
}

.app-title {
  font-size: 36px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 8px;
  text-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

.app-subtitle {
  font-size: 15px;
  color: rgba(255,255,255,0.8);
  margin: 0;
  font-weight: 300;
}

.form-section {
  background: #F9F3E3;
  border-radius: 24px 24px 0 0;
  padding: 32px 20px 24px;
  flex: 1;
  margin-top: auto;
}

.input-item {
  --background: #ffffff;
  --border-radius: 12px;
  --padding-start: 12px;
  margin-bottom: 12px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.login-btn {
  --background: #2D6A4F;
  --background-activated: #1B4332;
  --border-radius: 12px;
  --color: #ffffff;
  font-weight: 600;
  font-size: 16px;
  height: 52px;
  margin-top: 8px;
}

.register-link {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 16px;
  color: #666;
  font-size: 14px;
}

.link-btn {
  --color: #2D6A4F;
  font-weight: 600;
  font-size: 14px;
}
</style>
