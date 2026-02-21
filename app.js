const viewer = document.getElementById("viewer");
const operaSelect = document.getElementById("operaSelect");
const songSelect = document.getElementById("songSelect");
const btnStart = document.getElementById("btnStart");
const btnPause = document.getElementById("btnPause");
const speedDisplay = document.getElementById("speedDisplay");

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";


// ===== 可调参数 =====
let baseInterval = 300;   // 1档间隔
let stepInterval = 50;    // 每升一档减少
let speedLevel = 1;       // 当前档位
let scrollInterval = null;


// ===== 曲库 =====
const library = {
  "朝阳沟": [
    { title: "银环上山", file: "朝阳沟/银环上山.pdf" },
    { title: "亲家母对唱", file: "朝阳沟/亲家母对唱.pdf" }
  ],
  "泪洒相思地": [
    { title: "选段1", file: "泪洒相思地/选段1.pdf" },
    { title: "选段2", file: "泪洒相思地/选段2.pdf" }
  ]
};


// ===== 初始化 =====
function initOperaList() {
  for (let opera in library) {
    const option = document.createElement("option");
    option.value = opera;
    option.textContent = opera;
    operaSelect.appendChild(option);
  }
  updateSongList();
  updateSpeedDisplay();
}

function updateSpeedDisplay() {
  speedDisplay.textContent = speedLevel;
}

function updateSongList() {
  const selectedOpera = operaSelect.value;
  const songs = library[selectedOpera];

  songSelect.innerHTML = "";

  songs.forEach(song => {
    const option = document.createElement("option");
    option.value = song.file;
    option.textContent = song.title;
    songSelect.appendChild(option);
  });

  loadPDF(songSelect.value);
}


// ===== 加载 PDF =====
async function loadPDF(url) {

  stopScroll();
  viewer.innerHTML = "";
  viewer.scrollTop = 0;

  const loadingTask = pdfjsLib.getDocument(encodeURI(url));
  const pdf = await loadingTask.promise;

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.5 });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    viewer.appendChild(canvas);

    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;
  }
}


// ===== 滚动 =====
function startScroll() {

  if (scrollInterval) return;

  let intervalTime = baseInterval - (speedLevel - 1) * stepInterval;

  if (intervalTime < 10) intervalTime = 10;

  scrollInterval = setInterval(() => {

    const maxScroll = viewer.scrollHeight - viewer.clientHeight;

    if (viewer.scrollTop >= maxScroll) {
      stopScroll();
      return;
    }

    viewer.scrollTop += 1;

  }, intervalTime);
}

function stopScroll() {
  clearInterval(scrollInterval);
  scrollInterval = null;
}

function restartScroll() {
  if (scrollInterval) {
    stopScroll();
    startScroll();
  }
}


// ===== 键盘 =====
document.addEventListener("keydown", function (e) {

  if (e.code === "Space") {
    e.preventDefault();
    scrollInterval ? stopScroll() : startScroll();
  }

  if (e.code === "ArrowUp") {
    if (speedLevel < 10) {
      speedLevel++;
      updateSpeedDisplay();
      restartScroll();
    }
  }

  if (e.code === "ArrowDown") {
    if (speedLevel > 1) {
      speedLevel--;
      updateSpeedDisplay();
      restartScroll();
    }
  }

  if (e.key.toLowerCase() === "r") {
    viewer.scrollTop = 0;
  }
});


// ===== 按钮 =====
operaSelect.addEventListener("change", updateSongList);
songSelect.addEventListener("change", () => loadPDF(songSelect.value));
btnStart.addEventListener("click", startScroll);
btnPause.addEventListener("click", stopScroll);


// 启动
initOperaList();
