<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

interface CardProps {
  class?: string
}

const props = defineProps<CardProps>()

const classes = computed(() => cn(
  'rounded-xl border bg-white shadow-sm transition-all hover:shadow-md',
  props.class
))
</script>

<template>
  <div :class="classes">
    <slot />
  </div>
</template>
