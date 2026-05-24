declare module '*.css'
declare module '*.scss'
declare module '*.sass'
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}
