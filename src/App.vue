<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<script setup lang="ts">
import { computed, ref } from "vue";
import StartMenu from "./components/StartMenu.vue";
import Results from "./components/Results.vue";

let savedOverlays: Blob[] = [];
let savedFrames: Blob[] = [];

const showVideo = ref(false);
const showStartMenu = ref(true);
const showResults = ref(false);

const videoPlayer = ref<HTMLVideoElement | null>(null);
const src = ref<any>("");
const canvas = ref<HTMLCanvasElement | null>(null);
const ctx = computed(() => {
  if (canvas.value) {
    return canvas.value.getContext("2d");
  } else {
    return null;
  }
});

const height = ref(0);
const width = ref(0);
const spotlightRadius = ref(50);

function handleVideoEnded(event: any) {
  showResults.value = true;
  showVideo.value = false;
}

function revealTarget(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const ambientLight = 1;
  const intensity = 0;
  const amb = "rgba(0,0,0," + (1 - ambientLight) + ")";
  const g = ctx.createRadialGradient(x, y, spotlightRadius.value / 2, x, y, spotlightRadius.value);
  g.addColorStop(0, "rgba(0,0,0," + (1 - intensity) + ")");
  g.addColorStop(1, amb);

  ctx.fillStyle = g;
  ctx.globalCompositeOperation = "xor";
  ctx.fillRect(0, 0, width.value, height.value);
}

function moveSpotlight(event: MouseEvent) {
  if (ctx.value) {
    const x = event.clientX;
    const y = event.clientY;
    ctx.value.fillRect(0, 0, width.value, height.value);
    ctx.value.save();
    revealTarget(ctx.value, x, y);
    ctx.value.restore();
  } else {
    console.error("Canvas reference not set.");
  }
}

function saveScreenshot(event: MouseEvent) {
  if (!videoPlayer.value) {
    throw new Error("Video player is null.");
  }
  console.log("Screenshot");
  // Create a new canvas to create the screenshot on
  const overlay = document.createElement("canvas");
  overlay.width = width.value;
  overlay.height = height.value;
  // Get the drawing context for the canvas
  const ctx = overlay.getContext("2d")!;
  // Declare shorted names for variables
  const x = event.clientX;
  const y = event.clientY;
  // Draw the screenshot on the canvas
  ctx.fillRect(0, 0, width.value, height.value);
  ctx.save();
  revealTarget(ctx, x, y);
  ctx.arc(x, y, spotlightRadius.value, 0, Math.PI * 2);
  ctx.clip();
  ctx.restore();
  overlay.toBlob((blob) => {
    if (blob) {
      savedOverlays.push(blob);
    }
  });

  // Save video frame
  const frame = document.createElement("canvas");
  frame.width = width.value;
  frame.height = height.value;
  const ctx2 = frame.getContext("2d")!;
  ctx2.drawImage(videoPlayer.value, 0, 0);
  frame.toBlob((blob) => {
    if (blob) savedFrames.push(blob);
  });
}

function loadVideo(videoFile: File) {
  const fs = new FileReader();
  fs.onload = () => {
    if (fs.result) {
      src.value = fs.result;
    }
  };
  fs.readAsDataURL(videoFile);
}

function setDimensions(event: Event) {
  if (videoPlayer.value) {
    width.value = videoPlayer.value.videoWidth;
    height.value = videoPlayer.value.videoHeight;
    console.log("video dimensions: ", width.value, "x", height.value);
  }
}

function startVideo() {
  showVideo.value = true;
  showStartMenu.value = false;
  setTimeout(() => {
    if (videoPlayer.value) {
      console.log("Starting video");
      videoPlayer.value.play();
    }
  }, 100);
}
</script>

<template>
  <StartMenu v-if="showStartMenu" :onClick="startVideo" @load="loadVideo" @start="startVideo" />
  <video
    v-if="showVideo"
    ref="videoPlayer"
    id="video-player"
    :key="src"
    @ended="handleVideoEnded"
    @loadedmetadata="setDimensions"
  >
    <source :src="src" />
    Your browser does not support HTML5 video.
  </video>
  <canvas
    v-if="showVideo"
    ref="canvas"
    id="canvas"
    :width="width"
    :height="height"
    @mousemove="moveSpotlight"
    @click="saveScreenshot"
  >
  </canvas>
  <Results v-if="showResults" :savedOverlays="savedOverlays" :savedFrames="savedFrames" />
</template>

<style scoped>
#video-player {
  position: absolute;
  top: 0;
  left: 0;
}

#canvas {
  position: absolute;
  top: 0;
  left: 0;
}

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
