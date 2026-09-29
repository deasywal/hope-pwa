import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import ProdukView from '../views/ProdukView.vue'
import TransaksiView from '../views/TransaksiView.vue'
import LaporanView from '../views/LaporanView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: DashboardView },
    { path: '/dashboard', name: 'dashboard', component: DashboardView }, // <-- Ditambahkan agar sinkron
    { path: '/produk', name: 'produk', component: ProdukView },
    { path: '/transaksi', name: 'transaksi', component: TransaksiView },
    { path: '/laporan', name: 'laporan', component: LaporanView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView }
  ]
})

export default router