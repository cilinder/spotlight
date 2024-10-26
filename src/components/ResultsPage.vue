<script setup lang="ts">
import { ref } from 'vue';
import ResultDetails from "./ResultDetails.vue";

const props = defineProps<{
    screenshots: {overlay: Blob, frame: Blob, timestamp: number}[]
}>()

const screenshots = props.screenshots.map(({overlay, frame, timestamp}) => {
    return {overlay, frame, timestamp, overlayURL: URL.createObjectURL(overlay), frameURL: URL.createObjectURL(frame)};
})

const revokeURL = URL.revokeObjectURL;

const selectedScreenshot = ref<number | null>(null);

function selectScreenshot(i: number) {
    console.log(i);
    selectedScreenshot.value = i;
}

</script>

<template>
<div class="results">
    <div class="imageBox">
        <div v-for="(screenshot, i) in screenshots" :key="i" @click="selectScreenshot(i)">
            <img :src="screenshot.overlayURL" @load="revokeURL(screenshot.overlayURL)" class="overlay" :class="{ selected: selectedScreenshot === i }" width="300" height="auto">
            <img :src="screenshot.frameURL" @load="revokeURL(screenshot.frameURL)" class="frame" width="300" height="auto">
        </div>
    </div>
    <div class="detailsBox" v-if="selectedScreenshot != null">
        <ResultDetails :screenshot="screenshots[selectedScreenshot]"/>
    </div>
</div>
</template>

<style lang="css" scoped>
.results {
    display: flex;
    flex-direction: row;
    gap: 1em;
}

.imageBox {
    display: flex;
    flex-direction: column;
    position: relative;
}

.overlay {
    position: absolute;
    z-index: 200;

}

.selected {
    border: 2px solid rgb(26, 167, 29);
}

.frame {
    top: 0;
    left: 0;
    z-index: 100;
}

</style>