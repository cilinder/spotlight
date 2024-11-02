<script setup lang="ts">
import { ref, computed } from 'vue';
import Button from './Button.vue';

type Point = {
  id : number;
  x : number;
  y : number;
  timestamp : number;
};

type Mode = "Not loaded" | "Normal" | "Adding point" | "Editing point";

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
const radiusSlider = ref(0.5);
const lightRadius = computed(() => {
  return Math.min(videoWidth.value, videoHeight.value) * 0.2 * radiusSlider.value;
})
const addingPoint = ref(false);
const cursorType = computed(() => {return addingPoint.value ? "crosshair" : "default"})
const points = ref<Point[][]>([]);
const currentPoints = computed(() => {
  let pts = [];
  if (videoPlayer.value) {
    for (const idpts of points.value) {
      for (const pt of idpts) {
        if (pt.timestamp <= currentTime.value) {
          pts.push(pt)
        }
      }
    }
  }
  return pts;
});

const currentMode = computed<Mode>(() => {
  if (!videoLoaded.value) {
    return "Not loaded";
  } else if (addingPoint.value) {
    return "Adding point";
  } else if (selectedPoint.value != null) {
    return "Editing point";
  }
  return "Normal";
})

let _uuid = 0;
const selectedPoint = ref<number|null>(null);
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
    redrawPoints();
    selectedPoint.value = null;
  }
}

function addPoint() {
  addingPoint.value = true;
}

function cancelAddingPoint() {
  addingPoint.value = false;
}

function selectPoint(point: Point) {
  selectedPoint.value = point.id;
  redrawPoints();
  highlightPoint(point);
}

function cancelEditingPoint() {
  selectedPoint.value = null;
  redrawPoints();
}

function highlightPoint(point: Point) {
  if (ctx.value) {
    drawPoint(point, "highlight", ctx.value)
  }
}

function hoverHighlight(point: Point) {
  if (currentMode.value != "Editing point") {
    highlightPoint(point);
  }
}

function hoverUnhighlight() {
  if (currentMode.value != "Editing point") {
    redrawPoints();
  }
}

function handleClickCanvas(event: MouseEvent) {
  console.log(addingPoint.value);
  if (addingPoint.value && videoPlayer.value) {
    const x = event.clientX;
    const y = event.clientY;
    const xNorm = Math.max(Math.min((x - videoLeft.value) / videoWidth.value, 1), 0);
    const yNorm = Math.max(Math.min((y - videoTop.value) / videoHeight.value, 1), 0);
    points.value.push([{id: uuid(), x: xNorm, y: yNorm, timestamp: videoPlayer.value.currentTime}]);
    addingPoint.value = false;
    redrawPoints();
  }
}

function drawCross(x: number, y: number, style: string, ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  if (style == "highlight") {
    ctx.strokeStyle = "green"
    ctx.lineWidth = 2;
  }
  else {
    ctx.strokeStyle = "red";
    ctx.lineWidth = 1;
  }
  ctx.moveTo(x-5, y-5);
  ctx.lineTo(x+5, y+5);
  ctx.moveTo(x-5, y+5);
  ctx.lineTo(x+5, y-5);
  ctx.stroke();
}

function drawCircle(x: number, y: number, r: number, style: string, ctx: CanvasRenderingContext2D) {
  if (style == "highlight") {
    ctx.strokeStyle = "green"
    ctx.lineWidth = 2;
  }
  else {
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
  }
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
}

function drawPoint(point: Point, style: string, ctx: CanvasRenderingContext2D) {
  const x = (point.x * videoWidth.value);
  const y = (point.y * videoHeight.value);
  drawCross(x, y, style, ctx);
  drawCircle(x, y, lightRadius.value, style, ctx);
}

function redrawPoints() {
  if (ctx.value && videoPlayer.value) {
    clearCanvas();
    for (const pt of currentPoints.value) {
      drawPoint(pt, "normal", ctx.value);
    }
  }
}

function clearCanvas() {
  if (ctx.value) {
    ctx.value.clearRect(0, 0, videoWidth.value, videoHeight.value);
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
              :currentTime="currentTime"
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
        <input class="videoSlider" type="range" min="0" :max="videoDuration" step="any" v-model="currentTime" @input="setFrame">
        <div class="timestamp">{{ formatTime(videoDuration) }}</div>
      </div>
    </div>
    
    <div class="editing-container">
      <div class="radius-picker-container">
        <label :style="{ paddingBottom: '3px' }">Light radius</label>
        <input class="radius-picker" type="range" min="0" max="1" step="any" v-model="radiusSlider" @input="redrawPoints">
      </div>
      <Button
        v-if="currentMode != 'Adding point'"
        :type="'default'"
        :style="{ alignSelf: 'center' }"
        :disabled="currentMode != 'Normal'" 
        @click="addPoint" 
      >
        Add point
      </Button>
      <Button
        v-if="currentMode == 'Adding point'"
        :type="'cancel'"
        :style="{ alignSelf: 'center' }"
        @click="cancelAddingPoint" 
      >
        Cancel
      </Button>
      <div class="points-container">
        <div v-for="pt in currentPoints" :key="pt.id" 
          class="point" :class="{ selected: selectedPoint == pt.id }"
          @mouseenter="hoverHighlight(pt)"
          @mouseleave="hoverUnhighlight"
        >
          {{ pt.id }} 
          <Button 
            v-if="currentMode != 'Adding point'" 
            @click="selectPoint(pt)"
          >
            Edit
          </Button>
          <Button
            :type="'cancel'"
            v-if="currentMode == 'Editing point' && pt.id == selectedPoint" 
            @click="cancelEditingPoint"
          >
            Cancel
          </Button>
        </div>
      </div>
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

.radius-picker-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-left: 1em;
  padding-top: 7px;
  gap: 1em;
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

.points-container {
  display: flex;
  flex-direction: column;
  gap: 1em;
  margin-left: 1em;
  margin-right: 1em;
  align-items: center;
}

.point {
  border: 1px solid gray;
  border-radius: 5px;
  font-size: 3ex;
  padding-left: 10px;
  padding-top: 3px;
  padding-bottom: 3px;
  width: 50%;
  &:hover {
    border: 2px solid var(--primary-color-lighter);
    margin-bottom: -2px;
    margin-top: -1px;
  }
}

.selected {
  border: 3px solid rgb(0, 128, 0);
  background-color: rgba(0, 128, 0, 0.3);
  margin-bottom: -2px;
  margin-top: -2px;
}

.cancel-button {
  background-color: rgb(171, 0, 0);
  color: white;
  width: 10em;
  padding: 5px;
  align-self: center;
}

</style>
