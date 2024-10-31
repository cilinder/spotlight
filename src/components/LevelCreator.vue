<script setup lang="ts">
import { ref } from 'vue';

const videoLoaded = ref(false);
const src = ref<any>("");
const videoUpload = ref<HTMLInputElement|null>(null);
const videoContainer = ref<HTMLElement | null>(null);
const videoPlayer = ref<HTMLVideoElement | null>(null);
const videoHeight = ref(0);
const videoWidth = ref(0);
const ratio = ref(0);

const currentTime = ref(0);
const videoDuration = ref(0);

const slider = ref(0);

function uploadVideo(event: Event) {
  if (videoUpload.value && videoUpload.value.files) {
    const videoFile = videoUpload.value.files[0];
    const fs = new FileReader();
    fs.onload = () => {
      if (fs.result) {
        src.value = fs.result;
      }
    };
    fs.readAsDataURL(videoFile);
    videoLoaded.value = true;
  }
  else {
    alert("Video upload failed.");
  }
}

function readMetadata(event: Event) {
  if (videoPlayer.value) {
    videoDuration.value = videoPlayer.value?.duration;
    // videoHeight.value = videoPlayer.value.videoHeight;
    console.log(videoPlayer.value.videoHeight, videoPlayer.value.videoWidth);
    ratio.value = videoPlayer.value.videoWidth / videoPlayer.value.videoHeight;
    console.log("Ratio: ", ratio.value);

    if (videoContainer.value) {
      videoWidth.value = videoContainer.value.getBoundingClientRect().width;
      videoHeight.value = videoWidth.value / ratio.value;
    }
  }
}

function setFrame(event: Event) {
  if (videoPlayer.value) {
    videoPlayer.value.currentTime = slider.value;
  }
}

function addPoint() {

}

function handleClickCanvas(event: MouseEvent) {
  const x = event.clientX;
  const y = event.clientY;
  console.log("Canvas: ", x, y);
  console.log("Video player: ", videoPlayer.value?.getBoundingClientRect());
}


const formatter = new Intl.NumberFormat("en-US", {minimumIntegerDigits: 2})
function formatTime(time: number) {
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor(time % 3600 / 60);
  const seconds = Math.floor(time % 60);
  if (hours > 0) {
    return `${hours}:${formatter.format(minutes)}:${formatter.format(seconds)}`;
  }
  else {
    return `${formatter.format(minutes)}:${formatter.format(seconds)}`;
  }
}

// We have to adjust the size of the video and canvas when the window size changes
// otherwise the video has a fixed size forever and it looks wierd
addEventListener("resize", () => {
  if (videoContainer.value) {
    videoWidth.value = videoContainer.value.getBoundingClientRect().width;
    videoHeight.value = videoWidth.value / ratio.value;
  }
});

</script>

<template>
  <div class="container">
    <div class="video-control-container">
      <div class="video-container" ref="videoContainer">
        <input 
          v-if="!videoLoaded"
          type="file"
          name="video"
          size="65"
          id="upload-video"
          ref="videoUpload"
          @change="uploadVideo"
        />
        <template v-else>
          <div >
            <video 
              ref="videoPlayer"
              :key="src"
              :style="{ height: `${videoHeight}px`, width: `${videoWidth}px`}"
              @loadedmetadata="readMetadata"
            >
              <source :src="src" />
              Your browser does not support HTML5 video.
            </video>
            <canvas
              ref="canvas"
              id="canvas"
              :style="{ height: `${videoHeight}px`, width: `${videoWidth}px`}"
              @click="handleClickCanvas"
            >
            </canvas>
          </div>
        </template>
      </div>

      <div class="time-control-container">
        <div class="timestamp">{{ formatTime(currentTime) }}</div>
        <input class="slider" type="range" min="0" :max="videoDuration" step="any" v-model="slider" @mouseup="setFrame">
        <div class="timestamp">{{ formatTime(videoDuration) }}</div>
      </div>
    </div>
    
    <div class="editing-container">
      <button @click="addPoint" id="add-point" :disabled="!videoLoaded">Add point</button>
      
    </div>
  </div>
</template>

<style lang="css" scoped>
.container {
  position: absolute;
  display: flex;
  flex-direction: row;
  width: 80vw;
  height: 80vh;
  margin-top: 10vh;
  margin-left: 10vw;
  border: 1px solid red;
}

.video-control-container {
  border: 1px solid green;
  width: 60%;
  height: 100%;
}

.video-container {
  border: 1px solid black;
  width: 100%;
  height: 90%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.time-control-container {
  border: 1px solid red;
  width: 100%;
  height: 10%;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
}

.editing-container {
  border: 1px solid green;
  width: 40%;
  height: 100%;
  display: flex;
  justify-content: center;
}

#upload-video {

}

video {
  width: 100%;
  /* height: 100%; */
}

#canvas {
  width: 60%;
  position: absolute;
  /* height: 480px; */
  left: 0;
}

.slider {
  width: 80%;
}

#add-point {
  height: 2em;
}

</style>
