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
  --background: #3DAA6B;
}

.login-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 0;
  background: linear-gradient(170deg, #1E6E43 0%, #3DAA6B 45%, #6FCC97 100%);
}

.logo-section {
  text-align: center;
  padding: 56px 24px 40px;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.logo-icon {
  font-size: 80px;
  line-height: 1;
  margin-bottom: 16px;
  filter: drop-shadow(0 6px 16px rgba(0,0,0,0.25));
}

.app-title {
  font-size: 42px;
  font-weight: 900;
  color: #ffffff;
  margin: 0 0 8px;
  letter-spacing: -1px;
  text-shadow: 0 3px 12px rgba(0,0,0,0.2);
}

.app-subtitle {
  font-size: 16px;
  color: rgba(255,255,255,0.88);
  margin: 0;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.form-section {
  background: #ffffff;
  border-radius: 32px 32px 0 0;
  padding: 36px 24px 32px;
  box-shadow: 0 -8px 32px rgba(0,0,0,0.12);
}

.form-section::before {
  content: '';
  display: block;
  width: 40px;
  height: 4px;
  background: #DAE8DA;
  border-radius: 99px;
  margin: 0 auto 28px;
}

.input-item {
  --background: #F4F9F5;
  --border-radius: 14px;
  --padding-start: 14px;
  margin-bottom: 14px;
  border-radius: 14px;
  border: 2px solid #DAE8DA;
}

.login-btn {
  --background: #3DAA6B;
  --background-activated: #1E6E43;
  --background-hover: #34956e;
  --border-radius: 14px;
  --color: #ffffff;
  font-weight: 800;
  font-size: 17px;
  height: 54px;
  margin-top: 12px;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 16px rgba(61,170,107,0.4);
}

.register-link {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 18px;
  color: #4A6A4A;
  font-size: 14px;
  font-weight: 500;
}

.link-btn {
  --color: #3DAA6B;
  font-weight: 800;
  font-size: 15px;
}
</style>
