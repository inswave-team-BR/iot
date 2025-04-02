document.addEventListener('DOMContentLoaded', function () {
  const undoBtn = document.getElementById('undo-btn');
  const resetBtn = document.getElementById('reset-btn');
  const editBtn = document.getElementById('edit-btn');
  const saveBtn = document.getElementById('save-btn');
  const editButtons = document.getElementById('edit-buttons');
  const updateNewsBox = document.getElementById('update-news');


  let isEditing = false;

  const editUIElements = document.querySelectorAll(
    '.background-selector, .item-bar, #edit-buttons'
  );

  const decorateArea = document.querySelector('.background-stage');
  let placedItems = [];
  let currentBackgroundImage = ''; // 현재 배경 저장용

  const backgroundStage = document.querySelector('.background-stage');
  backgroundStage.style.flex = '1';
  backgroundStage.style.height = '200px';
  backgroundStage.style.minHeight = '200px';
  backgroundStage.style.maxHeight = '200px'; 
  backgroundStage.style.overflow = 'hidden'; 
  // 편집 UI 초기 숨김
  editUIElements.forEach(el => el.style.display = 'none');
  editBtn.style.display = 'inline-block';

  // 편집 버튼 클릭
  editBtn.addEventListener('click', () => {
    isEditing = true;
    editUIElements.forEach(el => el.style.display = 'block');
    editBtn.style.display = 'none';

    const backgroundStage = document.querySelector('.background-stage');
    backgroundStage.style.height = '200px';
    backgroundStage.style.minHeight = '200px';
    backgroundStage.style.flex = '1';
    backgroundStage.style.position = 'relative';

    document.getElementById('decorate-area').style.pointerEvents = 'auto';

    // 아이템 다시 드래그 가능하게
    decorateArea.querySelectorAll('.draggable-item').forEach(item => {
      item.setAttribute('draggable', 'false');
      item.style.pointerEvents = 'auto';
      makeDraggable(item);
      setupDeleteOnDoubleClick(item);
    });
  });

  // 저장 버튼 클릭
  saveBtn.addEventListener('click', () => {
    isEditing = false;
    editUIElements.forEach(el => el.style.display = 'none');
    editBtn.style.display = 'inline-block';
  
    const backgroundStage = document.querySelector('.background-stage');
    backgroundStage.style.flex = '1';
    backgroundStage.style.minHeight = '200px';
    backgroundStage.style.height = '200px';
    backgroundStage.style.overflow = 'hidden';
    backgroundStage.style.position = 'relative';
    backgroundStage.style.backgroundImage = currentBackgroundImage; 
    backgroundStage.offsetHeight;
  
    document.getElementById('decorate-area').style.pointerEvents = 'none';
  
    decorateArea.querySelectorAll('.draggable-item').forEach(item => {
      item.setAttribute('draggable', 'false');
      item.style.pointerEvents = 'none';
    });
  
    const itemsData = [];
    decorateArea.querySelectorAll('.draggable-item').forEach(item => {
      itemsData.push({
        src: item.src,
        left: item.style.left,
        top: item.style.top
      });
    });
  
    const saveData = {
      background: currentBackgroundImage,
      items: itemsData
    };
  
    // localStorage에 저장
    localStorage.setItem('miniroom_data', JSON.stringify(saveData));
  
    // ✅ 저장 후 업데이트 뉴스 다시 보여주기
    if (updateNewsBox) {
      updateNewsBox.style.display = 'block';
    }
  });
  

  // 배경 선택
  document.querySelectorAll('.background-selector img').forEach(img => {
    img.setAttribute('draggable', 'false');
    img.addEventListener('click', () => {
      const bg = img.getAttribute('data-bg');
      currentBackgroundImage = `url(${bg})`;
      document.querySelector('.background-stage').style.backgroundImage = currentBackgroundImage;
    });
  });

  // 아이템 드래그 시작
  document.querySelectorAll('.item-bar .item').forEach(item => {
    item.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', item.getAttribute('src'));
    });
  });

  decorateArea.addEventListener('dragover', e => e.preventDefault());

  // 아이템 드롭
  decorateArea.addEventListener('drop', e => {
    e.preventDefault();
    const src = e.dataTransfer.getData('text/plain');
    if (!src) return;

    const img = document.createElement('img');
    img.src = src;
    img.classList.add('draggable-item');
    img.setAttribute('draggable', 'false');

    img.style.left = `${e.offsetX - 30}px`;
    img.style.top = `${e.offsetY - 30}px`;

    makeDraggable(img);
    setupDeleteOnDoubleClick(img);

    decorateArea.appendChild(img);
    placedItems.push(img);
  });

  // 드래그 가능하게 만드는 함수
  function makeDraggable(el) {
    let isDragging = false, offsetX = 0, offsetY = 0;

    el.addEventListener('mousedown', e => {
      isDragging = true;
      offsetX = e.offsetX;
      offsetY = e.offsetY;
    });

    document.addEventListener('mousemove', e => {
      if (isDragging) {
        const areaRect = decorateArea.getBoundingClientRect();
        const elWidth = el.offsetWidth;
        const elHeight = el.offsetHeight;

        let newX = e.clientX - areaRect.left - offsetX;
        let newY = e.clientY - areaRect.top - offsetY;

        newX = Math.max(0, Math.min(newX, decorateArea.clientWidth - elWidth));
        newY = Math.max(0, Math.min(newY, decorateArea.clientHeight - elHeight));

        el.style.left = `${newX}px`;
        el.style.top = `${newY}px`;
      }
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
  }

  // 더블클릭 시 삭제
  function setupDeleteOnDoubleClick(el) {
    el.addEventListener('dblclick', () => {
      decorateArea.removeChild(el);
      placedItems = placedItems.filter(item => item !== el);
    });
  }

  // 되돌리기
  undoBtn.addEventListener('click', () => {
    const lastItem = placedItems.pop();
    if (lastItem) {
      decorateArea.removeChild(lastItem);
    }
  });

  // 초기화
  resetBtn.addEventListener('click', () => {
    placedItems.forEach(item => decorateArea.removeChild(item));
    placedItems = [];
  });

  // 탭 전환 후 홈 탭일 때 배경 복원
  const tabItems = document.querySelectorAll('.tab-item');
  tabItems.forEach(tab => {
    tab.addEventListener("click", () => {
      const tabName = tab.dataset.tab;
  
      const isHome = tabName === "home";
      const isNotEditing = !isEditing;
  
      // 편집 버튼: 홈 탭이고 편집 중 아닐 때만 보이기
      editBtn.style.display = isHome && isNotEditing ? "inline-block" : "none";
  
      // 뉴스: 홈 탭이고 편집 중 아닐 때만 보이기
      if (updateNewsBox) {
        updateNewsBox.style.display = isHome && isNotEditing ? "block" : "none";
      }
  
      // 홈 탭이면 배경 복원 및 편집 UI 처리
      if (isHome) {
        const bg = document.querySelector('.background-stage');
        bg.style.flex = '1';
        bg.style.minHeight = '200px';
        bg.style.height = '200px';
        bg.style.position = 'relative';
        bg.style.backgroundImage = currentBackgroundImage;
  
        bg.offsetHeight;
  
        if (isEditing) {
          editUIElements.forEach(el => el.style.display = 'block');
        } else {
          editUIElements.forEach(el => el.style.display = 'none');
        }
      }
    });
  });
  

  const saved = localStorage.getItem('miniroom_data');
  if (saved) {
    const parsed = JSON.parse(saved);

    // 배경 복원
    currentBackgroundImage = parsed.background;
    decorateArea.style.backgroundImage = currentBackgroundImage;

    // 아이템 복원
    parsed.items.forEach(data => {
      const img = document.createElement('img');
      img.src = data.src;
      img.classList.add('draggable-item');
      img.style.left = data.left;
      img.style.top = data.top;
      img.setAttribute('draggable', 'false');
      decorateArea.appendChild(img);
      placedItems.push(img);
      setupDeleteOnDoubleClick(img); // 삭제 기능도 다시 연결
    });
  }

  // 편집 버튼 누르면 뉴스 숨기기
editBtn.addEventListener("click", () => {
  if (updateNewsBox) {
    updateNewsBox.style.display = "none";
  }
});




});
