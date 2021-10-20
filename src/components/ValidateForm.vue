<template>
  <div class="validate-form-container">
    <slot/>
    <div class="submit-area" @click="submitForm">
      <slot name="submit">
        <button type="submit" class="btn btn-primary mb-3">提交</button>
      </slot>
    </div>
  </div>
</template>

<script lang="ts">

import { defineComponent, onUnmounted } from 'vue'
import mitt from 'mitt'
type ValidateFunc = () => boolean
type ResetFunc = () => void
type Events = {
  'form-item-created': ValidateFunc,
  'form-item-reset': ResetFunc
}
export const emitter = mitt<Events>()
export default defineComponent({
  name: 'ValidateForm',
  emits: ['form-submit'],
  setup (props, context) {
    let funcArr: ValidateFunc[] = []
    let resetArr: ResetFunc[] = []
    const submitForm = () => {
      const result = funcArr.map(func => func()).every(result => result)
      context.emit('form-submit', result)
      if (result) {
        reSetInput()
      }
    }
    const reSetInput = () => {
      resetArr.map(func => func()).every(result => result)
    }
    const validCallBack = (func?: ValidateFunc) => {
      if (func) {
        funcArr.push(func)
      }
    }

    const resetCallBack = (func?: ResetFunc) => {
      if (func) {
        resetArr.push(func)
      }
    }
    emitter.on('form-item-created', validCallBack)
    emitter.on('form-item-reset', resetCallBack)
    onUnmounted(() => {
      emitter.off('form-item-created', validCallBack)
      emitter.off('form-item-reset', resetCallBack)
      funcArr = []
      resetArr = []
    })
    return {
      submitForm,
      validCallBack,
      resetCallBack
    }
  }
})
</script>

<style>

</style>
