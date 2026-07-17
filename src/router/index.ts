import { createRouter, createWebHistory } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: DefaultLayout,
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/views/HomePage.vue'),
        },
        {
          path: '/uk-visa',
          name: 'uk-visa',
          meta: { titleKey: 'ukVisa.title' },
          component: () => import('@/views/UKVisaForm.vue'),
        },
        {
          path: '/us-visa',
          name: 'us-visa',
          meta: { titleKey: 'usVisa.title' },
          component: () => import('@/views/USVisaForm.vue'),
        },
      ],
    },
  ],
})

export default router
