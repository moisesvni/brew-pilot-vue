import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const routes = [
  // ── Rotas públicas (com AuthLayout) ────────────────────────────────────────
  {
    path: '/',
    component: () => import('../layouts/AuthLayout.vue'),
    meta: { public: true },
    children: [
      {
        path: 'login',
        name: 'Login',
        component: () => import('../pages/auth/LoginPage.vue'),
        meta: { title: 'Login', public: true }
      },
      {
        path: 'register',
        name: 'Register',
        component: () => import('../pages/auth/RegisterPage.vue'),
        meta: { title: 'Cadastro', public: true }
      }
    ]
  },

  // ── Rotas protegidas (com layout) ──────────────────────────────────────────
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/recipes' },
      {
        path: 'recipes',
        name: 'RecipeList',
        component: () => import('../pages/recipes/RecipeListPage.vue'),
        meta: { title: 'Receitas' }
      },
      {
        path: 'recipes/new',
        name: 'RecipeNew',
        component: () => import('../pages/recipes/RecipeEditorPage.vue'),
        meta: { title: 'Nova Receita' }
      },
      {
        path: 'recipes/:id',
        name: 'RecipeEditor',
        component: () => import('../pages/recipes/RecipeEditorPage.vue'),
        meta: { title: 'Editar Receita' }
      },
      {
        path: 'equipment',
        name: 'EquipmentList',
        component: () => import('../pages/equipment/EquipmentPage.vue'),
        meta: { title: 'Equipamentos' }
      },
      {
        path: 'ingredients',
        name: 'IngredientsList',
        component: () => import('../pages/ingredients/IngredientsPage.vue'),
        meta: { title: 'Ingredientes' }
      },
      {
        path: 'styles',
        name: 'StylesList',
        component: () => import('../pages/styles/StylesPage.vue'),
        meta: { title: 'Estilos BJCP' }
      }
    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('../pages/ErrorNotFound.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// ── Guard de autenticação ──────────────────────────────────────────────────
router.beforeEach((to) => {
  const auth = useAuthStore()
  const requiresAuth = to.matched.some(r => r.meta.requiresAuth)
  const isPublic     = to.matched.some(r => r.meta.public)

  if (requiresAuth && !auth.isAuthenticated) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  if (isPublic && auth.isAuthenticated) {
    return { path: '/' }
  }
})

router.afterEach((to) => {
  const title = to.meta?.title as string | undefined
  if (title) document.title = `${title} — BrewPilot`
})

export default router

