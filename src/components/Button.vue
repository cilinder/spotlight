<script setup lang="ts">

const props = defineProps<{
  type: "default" | "cancel",
  disabled: boolean
}>()

</script>

<template>
  <button id="button" 
    :class="{ default: type == 'default', cancel: type == 'cancel'}"
    @click="$emit('click')"
    :disabled="props.disabled"
  >
    <slot></slot>
  </button>
</template>

<style lang="css" scoped>
#button {
  display: inline-block;
  height: 3.5ex;
  color: white;
  border-radius: 12px;
  padding: 10px 10px 13px 10px;
  margin-top: 1px;
  font-weight: bold;
  margin-left: 8px;
  margin-right: 8px;
  line-height: 5px;

  &:enabled:hover {
    transform: translateY(-1px) translateX(-1px);
  }


  &:enabled:active {
    transform: translateY(2px) translateX(1px);
    border: none;
    margin-bottom: 3px;
  }

  &:disabled {
    background-color: var(--disabled-color);
    color: white;
    border: none;
  }
}

.default {
  background-color: var(--primary-color);
  border: none;
  border-bottom: 3px solid var(--primary-color-darker);
  border-right: 2px solid var(--primary-color-darker);

  &:enabled:hover {
    border-bottom: 4px solid var(--primary-color-darker);
  }
}

.cancel {
  background-color: var(--cancel-color);
  border: none;
  border-bottom: 3px solid var(--cancel-color-darker);
  border-right: 2px solid var(--cancel-color-darker);

  &:enabled:hover {
    border-bottom: 4px solid var(--cancel-color-darker);
  }
}

</style>
