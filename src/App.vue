<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<script setup lang="ts">

let savedImages: Blob[] = [];
let savedFrames: Blob[] = [];
let height = 0;
let width = 0;

function init() {
  const video = document.getElementById("video-player") as HTMLVideoElement;
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  video.addEventListener("ended", handleVideoEnded);
  video.addEventListener("loadedmetadata", (e) => {
    width = video.videoWidth;
    height = video.videoHeight;
    console.log("video dimensions: ", width, "x", height);
    canvas.width = width;
    canvas.height = height;
  });
  video.addEventListener("loadeddata", enableStartButton);
  canvas.addEventListener("click", saveScreenshot);
  document.getElementById("upload-video")!.addEventListener("change", uploadVideo, false);
}

function enableStartButton(event: any) {
  const startButton = document.getElementById("start-button") as HTMLButtonElement;
  startButton.disabled = false;
}

function uploadVideo(event: any) {
  const uploadVideo = document.getElementById("upload-video") as HTMLInputElement;
  const file = uploadVideo.files![0];
  const video = document.getElementById("video-player") as HTMLVideoElement;
  const fs = new FileReader();
  fs.onload = () => {
    video.innerHTML = `<source id="video-source" src="${fs.result}">\nYour browser does not support HTML5 videos.`;
  }
  fs.readAsDataURL(file);
}

function hideVideoPlayer() {
  document.getElementById("canvas")!.style.display = "none";
  document.getElementById("video-player")!.style.display = "none";
}

function showVideoPlayer() {
  document.getElementById("canvas")!.style.display = "block";
  document.getElementById("video-player")!.style.display = "block";
}

function createImageBox() {
  const imgbox = document.createElement("div");
  imgbox.style.display = "flex";
  imgbox.style.flexDirection = "column";
  imgbox.style.gap = "1em";
  return imgbox;
}

function handleVideoEnded(event: any) {
  console.log("Video ended, saved ", savedImages.length, " images");
  hideVideoPlayer();
  const imgbox = createImageBox();
  document.body.appendChild(imgbox);
  if (savedImages.length > 0) {
    savedImages.forEach((image, id) => addImageToImagebox(imgbox, image, savedFrames[id], id.toString()));
  }
  document.getElementById("done-display")!.style.display = "block";
}

function revealTarget(ctx: any, x: any, y: any, r: any) {
  const ambientLight = 1;
  const intensity = 0;
  const amb = 'rgba(0,0,0,' + (1-ambientLight) + ')';
  const g = ctx.createRadialGradient(x, y, r/2, x, y, r);
  g.addColorStop(0, 'rgba(0,0,0,' + (1-intensity) + ')');
  g.addColorStop(1, amb);

  ctx.fillStyle = g;
  ctx.globalCompositeOperation = 'xor';
  ctx.fillRect(0, 0, width, height);
}

function handleMouseMove(event: MouseEvent) {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d")!;
  const x = event.clientX;
  const y = event.clientY;
  const r = 50;
  ctx.fillRect(0, 0, width, height);
  ctx.save();
  revealTarget(ctx, x, y, r)
  ctx.restore();
}

function saveScreenshot(event: MouseEvent) {
  console.log("Click");
  // Create a new canvas to create the screenshot on
  const overlay = document.createElement("canvas");
  overlay.width = width;
  overlay.height = height;
  // Get the drawing context for the canvas
  const ctx = overlay.getContext("2d")!;
  const video = document.getElementById("video-player") as HTMLVideoElement;
  // Declare shorted names for variables
  const x = event.clientX;
  const y = event.clientY;
  const r = 50;
  // Draw the screenshot on the canvas
  ctx.fillRect(0, 0, width, height);
  ctx.save();
  revealTarget(ctx, x, y, r);
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.restore();
  overlay.toBlob((blob) => {
    if (blob) {
      savedImages.push(blob);
    }
  });

  // Save video frame
  const frame = document.createElement("canvas");
  frame.width = width;
  frame.height = height;
  const ctx2 = frame.getContext("2d")!;
  ctx2.drawImage(video, 0, 0);
  frame.toBlob((blob) => {
    if (blob) savedFrames.push(blob);
  });
}

function addImageToImagebox(imgbox: any, imgBlob: Blob, frameBlob: Blob, id: any) {
  const div = document.createElement("div")
  div.style.position = "relative";
  const vidFrame = document.createElement("img");
  const newImg = document.createElement("img");
  const frameUrl = URL.createObjectURL(frameBlob);
  const imgUrl = URL.createObjectURL(imgBlob);
  newImg.style.position = "absolute";
  vidFrame.style.top = "0";
  vidFrame.style.left = "0";
  vidFrame.style.zIndex = "100";
  newImg.style.zIndex = "200";

  newImg.onload = () => { URL.revokeObjectURL(imgUrl) };
  vidFrame.onload = () => { URL.revokeObjectURL(frameUrl) };

  newImg.src = imgUrl;
  newImg.id = "overlay-" + id;
  vidFrame.src = frameUrl;
  vidFrame.id = "frame-" + id;
  div.appendChild(newImg);
  div.appendChild(vidFrame);
  imgbox.appendChild(div);
}

function startVideo() {
  console.log("start");
  setTimeout(() => {
    document.getElementById("canvas")!.style.display = "block";
    document.getElementById("video-player")!.style.display = "block";
    document.getElementById("start-button")!.style.display = "none";
    document.getElementById("upload-video")!.style.display = "none";
    (document.getElementById("video-player") as HTMLVideoElement).play();
    document.onmousemove = handleMouseMove;
  }, 100);
}
window.onload = init;



</script>

<template>
  <button id="start-button" @click="startVideo" disabled>Start</button>
  <input type="file" name="video" size="65" id="upload-video" />
  <video id="video-player">
    Your browser does not support HTML5 video.
  </video>
  <canvas id="canvas"></canvas>
  <div id="done-display">Done</div>
</template>

<style scoped>
#video-player {
  display: none;
  position: absolute;
  top: 0;
  left: 0;
}

#canvas {
  display: none;
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

#done-display {
  display: none;
}
</style>
