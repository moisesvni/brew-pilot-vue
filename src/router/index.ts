import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const routes = [
  // ── Rotas públicas (com AuthLayout) ────────────────────────────────────────
  {
    path: '/',
    component: () => import('@/layouts/AuthLayout.vue'),
    meta: { public: true },
    children: [
      {
        path: 'login',
        name: 'Login',
        component: () => import('@/pages/auth/LoginPage.vue'),
        meta: { title: 'Login', public: true }
      },
      {
        path: 'register',
        name: 'Register',
        component: () => import('@/pages/auth/RegisterPage.vue'),
        meta: { title: 'Cadastro', public: true }
      }
    ]
  },

  // ── Rotas protegidas (com layout) ──────────────────────────────────────────
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/recipes' },
      {
        path: 'recipes',
        name: 'RecipeList',
        component: () => import('@/pages/recipes/RecipeListPage.vue'),
        meta: { title: 'Receitas' }
      },
      {
        path: 'recipes/new',
        name: 'RecipeNew',
        component: () => import('@/pages/recipes/RecipeEditorPage.vue'),
        meta: { title: 'Nova Receita' }
      },
      {
        path: 'recipes/:id',
        name: 'RecipeEditor',
        component: () => import('@/pages/recipes/RecipeEditorPage.vue'),
        meta: { title: 'Editar Receita' }
      },
      {
        path: 'equipment',
        name: 'EquipmentList',
        component: () => import('@/pages/equipment/EquipmentPage.vue'),
        meta: { title: 'Equipamentos' }
      },
      {
        path: 'ingredients',
        name: 'IngredientsList',
        component: () => import('@/pages/ingredients/IngredientsPage.vue'),
        meta: { title: 'Ingredientes' }
      },
      {
        path: 'styles',
        name: 'StylesList',
        component: () => import('@/pages/styles/StylesPage.vue'),
        meta: { title: 'Estilos BJCP' }
      },
      {
        path: 'batches',
        name: 'BatchList',
        component: () => import('@/pages/batches/BatchesPage.vue'),
        meta: { title: 'Lotes' }
      },
      {
        path: 'devices',
        name: 'DeviceList',
        component: () => import('@/pages/devices/DevicesPage.vue'),
        meta: { title: 'Dispositivos' }
      },
      {
        path: 'inventory',
        name: 'Inventory',
        component: () => import('@/pages/inventory/InventoryPage.vue'),
        meta: { title: 'Estoque' }
      },
      {
        path: 'library',
        name: 'Library',
        component: () => import('@/pages/library/LibraryPage.vue'),
        meta: { title: 'Biblioteca' }
      },
      {
        path: 'profiles',
        name: 'Profiles',
        component: () => import('@/pages/profiles/ProfilesPage.vue'),
        meta: { title: 'Perfis' }
      },
      {
        path: 'profiles/equipment',
        name: 'ProfilesEquipment',
        component: () => import('@/pages/profiles/equipment/EquipmentProfilesPage.vue'),
        meta: { title: 'Equipamento' }
      },
      {
        path: 'profiles/mash',
        name: 'ProfilesMash',
        component: () => import('@/pages/profiles/mash/MashProfilesPage.vue'),
        meta: { title: 'Mostura' }
      },
      {
        path: 'tools',
        name: 'Tools',
        component: () => import('@/pages/tools/ToolsPage.vue'),
        meta: { title: 'Ferramentas' }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/pages/settings/SettingsPage.vue'),
        meta: { title: 'Configurações' }
      }
    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('@/pages/ErrorNotFound.vue')
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
    return { name: 'RecipeList' }
  }
})

router.afterEach((to) => {
  const title = to.meta?.title as string | undefined
  if (title) document.title = `${title} — BrewPilot`
})

export default router

