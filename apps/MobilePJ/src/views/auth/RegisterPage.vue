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
  --background: #F9F3E3;
}

.register-container {
  padding: 0 0 24px;
}

.header-section {
  background: linear-gradient(160deg, #1B4332 0%, #2D6A4F 100%);
  padding: 60px 20px 40px;
  position: relative;
}

.back-btn {
  --color: rgba(255,255,255,0.8);
  position: absolute;
  top: 52px;
  left: 8px;
  font-size: 20px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 8px;
}

.page-subtitle {
  font-size: 14px;
  color: rgba(255,255,255,0.75);
  margin: 0;
}

.form-section {
  padding: 24px 20px;
}

.input-item {
  --background: #ffffff;
  --border-radius: 12px;
  --padding-start: 12px;
  margin-bottom: 12px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.register-btn {
  --background: #E76F51;
  --background-activated: #c85c3f;
  --border-radius: 12px;
  --color: #ffffff;
  font-weight: 600;
  font-size: 16px;
  height: 52px;
  margin-top: 8px;
}

.login-link {
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
