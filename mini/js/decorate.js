document.addEventListener("DOMContentLoaded", function () {
  loadRecentGuestbookToNews();

  const urlParams = new URLSearchParams(window.location.search);
  const currentHost = urlParams.get("id");
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const isOwner = currentUser && currentUser.id === currentHost;

  if (!isOwner) {
    const editBtn = document.getElementById("edit-btn");
    if (editBtn) {
      editBtn.style.display = "none"; // 로그인 안 했거나 주인이 아니면 숨김
    }
  }

  //localstorage 저장할 때 사용자별로
  function getMemberNameFromURL() {
    const path = window.location.pathname.split("/");
    for (let i = 0; i < path.length; i++) {
      if (path[i] === "minihome" && i + 1 < path.length) {
        return path[i + 1];
      }
    }
    return "default";
  }

  const undoBtn = document.getElementById("undo-btn");
  const resetBtn = document.getElementById("reset-btn");
  const editBtn = document.getElementById("edit-btn");
  const saveBtn = document.getElementById("save-btn");
  const editButtons = document.getElementById("edit-buttons");
  const updateNewsBox = document.getElementById("update-news");
  const addBubbleBtn = document.getElementById("add-bubble-btn");

  addBubbleBtn.addEventListener("click", () => {
    const bubble = document.createElement("div");
    bubble.classList.add("speech-bubble");
    bubble.contentEditable = true;
    bubble.textContent = "말풍선을 입력하세요";
    bubble.setAttribute("draggable", "false");
    bubble.style.position = "absolute";
    bubble.style.left = "20px";
    bubble.style.top = "20px";

    bubble.addEventListener("focus", function () {
      if (bubble.textContent === "말풍선을 입력하세요") {
        bubble.textContent = "";
      }
    });

    makeDraggable(bubble);
    setupDeleteOnDoubleClick(bubble);
    decorateArea.appendChild(bubble);
    placedItems.push(bubble);
  });

  let isEditing = false;

  const editUIElements = document.querySelectorAll(
    ".background-selector, .item-bar, #edit-buttons"
  );

  const decorateArea = document.querySelector(".background-stage");
  let placedItems = [];
  let currentBackgroundImage = ""; // 현재 배경 저장용

  const backgroundStage = document.querySelector(".background-stage");
  backgroundStage.style.flex = "1";
  backgroundStage.style.height = "200px";
  backgroundStage.style.minHeight = "200px";
  backgroundStage.style.maxHeight = "200px";
  backgroundStage.style.overflow = "hidden";

  // 편집 UI 초기 숨김
  editUIElements.forEach((el) => (el.style.display = "none"));
  //editBtn.style.display = "inline-block";

  // 편집 버튼 클릭
  editBtn.addEventListener("click", () => {
    isEditing = true;
    editUIElements.forEach((el) => (el.style.display = "block"));
    editBtn.style.display = "none";

    const backgroundStage = document.querySelector(".background-stage");
    backgroundStage.style.height = "200px";
    backgroundStage.style.minHeight = "200px";
    backgroundStage.style.flex = "1";
    backgroundStage.style.position = "relative";

    document.getElementById("decorate-area").style.pointerEvents = "auto";

    // 아이템 다시 드래그 가능하게
    decorateArea
      .querySelectorAll(".draggable-item, .speech-bubble")
      .forEach((item) => {
        item.setAttribute("draggable", "false");
        item.style.pointerEvents = "auto";
        makeDraggable(item);
        setupDeleteOnDoubleClick(item);
      });
  });

  // 저장 버튼 클릭
  saveBtn.addEventListener("click", () => {
    isEditing = false;
    editUIElements.forEach((el) => (el.style.display = "none"));
    editBtn.style.display = "inline-block";

    const backgroundStage = document.querySelector(".background-stage");
    backgroundStage.style.flex = "1";
    backgroundStage.style.minHeight = "200px";
    backgroundStage.style.height = "200px";
    backgroundStage.style.overflow = "hidden";
    backgroundStage.style.position = "relative";
    backgroundStage.style.backgroundImage = currentBackgroundImage;
    backgroundStage.offsetHeight;

    document.getElementById("decorate-area").style.pointerEvents = "none";

    decorateArea
      .querySelectorAll(".draggable-item, .speech-bubble")
      .forEach((item) => {
        item.setAttribute("draggable", "false");
        item.style.pointerEvents = "none";
      });

    const itemsData = [];
    decorateArea
      .querySelectorAll(".draggable-item, .speech-bubble")
      .forEach((item) => {
        itemsData.push({
          type: item.classList.contains("speech-bubble") ? "bubble" : "image",
          src: item.classList.contains("speech-bubble") ? null : item.src,
          text: item.classList.contains("speech-bubble")
            ? item.textContent
            : null,
          left: item.style.left,
          top: item.style.top,
        });
      });

    const saveData = {
      background: currentBackgroundImage,
      items: itemsData,
    };

    const saveKey = `miniroom_data_${currentHost}`;
    localStorage.setItem(saveKey, JSON.stringify(saveData));

    // ✅ 저장 후 업데이트 뉴스 다시 보여주기
    if (updateNewsBox) {
      updateNewsBox.style.display = "block";
    }
  });

  // 배경 선택
  document.querySelectorAll(".background-selector img").forEach((img) => {
    img.setAttribute("draggable", "false");
    img.addEventListener("click", () => {
      const bg = img.getAttribute("data-bg");
      currentBackgroundImage = `url(${bg})`;
      document.querySelector(".background-stage").style.backgroundImage =
        currentBackgroundImage;
    });
  });

  // 아이템 드래그 시작
  document.querySelectorAll(".item-bar .item").forEach((item) => {
    item.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", item.getAttribute("src"));
    });
  });

  decorateArea.addEventListener("dragover", (e) => e.preventDefault());

  // 아이템 드롭
  decorateArea.addEventListener("drop", (e) => {
    e.preventDefault();
    const src = e.dataTransfer.getData("text/plain");
    if (!src) return;

    const img = document.createElement("img");
    img.src = src;
    img.classList.add("draggable-item");
    img.setAttribute("draggable", "false");

    img.style.left = `${e.offsetX - 30}px`;
    img.style.top = `${e.offsetY - 30}px`;

    makeDraggable(img);
    setupDeleteOnDoubleClick(img);

    decorateArea.appendChild(img);
    placedItems.push(img);
  });

  // 드래그 가능하게 만드는 함수
  function makeDraggable(el) {
    let isDragging = false,
      offsetX = 0,
      offsetY = 0;

    el.addEventListener("mousedown", (e) => {
      isDragging = true;
      offsetX = e.offsetX;
      offsetY = e.offsetY;
    });

    document.addEventListener("mousemove", (e) => {
      if (isDragging) {
        const areaRect = decorateArea.getBoundingClientRect();
        const elWidth = el.offsetWidth;
        const elHeight = el.offsetHeight;

        let newX = e.clientX - areaRect.left - offsetX;
        let newY = e.clientY - areaRect.top - offsetY;

        newX = Math.max(0, Math.min(newX, decorateArea.clientWidth - elWidth));
        newY = Math.max(
          0,
          Math.min(newY, decorateArea.clientHeight - elHeight)
        );

        el.style.left = `${newX}px`;
        el.style.top = `${newY}px`;
      }
    });

    document.addEventListener("mouseup", () => {
      isDragging = false;
    });
  }

  // 더블클릭 시 삭제
  function setupDeleteOnDoubleClick(el) {
    el.addEventListener("dblclick", () => {
      decorateArea.removeChild(el);
      placedItems = placedItems.filter((item) => item !== el);
    });
  }

  // 되돌리기
  undoBtn.addEventListener("click", () => {
    const lastItem = placedItems.pop();
    if (lastItem) {
      decorateArea.removeChild(lastItem);
    }
  });

  // 초기화
  resetBtn.addEventListener("click", () => {
    placedItems.forEach((item) => decorateArea.removeChild(item));
    placedItems = [];
  });

  // 탭 전환 후 홈 탭일 때 배경 복원
  const tabItems = document.querySelectorAll(".tab-item");
  tabItems.forEach((tab) => {
    tab.addEventListener("click", () => {
      const tabName = tab.dataset.tab;
      const isHome = tabName === "home";
      const isNotEditing = !isEditing;

      const currentHost = new URLSearchParams(window.location.search).get("id");
      const currentUser = JSON.parse(localStorage.getItem("user"));
      const isOwner = currentUser && currentUser.id === currentHost;

      editBtn.style.display =
        isHome && isNotEditing && isOwner ? "inline-block" : "none";

      // 뉴스: 홈 탭이고 편집 중 아닐 때만 보이기
      if (updateNewsBox) {
        updateNewsBox.style.display = isHome && isNotEditing ? "block" : "none";
      }

      // 홈 탭이면 배경 복원 및 편집 UI 처리
      if (isHome) {
        const bg = document.querySelector(".background-stage");
        bg.style.flex = "1";
        bg.style.minHeight = "200px";
        bg.style.height = "200px";
        bg.style.position = "relative";
        bg.style.backgroundImage = currentBackgroundImage;

        bg.offsetHeight;

        if (isEditing) {
          editUIElements.forEach((el) => (el.style.display = "block"));
        } else {
          editUIElements.forEach((el) => (el.style.display = "none"));
        }
      }
    });
  });

  const loadKey = `miniroom_data_${currentHost}`;
  const saved = localStorage.getItem(loadKey);

  if (saved) {
    const parsed = JSON.parse(saved);

    // 배경 복원
    currentBackgroundImage = parsed.background;
    decorateArea.style.backgroundImage = currentBackgroundImage;

    // 아이템 복원
    parsed.items.forEach((data) => {
      let el;

      if (data.type === "bubble") {
        // 말풍선이면 <div>
        el = document.createElement("div");
        el.classList.add("speech-bubble");
        el.contentEditable = true;
        el.textContent = data.text;

        el.style.position = "absolute";
        el.style.minWidth = "80px";
        el.style.maxWidth = "200px";
        el.style.padding = "8px 12px";
        el.style.border = "1px solid #888";
        el.style.borderRadius = "10px";
        el.style.background = "white";
        el.style.fontSize = "12px";
        el.style.boxShadow = "1px 1px 3px rgba(0,0,0,0.2)";
        el.style.whiteSpace = "pre-wrap";
        el.style.wordBreak = "break-word";
      } else {
        // 이미지면 <img>
        el = document.createElement("img");
        el.src = data.src;
        el.classList.add("draggable-item");
      }

      el.style.left = data.left;
      el.style.top = data.top;
      el.setAttribute("draggable", "false");
      el.style.pointerEvents = isEditing ? "auto" : "none";

      makeDraggable(el);
      setupDeleteOnDoubleClick(el);
      decorateArea.appendChild(el);
      placedItems.push(el);
    });
  }
  // 편집 버튼 누르면 뉴스 숨기기
  editBtn.addEventListener("click", () => {
    if (updateNewsBox) {
      updateNewsBox.style.display = "none";
    }
  });
});

function loadRecentGuestbookToNews() {
  const urlParams = new URLSearchParams(window.location.search);
  const currentHost = urlParams.get("id");

  const updateNewsBox = document.getElementById("update-news");
  if (!updateNewsBox) return;

  const raw = localStorage.getItem(`${currentHost}_guestbook`) || "[]";
  if (!raw) return;

  // 문자열 -> js 객체  배열로 저장
  const entries = JSON.parse(raw);

  // 최신순 정렬
  entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // 상위 3개만 가져오기
  const recent = entries.slice(0, 3);

  // 기존 내용 초기화 후 동적 추가
  updateNewsBox.innerHTML = `
  <p class="update-label">
    <span class="update-title">Updated Boards</span>&nbsp;&nbsp;
    <span class="update-meta" id="seeMoreBtn" style="cursor: pointer;">더보기</span>
  </p>
  `;

  //더보기 버튼
  const seeMoreBtn = document.getElementById("seeMoreBtn");
  if (seeMoreBtn) {
    seeMoreBtn.addEventListener("click", function () {
      // 탭을 guestbook으로 전환
      document.querySelectorAll(".tab-item").forEach((tab) => {
        const tabName = tab.getAttribute("data-tab");
        if (tabName === "guestbook") {
          tab.click(); // 탭 전환 기능 실행
        }
      });
    });
  }

  recent.forEach((entry) => {
    const p = document.createElement("p");
    p.className = "update-line";
    p.textContent = `· [방명록] ${entry.text.slice(0, 20)}${
      entry.text.length > 20 ? "..." : ""
    }`;
    updateNewsBox.appendChild(p);
  });
}
