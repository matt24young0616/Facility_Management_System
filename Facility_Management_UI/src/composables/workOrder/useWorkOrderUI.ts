import { ref } from 'vue'

export const showWODropdown = ref(false)
export const mapMode = ref<'idle' | 'selecting' | 'selected'>('idle')
export const workOrderUIState = ref<'hidden' | 'form-open' | 'minimized'>('hidden')
export const workOrderFlowStep = ref<'idle' | 'choose-type' | 'in-process'>('idle')