import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import ProdukView from '../views/ProdukView.vue'
import TransaksiView from '../views/TransaksiView.vue'
import LaporanView from '../views/LaporanView.vue'
import LoginView from '../views/LoginView.vue' // 1. Import file LoginView

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login', // 2. Tambahkan rute login di sini
      name: 'login',
      component: LoginView
    },
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView
    },
    {
      path: '/produk',
      name: 'produk',
      component: ProdukView
    },
    {
      path: '/transaksi',
      name: 'transaksi',
      component: TransaksiView
    },
    {
      path: '/laporan',
      name: 'laporan',
      component: LaporanView
    }
  ]
})

export default router