import type { DefineComponent, PropType } from 'vue'
import { computed, defineComponent, h, onUnmounted, ref, watchEffect } from 'vue'
import type { Props } from './types'
export const AdaptiveImage = defineComponent({
  name: 'AdaptiveImage',
  props: {
    src: {
      type: String,
      require: true,
      default: '',
    },
    size: {
      type: Array as PropType<number[]>,
      require: true,
      default: () => [],
    },
    alt: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    if (!props.size.length)
      throw new Error('Props size is needed')

    const imgRef = ref<HTMLImageElement>()

    function useWidth(imgRef: any) {
      const width = ref(0)
      const observer = new ResizeObserver(() => {
        width.value = imgRef.value.width
      })
      let img: any = null
      watchEffect(() => {
        const _img = imgRef.value
        if (_img) {
          img = _img
          observer.observe(img)
        }
        else if (img) {
          observer.unobserve(img)
        }
      })
      return width
    }

    function useDpr() {
      const dpr = ref(window.devicePixelRatio)
      const observer = new ResizeObserver(() => {
        dpr.value = window.devicePixelRatio
      })
      observer.observe(document.documentElement)
      onUnmounted(() => {
        observer.unobserve(document.documentElement)
      })
      return dpr
    }

    const width = computed(() => useWidth(imgRef))

    const dpr = computed(() => useDpr())
    const imageSrc = ref(props.src)

    const changeSrc = (replacer: number) => {
      const src = props.src
      const type = src.split('.').pop()
      const reg = new RegExp(`@\\w+.${type}`)
      return src.replace(reg, () => `@${replacer}.${type}`)
    }

    watchEffect(() => {
      const realWidth = width.value.value * dpr.value.value
      const allSize = [...props.size]
      const adapt = allSize.find(item => item >= realWidth) ?? allSize.pop()!
      imageSrc.value = changeSrc(adapt)
    })

    return () => h('img', {
      ref: imgRef,
      src: imageSrc.value,
      alt: props.alt,
    },
    )
  },
}) as DefineComponent<Props>
