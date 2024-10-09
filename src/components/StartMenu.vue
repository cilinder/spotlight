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
#start-button {
  border-radius: 12px;
  padding: 7px 10px;
  margin-top: 1px;
  font-weight: bold;
  margin-left: 8px;
  margin-right: 8px;
  width: 100px;
  height: 40px;
  font-size: large;
  color: black;

  &:enabled {
    background-color: var(--primary-color);
    border: none;
    border-bottom: 4px solid var(--primary-color-darker); 
    border-right: 3px solid var(--primary-color-darker); 
    &:hover {
      transform: translateY(-1px);
      border-bottom: 4px solid var(--primary-color-darker); 
    }
  
    &:active {
      transform: translateY(2px) translateX(2px);
      border: none;
      margin-bottom: 3px;
    }
  }

  &:disabled {
    background-color: var(--disabled-color);
  }
}
</style>