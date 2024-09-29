let savedImages = [];

function init() {
  const video = document.getElementById("video-player");
  const canvas = document.getElementById("canvas");
  video.addEventListener("ended", handleVideoEnded);
  canvas.addEventListener("click", saveScreenshot);
  document.getElementById("upload-video").addEventListener("change", uploadVideo, false);
}

function uploadVideo(event) {
  console.log("Uploaded video ", document.getElementById("upload-video").files.length);
  const file = document.getElementById("upload-video").files[0];
  const video = document.getElementById("video-player");
  const fs = new FileReader();
  fs.onload = () => {
    video.innerHTML = `<source id="video-source" src="${fs.result}">\nYour browser does not support HTML5 videos.`;
  }
  fs.readAsDataURL(file);
}

function hideVideoPlayer() {
  document.getElementById("canvas").style.visibility = "hidden";
  document.getElementById("video-player").style.visibility = "hidden";
}

function showVideoPlayer() {
  document.getElementById("canvas").style.visibility = "visible";
  document.getElementById("video-player").style.visibility = "visible";
}

function handleVideoEnded(event) {
  console.log("Video ended, saved ", savedImages.length, " images");
  hideVideoPlayer();
  if (savedImages.length > 0) {
    savedImages.forEach((image, id) => addImageToDocument(image, id.toString()));
  }
  document.getElementById("done-display").style.display = "block";
}

function handleMouseMove(event) {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const x = event.clientX;
  const y = event.clientY;
  const w = 640;
  const h = 480;
  const r = 50;
  ctx.fillRect(0, 0, w, h);
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.clearRect(0, 0, w, h);
  ctx.restore();
}

function saveScreenshot(event) {
  console.log("Click");
  // Create a new canvas to create the screenshot on
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 480;
  // Get the drawing context for the canvas
  const ctx = canvas.getContext("2d");
  const video = document.getElementById("video-player");
  // Declare shorted names for variables
  const w = canvas.width;
  const h = canvas.height;
  const x = event.clientX;
  const y = event.clientY;
  const r = 50;
  // Draw the screenshot on the canvas
  ctx.fillRect(0, 0, w, h);
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(video, 0, 0, w, h);
  ctx.restore();
  canvas.toBlob((blob) => {
    savedImages.push(blob);
  });
}

function addImageToDocument(blob, id) {
  const newImg = document.createElement("img");
  const url = URL.createObjectURL(blob);

  newImg.onload = () => {
    // no longer need to read the blob so it's revoked
    URL.revokeObjectURL(url);
  };

  newImg.src = url;
  newImg.id = id;
  document.body.appendChild(newImg);
}

function draw() {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  ctx.fillRect(0, 0, 800, 1000);
}

function startVideo() {
  console.log("start");
  document.getElementById("canvas").style.visibility = "visible";
  document.getElementById("video-player").style.visibility = "visible";
  document.getElementById("start-button").style.display = "none";
  document.getElementById("upload-video").style.display = "none";
  document.getElementById("video-player").play();
  document.onmousemove = handleMouseMove;
}

window.onload = init;
