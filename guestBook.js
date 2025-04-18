const canvas = document.getElementById("drawingCanvas");
const ctx = canvas.getContext("2d");
const colorPicker = document.getElementById("colorPicker");
const lineWidth = document.getElementById("lineWidth");
const eraserBtn = document.getElementById("eraserBtn");
const clearBtn = document.getElementById("clearBtn");
const message = document.getElementById("message");
const saveBtn = document.getElementById("saveBtn");
const minicanvas = document.getElementById("mini-canvas");
const guestbookList = document.getElementById("guestbook");
const currentUserEl = document.getElementById("currentUser");
const nicknameInput = document.getElementById("nickname");
const drawingModal = document.getElementById("drawing-modal");
const drawingsave = document.getElementById("drawingSaveBtn");
const ITEMS_PER_PAGE = 5;
let currentHost = null;
let currentPage = 1;

let painting = false;
let erasing = false;

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  currentHost = urlParams.get("id");

  // 초기 렌더링
  renderGuestbook(currentHost);
});

minicanvas.addEventListener("click", () => {
  drawingModal.style.display = "flex";
});

drawingsave.addEventListener("click", () => {
  const imageData = canvas.toDataURL();
  minicanvas.innerHTML = `<img src="${imageData}" style="width: 100%; height: 100%;" />`;
  closeDrawingModal();
});

function closeDrawingModal() {
  drawingModal.style.display = "none";
}

function clearCanvas() {
  drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem("user"));
}

function startPosition(e) {
  painting = true;
  draw(e);
}
function endPosition() {
  painting = false;
  ctx.beginPath();
}

function draw(e) {
  if (!painting) return;
  const rect = canvas.getBoundingClientRect();
  ctx.lineWidth = lineWidth.value;
  ctx.lineCap = "round";
  ctx.strokeStyle = erasing ? "#ffffff" : colorPicker.value;
  ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
}

canvas.addEventListener("mousedown", startPosition);
canvas.addEventListener("mouseup", endPosition);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseleave", endPosition);

eraserBtn.addEventListener("click", () => {
  erasing = !erasing;
  eraserBtn.textContent = erasing ? "그리기" : "지우개";
});

clearBtn.addEventListener("click", () =>
  ctx.clearRect(0, 0, canvas.width, canvas.height)
);

saveBtn.addEventListener("click", () => {
  const user = getCurrentUser();
  if (!user) {
    return swal({
      title: "로그인 해주세요.",
      icon: "warning",
      button: "확인",
    });
  }
  const imgData = canvas.toDataURL();
  const text = message.value.trim();
  if (!text) {
    return swal({
      title: "글을 작성해 주세요.",
      icon: "warning",
      button: "확인",
    });
  }
  const data = Math.random().toString(16).slice(2);
  const entry = {
    id: data,
    userId: user.id,
    userName: user.name,
    image: imgData,
    text,
    timestamp: formatDate(new Date()),
  };
  const guestbook = JSON.parse(
    localStorage.getItem(`${currentHost}_guestbook`) || "[]"
  );
  guestbook.unshift(entry);
  localStorage.setItem(`${currentHost}_guestbook`, JSON.stringify(guestbook));
  renderGuestbook(currentHost);
  loadRecentGuestbookToNews();
  message.value = "";
  minicanvas.innerHTML = "";
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

function formatDate(date) {
  const pad = (n) => n.toString().padStart(2, "0");
  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    " " +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes()) +
    ":" +
    pad(date.getSeconds())
  );
}
function deleteEntry(entryId) {
  const user = getCurrentUser();
  const guestbook = JSON.parse(
    localStorage.getItem(`${currentHost}_guestbook`) || "[]"
  );
  const target = guestbook.find((g) => g.id === entryId);
  if (!target || target.userId !== user?.id) {
    return swal({
      title: "본인 글만 삭제할 수 있습니다.",
      icon: "warning",
      button: "확인",
    });
  }

  swal({
    title: "정말 삭제하시겠습니까?",
    text: "글을 삭제하시는 경우 데이터 복구가 불가능합니다.",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  }).then((willDelete) => {
    if (willDelete) {
      const newGuestbook = guestbook.filter((g) => g.id !== entryId);
      localStorage.setItem(
        `${currentHost}_guestbook`,
        JSON.stringify(newGuestbook)
      );
      loadRecentGuestbookToNews();
      renderGuestbook(currentHost);

      swal("성공적으로 글이 삭제되었습니다.", {
        icon: "success",
      });
    } else {
      swal("글 삭제가 취소되었습니다.");
    }
  });
}

function renderGuestbook(id, page = currentPage) {
  const guestbook = JSON.parse(localStorage.getItem(`${id}_guestbook`) || "[]");
  const user = getCurrentUser();
  const totalItems = guestbook.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  currentPage = page;

  const start = (page - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const pageItems = guestbook.slice(start, end);
  if (pageItems.length === 0) {
    guestbookList.innerHTML = `<div style="display: flex; justify-content: center; align-items: center; height: 100%; text-align: center;">
    등록된 글이 없습니다.
  </div>`;
    return;
  }
  guestbookList.innerHTML = pageItems
    .map(
      (entry, idx) => `
          <div class="guestbook-entry">
            <div class="entry-header">
              <div class="entry-author">
                <span id="cnt-num">No.${totalItems - (start + idx)}</span>
                <span style="color:#3D5AFE; font-weight:bold;">${
                  entry.userName
                }</span>
                <span style="margin-left: 10px;" id="time-stamp">(${
                  entry.timestamp
                })</span>
              </div>
              ${
                user?.id === entry.userId
                  ? `<div class="entry-action" onclick="deleteEntry('${entry.id}')">삭제</div>`
                  : ""
              }
            </div>
            <div class="entry-content">
              <div class="entry-image" id="com-image">
                <img src="${entry.image}" alt="${entry.nickname}" />
              </div>
              <div class="entry-text">
                ${entry.text}
              </div>
            </div>
          </div>
        `
    )
    .join("");

  renderPagination(totalPages);
}
function renderPagination(totalPages) {
  const paginationHTML = Array.from({ length: totalPages }, (_, i) => {
    const pageNum = i + 1;
    return `<button 
                class="page-btn ${currentPage === pageNum ? "active" : ""}" 
                onclick="renderGuestbook('${currentHost}',${pageNum})"
                style="margin: 2px; padding: 3px 6px; font-size: 11px;"
              >${pageNum}</button>`;
  }).join("");

  guestbookList.innerHTML += `<div style="text-align:center; margin-top:10px;">${paginationHTML}</div>`;
}
