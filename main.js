
const upload = document.getElementById("upload");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const threshold = document.getElementById("threshold");
const thresholdValue = document.getElementById("thresholdValue");
const download = document.getElementById("download");

let originalImage = new Image();
let inkColor = "#42B4AD";
let bgColor = "#FFFFFF";

function setupSwatches() {
  const colorSwatches = document.querySelectorAll("#colorSwatches .swatch");
  const bgColorSwatches = document.querySelectorAll("#bgColorSwatches .swatch");

  colorSwatches.forEach(swatch => {
    swatch.addEventListener("click", () => {
      colorSwatches.forEach(s => s.classList.remove("selected"));
      swatch.classList.add("selected");
      inkColor = swatch.getAttribute("data-color");
      drawHalftone();
    });
  });

  bgColorSwatches.forEach(swatch => {
    swatch.addEventListener("click", () => {
      bgColorSwatches.forEach(s => s.classList.remove("selected"));
      swatch.classList.add("selected");
      bgColor = swatch.getAttribute("data-color");
      drawHalftone();
    });
  });

  colorSwatches[0].classList.add("selected");
  bgColorSwatches[0].classList.add("selected");
}

upload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (event) {
    originalImage.onload = () => {
      resizeCanvasToImage();
      drawHalftone();
    };
    originalImage.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

threshold.addEventListener("input", () => {
  thresholdValue.textContent = threshold.value;
  drawHalftone();
});

download.addEventListener("click", () => {
  const scale = 2;
  const exportCanvas = document.createElement("canvas");
  const exportCtx = exportCanvas.getContext("2d");

  exportCanvas.width = originalImage.width * scale;
  exportCanvas.height = originalImage.height * scale;

  drawHalftone(exportCtx, exportCanvas.width, exportCanvas.height);

  const link = document.createElement("a");
  link.download = "jujieta-halftone.png";
  link.href = exportCanvas.toDataURL("image/png");
  link.click();
});

function resizeCanvasToImage() {
  const ratio = originalImage.width / originalImage.height;
  const maxHeight = window.innerHeight * 0.8;
  let height = maxHeight;
  let width = height * ratio;

  canvas.width = width;
  canvas.height = height;
}

function drawHalftone(context = ctx, w = canvas.width, h = canvas.height) {
  if (!originalImage.src) return;

  const chosenColor = hexToRgb(inkColor);
  const backgroundColor = hexToRgb(bgColor);
  const t = parseInt(threshold.value);

  context.fillStyle = `rgb(${backgroundColor.r},${backgroundColor.g},${backgroundColor.b})`;
  context.fillRect(0, 0, w, h);
  context.drawImage(originalImage, 0, 0, w, h);

  const imageData = context.getImageData(0, 0, w, h);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const grayscale = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
    const isInk = grayscale < t;
    if (isInk) {
      data[i] = chosenColor.r;
      data[i+1] = chosenColor.g;
      data[i+2] = chosenColor.b;
    } else {
      data[i] = backgroundColor.r;
      data[i+1] = backgroundColor.g;
      data[i+2] = backgroundColor.b;
    }
  }

  context.putImageData(imageData, 0, 0);
}

function hexToRgb(hex) {
  const bigint = parseInt(hex.slice(1), 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}

setupSwatches();
