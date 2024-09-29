let savedImages = [];
let savedFrames = [];
let height = 0;
let width = 0;

function init() {
  const video = document.getElementById("video-player");
  const canvas = document.getElementById("canvas");
  video.addEventListener("ended", handleVideoEnded);
  video.addEventListener("loadedmetadata", (e) => {
    width = video.videoWidth;
    height = video.videoHeight;
    console.log("video dimensions: ", width, "x", height);
    canvas.width = width;
    canvas.height = height;
  })
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
  document.getElementById("canvas").style.display = "none";
  document.getElementById("video-player").style.display = "none";
}

function showVideoPlayer() {
  document.getElementById("canvas").style.display = "block";
  document.getElementById("video-player").style.display = "block";
}

function createImageBox() {
  const imgbox = document.createElement("div");
  imgbox.style.display = "flex";
  imgbox.style.flexDirection = "column";
  imgbox.style.gap = "1em";
  return imgbox;
}

function handleVideoEnded(event) {
  console.log("Video ended, saved ", savedImages.length, " images");
  hideVideoPlayer();
  const imgbox = createImageBox();
  document.body.appendChild(imgbox);
  if (savedImages.length > 0) {
    savedImages.forEach((image, id) => addImageToImagebox(imgbox, image, savedFrames[id], id.toString()));
  }
  document.getElementById("done-display").style.display = "block";
}

function revealTarget(ctx, x, y, r) {
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

function handleMouseMove(event) {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const x = event.clientX;
  const y = event.clientY;
  const r = 50;
  ctx.fillRect(0, 0, width, height);
  ctx.save();
  revealTarget(ctx, x, y, r)
  ctx.restore();
}

function saveScreenshot(event) {
  console.log("Click");
  // Create a new canvas to create the screenshot on
  const overlay = document.createElement("canvas");
  overlay.width = width;
  overlay.height = height;
  // Get the drawing context for the canvas
  const ctx = overlay.getContext("2d");
  const video = document.getElementById("video-player");
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
    savedImages.push(blob);
  });

  // Save video frame
  const frame = document.createElement("canvas");
  frame.width = width;
  frame.height = height;
  const ctx2 = frame.getContext("2d");
  ctx2.drawImage(video, 0, 0);
  frame.toBlob((blob) => {
    savedFrames.push(blob);
  });


}

function addImageToImagebox(imgbox, imgBlob, frameBlob, id) {
  const div = document.createElement("div")
  div.style.position = "relative";
  const vidFrame = document.createElement("img");
  const newImg = document.createElement("img");
  const frameUrl = URL.createObjectURL(frameBlob);
  const imgUrl = URL.createObjectURL(imgBlob);
  newImg.style.position = "absolute";
  vidFrame.style.top = 0;
  vidFrame.style.left = 0;
  vidFrame.style.zIndex = 100;
  newImg.style.zIndex = 200;

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
  document.getElementById("canvas").style.display = "block";
  document.getElementById("video-player").style.display = "block";
  document.getElementById("start-button").style.display = "none";
  document.getElementById("upload-video").style.display = "none";
  document.getElementById("video-player").play();
  document.onmousemove = handleMouseMove;
}

window.onload = init;
