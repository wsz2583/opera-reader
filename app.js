const viewer = document.getElementById("viewer");
const operaSelect = document.getElementById("operaSelect");
const songSelect = document.getElementById("songSelect");
const btnStart = document.getElementById("btnStart");
const btnPause = document.getElementById("btnPause");
const speedDisplay = document.getElementById("speedDisplay");
const searchInput = document.getElementById("searchInput");

// ✅ 本地 worker，真正离线
pdfjsLib.GlobalWorkerOptions.workerSrc = "pdf.worker.min.js";

// ===== 滚动参数（❗不改）=====
let baseInterval = 300;
let stepInterval = 50;
let speedLevel = 1;
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
  operaSelect.innerHTML = "";
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

// ===== 跨文件夹搜索（核心）=====
function searchAll(keyword) {
  keyword = keyword.trim();
  if (!keyword) return;

  for (let opera in library) {
    for (let song of library[opera]) {
      if (song.title.includes(keyword)) {

        // 切换剧目
        operaSelect.value = opera;
        updateSongList();

        // 切换唱段
        songSelect.value = song.file;

        // 加载 PDF
        loadPDF(song.file);
        return;
      }
    }
  }

  alert("未找到该唱段");
}

// ===== PDF 加载 =====
async function loadPDF(url) {
  stopScroll();
  viewer.innerHTML = "";
  viewer.scrollTop = 0;

  try {
    const pdf = await pdfjsLib.getDocument({
      url: encodeURI(url)
    }).promise;

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1.5 });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      viewer.appendChild(canvas);

      await page.render({
        canvasContext: ctx,
        viewport
      }).promise;
    }
  } catch (e) {
    viewer.innerHTML = "<p style='color:red'>PDF 加载失败</p>";
  }
}

// ===== 滚动（原封不动）=====
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
document.addEventListener("keydown", e => {
  if (e.code === "Space") {
    e.preventDefault();
    scrollInterval ? stopScroll() : startScroll();
  }

  if (e.code === "ArrowUp" && speedLevel < 10) {
    speedLevel++;
    updateSpeedDisplay();
    restartScroll();
  }

  if (e.code === "ArrowDown" && speedLevel > 1) {
    speedLevel--;
    updateSpeedDisplay();
    restartScroll();
  }
});

// ===== 事件 =====
operaSelect.addEventListener("change", updateSongList);
songSelect.addEventListener("change", () => loadPDF(songSelect.value));
btnStart.addEventListener("click", startScroll);
btnPause.addEventListener("click", stopScroll);

// 🔍 搜索框回车
searchInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    searchAll(searchInput.value);
  }
});

// 启动
initOperaList();