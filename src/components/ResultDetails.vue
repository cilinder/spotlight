<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    screenshot: {
        overlay: Blob,
        frame: Blob,
        timestamp: number,
    }
}>()

const overlayURL = computed(() => URL.createObjectURL(props.screenshot.overlay));
const frameURL = computed(() => URL.createObjectURL(props.screenshot.frame));

const revokeURL = computed(() => URL.revokeObjectURL);

</script>

<template>
<div class="resultBox">
    <div class="imageBox">
        <img :src="overlayURL" @load="revokeURL(overlayURL)" class="overlay">
        <img :src="frameURL" @load="revokeURL(frameURL)" class="frame">
    </div>
    <div class="detailsBox">
        timestamp: {{ new Intl.NumberFormat('en-US', {maximumFractionDigits: 1}).format(props.screenshot.timestamp) }} s
    </div>
</div>
</template>

<style lang="css" scoped>
.resultBox {
    display: flex;
    flex-direction: column;
}

.imageBox {
    position: relative;
}

.overlay {
    position: absolute;
    z-index: 200;
}

.frame {
    top: 0;
    left: 0;
    z-index: 100;
}

</style>