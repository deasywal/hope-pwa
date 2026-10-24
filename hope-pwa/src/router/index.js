import { createRouter, createWebHistory } from 'vue-router'
import SplashView from '../views/SplashView.vue'
import DashboardView from '../views/DashboardView.vue'
import ProdukView from '../views/ProdukView.vue'
import TransaksiView from '../views/TransaksiView.vue'
import LaporanView from '../views/LaporanView.vue'
import ProfilView from '../views/ProfilView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'splash', component: SplashView },
    { path: '/dashboard', name: 'dashboard', component: DashboardView },
    { path: '/produk', name: 'produk', component: ProdukView },
    { path: '/transaksi', name: 'transaksi', component: TransaksiView },
    { path: '/laporan', name: 'laporan', component: LaporanView },
    { path: '/profil', name: 'profil', component: ProfilView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView }
  ]
})

// Proteksi rute: Wajib login sebelum akses halaman utama
router.beforeEach((to) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  const halamanPublik = ['/', '/login', '/register']

  // kalau belum login dan mau akses halaman selain publik, lempar ke /login
  if (!isLoggedIn && !halamanPublik.includes(to.path)) {
    return '/login'
  }

  // kalau sudah login dan mampir ke login/register, arahkan ke /dashboard
  if (isLoggedIn && (to.path === '/login' || to.path === '/register')) {
    return '/dashboard'
  }
})

export default router