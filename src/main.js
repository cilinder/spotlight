let videoPlayer, canvas, ctx;

function init() {
    document.onmousemove = handleMouseMove;
    videoPlayer = document.querySelector("#video-player");
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    // draw();
}

function handleMouseMove(event) {
    const x = event.clientX;
    const y = event.clientY;
    // ctx.fillRect(0, 0, 800, 1000);
    ctx.beginPath();
    ctx.arc(x,y,50,0, Math.PI * 2);
    ctx.stroke();
    // ctx.clearRect(0,0,800,1000);
}

function draw() {
    ctx.fillRect(0, 0, 800, 1000);
}

window.onload = init;
