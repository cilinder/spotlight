<script setup lang="ts">
import { ref, computed } from 'vue';

type Point = {
  id : number;
  x : number;
  y : number;
  timestamp : number;
};

const videoLoaded = ref(false);
const src = ref<any>("");
const videoUpload = ref<HTMLInputElement|null>(null);
const videoContainer = ref<HTMLElement | null>(null);
const videoPlayer = ref<HTMLVideoElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);
const ctx = computed(() => {
  return canvas.value ? canvas.value.getContext("2d") : null;
})

const videoHeight = ref(0);
const videoWidth = ref(0);
const ratio = ref(0);
const videoTop = computed(() => {
  return videoPlayer.value ? videoPlayer.value.getBoundingClientRect().top : 0; 
});
const videoLeft = computed(() => {
  return videoPlayer.value ? videoPlayer.value.getBoundingClientRect().left : 0; 
});

const currentTime = ref(0);
const videoDuration = ref(0);

const videoSlider = ref(0);
const lightRadius = ref(0);

const addingPoint = ref(false);
const cursorType = computed(() => {return addingPoint.value ? "crosshair" : "default"})

const points = ref<Point[]>([]);
let _uuid = 0;

function uuid() {
  return _uuid++;
}

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
    ratio.value = videoPlayer.value.videoWidth / videoPlayer.value.videoHeight;

    if (videoContainer.value) {
      videoWidth.value = videoContainer.value.getBoundingClientRect().width;
      videoHeight.value = videoWidth.value / ratio.value;
    }
  }
}

function setFrame(event: Event) {
  if (videoPlayer.value) {
    videoPlayer.value.currentTime = videoSlider.value;
  }
}

function addPoint() {
  addingPoint.value = true;
  console.log(addingPoint.value, cursorType.value);
}

function handleClickCanvas(event: MouseEvent) {
  console.log(addingPoint.value);
  if (addingPoint.value && videoPlayer.value) {
    const x = event.clientX;
    const y = event.clientY;
    const xNorm = Math.max(Math.min((x - videoLeft.value) / videoWidth.value, 1), 0);
    const yNorm = Math.max(Math.min((y - videoTop.value) / videoHeight.value, 1), 0);
    points.value.push({id: uuid(), x: xNorm, y: yNorm, timestamp: videoPlayer.value.currentTime});
    addingPoint.value = false;
    drawPoints();
  }
}

function drawCross(x: number, y: number, ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.strokeStyle = "red";
  ctx.moveTo(x-5, y-5);
  ctx.lineTo(x+5, y+5);
  ctx.moveTo(x-5, y+5);
  ctx.lineTo(x+5, y-5);
  ctx.stroke();
}

function drawCircle(x: number, y: number, r: number, ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.strokeStyle = "black";
  ctx.arc(x, y, 50, 0, Math.PI * 2);
  ctx.stroke();
}

function drawPoints() {
  if (ctx.value) {
    for (const pt of points.value) {
      const x = (pt.x * videoWidth.value);
      const y = (pt.y * videoHeight.value);
      drawCross(x, y, ctx.value);
      drawCircle(x, y, 50, ctx.value);
    }
  }
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
              :width="videoWidth"
              :height="videoHeight"
              :style="{ height: `${videoHeight}px`, width: `${videoWidth}px`, cursor: `${cursorType}`}"
              @click="handleClickCanvas"
            >
            </canvas>
          </div>
        </template>
      </div>

      <div class="time-control-container">
        <div class="timestamp">{{ formatTime(currentTime) }}</div>
        <input class="videoSlider" type="range" min="0" :max="videoDuration" step="any" v-model="videoSlider" @mouseup="setFrame">
        <div class="timestamp">{{ formatTime(videoDuration) }}</div>
      </div>
    </div>
    
    <div class="editing-container">
      <div>
        <label>Light radius</label>
        <input class="radiusPicker" type="range" min="0" max="1" step="any" v-model="lightRadius">
      </div>
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
  flex-direction: column;
  gap: 1em;
}

#upload-video {

}

video {
  width: 100%;
}

#canvas {
  position: absolute;
  left: 0;
}

.videoSlider {
  width: 80%;
}

#add-point {
  height: 2em;
}

</style>
