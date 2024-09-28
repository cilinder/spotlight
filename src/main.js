let savedImages = [];

function init() {
  // document.onmousedown = handleMouseDown
  const video = document.getElementById("video-player");
  const canvas = document.getElementById("canvas");
  video.addEventListener("ended", handleVideoEnded);
  canvas.addEventListener("click", handleMouseDown);
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
  document.getElementById("done-display").style.display = "block";
}

function handleMouseMove(event) {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const video = document.getElementById("video-player");
  const x = event.clientX;
  const y = event.clientY;
  const r = 50;
  ctx.drawImage(video, 0, 0, 800, 1000);
  ctx.fillRect(0, 0, 800, 1000);
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.clearRect(0, 0, 800, 1000);
  ctx.restore();
}

function handleMouseDown(event) {
  console.log("Click");
  const canvas = document.getElementById("canvas");
  canvas.toBlob((blob) => {
    savedImages.push(blob);
  });
}

function addImageToDocument(blob) {
  const newImg = document.createElement("img");
  const url = URL.createObjectURL(blob);

  newImg.onload = () => {
    // no longer need to read the blob so it's revoked
    URL.revokeObjectURL(url);
  };

  newImg.src = url;
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
  document.getElementById("video-player").play();
  document.onmousemove = handleMouseMove;
}

window.onload = init;
