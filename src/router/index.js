import Orders from '@/views/Orders.vue'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'orders',
    component: Orders
  },
]
// AIzaSyCoQ58bNGXYgXOMKAlTjPjgrr6_4N2gyY0

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
