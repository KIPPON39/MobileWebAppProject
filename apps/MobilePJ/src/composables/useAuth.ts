import { ref } from 'vue'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase/config'

const currentUser = ref<User | null>(null)
const authReady = ref(false)

onAuthStateChanged(auth, (user) => {
  currentUser.value = user
  authReady.value = true
})

export function useAuth() {
  const login = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    return cred.user
  }

  const register = async (name: string, email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName: name })
    await setDoc(doc(db, 'users', cred.user.uid), {
      displayName: name,
      email,
      favorites: [],
      reviewCount: 0,
      createdAt: serverTimestamp()
    })
    return cred.user
  }

  const logout = async () => {
    await signOut(auth)
  }

  return { currentUser, authReady, login, register, logout }
}
