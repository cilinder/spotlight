<script setup lang="ts">
import { ref } from "vue";

const emit = defineEmits<{
  load: [video: File],
  start: [],
}>();
const videoUpload = ref<HTMLInputElement|null>(null);
const videoFile = ref<File|null>(null);
const startDisabled = ref(true);

function uploadVideo(event: Event) {
  if (videoUpload.value && videoUpload.value.files) {
    videoFile.value = videoUpload.value.files[0];
    startDisabled.value = false;
    emit('load', videoFile.value);
  }
  else {
    alert("Video upload failed.");
  }
}

function startVideo() {
  if (videoFile.value){
    emit('start');
  }
  else {
    alert("Video not uploaded.")
  }
}
</script>

<template>
    <button id="start-button" :disabled="startDisabled" @click="startVideo">Start</button>
    <input 
      type="file" 
      name="video" 
      size="65" 
      id="upload-video" 
      ref="videoUpload" 
      @change="uploadVideo"
    />
</template>

<style scoped lang="css">

</style>