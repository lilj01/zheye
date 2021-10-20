import { ref, onMounted, onUnmounted, Ref } from 'vue'

/**
 * 判断是否点击到了下拉组件外部
 * @param elementRef 元素 Ref类型
 * 返回响应式对象
 */
const useClickOutside = (elementRef: Ref<null | HTMLElement>):Ref<boolean> => {
  const isClickOutside = ref(false)
  const handler = (e: MouseEvent) => {
    if (elementRef.value) {
      if (elementRef.value.contains(e.target as HTMLElement)) {
        isClickOutside.value = false
      } else {
        isClickOutside.value = true
      }
    }
  }
  onMounted(() => {
    document.addEventListener('click', handler)
  })
  onUnmounted(() => {
    document.removeEventListener('click', handler)
  })
  return isClickOutside
}

export default useClickOutside
