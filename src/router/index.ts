import { createRouter, createWebHistory } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

const router = createRouter({
  history: createWebHistory(),
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
      ],
    },
  ],
})

export default router
