<script setup lang="ts">
const props = defineProps<{
  savedOverlays: Blob[],
  savedFrames: Blob[],
}>()

const overlayURLs = props.savedOverlays.map(URL.createObjectURL);
const frameURLs = props.savedFrames.map(URL.createObjectURL);

const revokeURL = URL.revokeObjectURL;

</script>

<template>
<div class="resultBox">
    <div v-for="(overlay, i) in overlayURLs" :key="i" class="imageBox">
        <img :src="overlay" @load="revokeURL(overlay)" class="overlay"></img>
        <img :src="frameURLs[i]" @load="revokeURL(frameURLs[i])" class="frame"></img>
    </div>
</div>
</template>

<style lang="css" scoped>
.resultBox {
    display: flex;
    flex-direction: column;
    gap: 1em;
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