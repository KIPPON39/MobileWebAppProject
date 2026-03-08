<template>
  <ion-page class="register-page">
    <ion-content :fullscreen="true">
      <div class="register-container">
        <div class="header-section">
          <ion-button fill="clear" class="back-btn" router-link="/login">
            <ion-icon :icon="arrowBackOutline" />
          </ion-button>
          <h1 class="page-title">สมัครสมาชิก</h1>
          <p class="page-subtitle">ร่วมสำรวจธรรมชาติไทยกับเรา</p>
        </div>

        <div class="form-section">
          <ion-item class="input-item" lines="none">
            <ion-icon :icon="personOutline" slot="start" color="medium" />
            <ion-input v-model="name" type="text" placeholder="ชื่อ-นามสกุล" />
          </ion-item>

          <ion-item class="input-item" lines="none">
            <ion-icon :icon="mailOutline" slot="start" color="medium" />
            <ion-input v-model="email" type="email" placeholder="อีเมล" autocomplete="email" />
          </ion-item>

          <ion-item class="input-item" lines="none">
            <ion-icon :icon="lockClosedOutline" slot="start" color="medium" />
            <ion-input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)"
            />
            <ion-button slot="end" fill="clear" @click="showPassword = !showPassword">
              <ion-icon :icon="showPassword ? eyeOffOutline : eyeOutline" color="medium" />
            </ion-button>
          </ion-item>

          <ion-item class="input-item" lines="none">
            <ion-icon :icon="shieldCheckmarkOutline" slot="start" color="medium" />
            <ion-input
              v-model="confirmPassword"
              :type="showConfirm ? 'text' : 'password'"
              placeholder="ยืนยันรหัสผ่าน"
            />
            <ion-button slot="end" fill="clear" @click="showConfirm = !showConfirm">
              <ion-icon :icon="showConfirm ? eyeOffOutline : eyeOutline" color="medium" />
            </ion-button>
          </ion-item>

          <ion-button
            expand="block"
            class="register-btn"
            :disabled="loading"
            @click="handleRegister"
          >
            <ion-spinner v-if="loading" name="crescent" />
            <span v-else>สมัครสมาชิก</span>
          </ion-button>

          <div class="login-link">
            <span>มีบัญชีอยู่แล้ว?</span>
            <ion-button fill="clear" router-link="/login" class="link-btn">เข้าสู่ระบบ</ion-button>
          </div>
        </div>
      </div>

      <ion-toast
        :is-open="showToast"
        :message="toastMessage"
        :duration="3000"
        :color="toastColor"
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
import {
  personOutline, mailOutline, lockClosedOutline,
  eyeOutline, eyeOffOutline, shieldCheckmarkOutline, arrowBackOutline
} from 'ionicons/icons'
import { useAuth } from '../../composables/useAuth'

const router = useRouter()
const { register } = useAuth()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirm = ref(false)
const loading = ref(false)
const showToast = ref(false)
const toastMessage = ref('')
const toastColor = ref('danger')

const handleRegister = async () => {
  if (!name.value || !email.value || !password.value || !confirmPassword.value) {
    toastMessage.value = 'กรุณากรอกข้อมูลให้ครบ'
    toastColor.value = 'danger'
    showToast.value = true
    return
  }
  if (password.value !== confirmPassword.value) {
    toastMessage.value = 'รหัสผ่านไม่ตรงกัน'
    toastColor.value = 'danger'
    showToast.value = true
    return
  }
  if (password.value.length < 6) {
    toastMessage.value = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'
    toastColor.value = 'danger'
    showToast.value = true
    return
  }
  loading.value = true
  try {
    await register(name.value, email.value, password.value)
    toastMessage.value = 'สมัครสมาชิกสำเร็จ!'
    toastColor.value = 'success'
    showToast.value = true
    setTimeout(() => router.replace('/tabs/map'), 1000)
  } catch (err: any) {
    const code = err?.code || ''
    if (code === 'auth/email-already-in-use') {
      toastMessage.value = 'อีเมลนี้ถูกใช้งานแล้ว'
    } else {
      toastMessage.value = 'เกิดข้อผิดพลาด: ' + (err?.message || 'ไม่ทราบสาเหตุ')
    }
    toastColor.value = 'danger'
    showToast.value = true
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page {
  --background: #F4F9F5;
}

.register-container {
  padding: 0 0 32px;
}

.header-section {
  background: linear-gradient(160deg, #1E6E43 0%, #3DAA6B 100%);
  padding: 64px 22px 44px;
  position: relative;
}

.back-btn {
  --color: rgba(255,255,255,0.9);
  position: absolute;
  top: 54px;
  left: 8px;
  font-size: 22px;
}

.page-title {
  font-size: 34px;
  font-weight: 900;
  color: #ffffff;
  margin: 0 0 8px;
  letter-spacing: -0.5px;
  text-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.page-subtitle {
  font-size: 15px;
  color: rgba(255,255,255,0.85);
  margin: 0;
  font-weight: 500;
}

.form-section {
  padding: 28px 22px;
}

.input-item {
  --background: #ffffff;
  --border-radius: 14px;
  --padding-start: 14px;
  margin-bottom: 14px;
  border-radius: 14px;
  border: 2px solid #DAE8DA;
  box-shadow: 0 2px 8px rgba(61,170,107,0.06);
}

.register-btn {
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
  box-shadow: 0 4px 16px rgba(61,170,107,0.35);
}

.login-link {
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
