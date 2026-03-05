// ============================
// 戏曲看谱 - 完整稳定版
// 搜索 + 跨文件夹 + 不改变滚动速度
// ============================

// PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = "./pdf.worker.min.js";

// ====== 曲库结构 ======
const operaData = {
  "朝阳沟": [
    { name: "银环上山", file: "朝阳沟/银环上山.pdf" },
    { name: "亲家母对唱", file: "朝阳沟/亲家母对唱.pdf" }
  ],
  "泪洒相思地": [
    { name: "选段1", file: "泪洒相思地/选段1.pdf" },
    { name: "选段2", file: "泪洒相思地/选段2.pdf" }
  ]
};

// ====== DOM ======
const operaSelect = document.getElementById("operaSelect");
const songSelect = document.getElementById("songSelect");
const searchInput = document.getElementById("searchInput");
const viewer = document.getElementById("viewer");

const btnStart = document.getElementById("btnStart");
const btnPause = document.getElementById("btnPause");
const speedDisplay = document.getElementById("speedDisplay");

// ====== 滚动速度（完全保持你现在的节奏）=====
let speedLevel = 1;
let scrollInterval = null;

// ====== 初始化戏曲列表 ======
function initOperaList() {
  operaSelect.innerHTML = "";

  Object.keys(operaData).forEach(operaName => {
    const option = document.createElement("option");
    option.value = operaName;
    option.textContent = operaName;
    operaSelect.appendChild(option);
  });

  loadSongs();
}

// ====== 加载唱段 ======
function loadSongs(filteredList = null) {
  songSelect.innerHTML = "";

  if (filteredList) {
    filteredList.forEach(song => {
      const option = document.createElement("option");
      option.value = song.file;
      option.textContent = song.name;
      songSelect.appendChild(option);
    });
  } else {
    const operaName = operaSelect.value;
    operaData[operaName].forEach(song => {
      const option = document.createElement("option");
      option.value = song.file;
      option.textContent = song.name;
      songSelect.appendChild(option);
    });
  }

  if (songSelect.options.length > 0) {
    loadPDF(songSelect.value);
  }
}

// ====== 搜索功能（跨所有文件夹）=====
searchInput.addEventListener("keyup", function (e) {
  if (e.key === "Enter") {
    const keyword = searchInput.value.trim();

    if (!keyword) {
      loadSongs();
      return;
    }

    let result = [];

    Object.keys(operaData).forEach(operaName => {
      operaData[operaName].forEach(song => {
        if (song.name.includes(keyword)) {
          result.push(song);
        }
      });
    });

    if (result.length > 0) {
      loadSongs(result);
    } else {
      alert("没有找到相关唱段");
    }
  }
});

// ====== 加载 PDF ======
async function loadPDF(url) {
  viewer.innerHTML = "";

  const loadingTask = pdfjsLib.getDocument(url);
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

// ====== 滚动控制（不改你原来的速度逻辑）=====
btnStart.addEventListener("click", () => {
  if (scrollInterval) return;

  scrollInterval = setInterval(() => {
    viewer.scrollTop += speedLevel;
  }, 20);
});

btnPause.addEventListener("click", () => {
  clearInterval(scrollInterval);
  scrollInterval = null;
});

// ====== 切换戏曲 ======
operaSelect.addEventListener("change", () => {
  loadSongs();
});

// ====== 切换唱段 ======
songSelect.addEventListener("change", () => {
  loadPDF(songSelect.value);
});

// ====== 初始化 ======
initOperaList();