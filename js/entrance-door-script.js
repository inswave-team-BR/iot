document.addEventListener("DOMContentLoaded", function () {
  // index.html 페이지 로직 실행
  initIndexPage();

  function initIndexPage() {
    // 애니메이션 상태를 추적하는 플래그 추가
    let isAnimationRunning = false;

    const door = document.querySelector(".door");
    const doorBody = document.querySelector(".door-body");
    const doorKnob = document.querySelector(".door-knob");
    const doorPanels = document.querySelectorAll(
      ".door-panel-top, .door-panel-middle, .door-panel-bottom"
    );
    const clickCountElement = document.getElementById("click-count");
    const doorMessageSpan = document.querySelector(".door-message span");

    // 열쇠 관련 요소 선택
    const keys = document.querySelectorAll(".key");
    const keySlots = document.querySelectorAll(".key-slot");

    // 드래그 중인 열쇠 참조를 저장할 변수
    let draggedKey = null;
    let sourceSlot = null;

    // 로컬 스토리지에서 클릭 횟수 가져오기
    let clickCount = parseInt(localStorage.getItem("doorClickCount")) || 0;

    // 클릭 횟수 업데이트
    updateClickCount();

    // 문 클릭 이벤트
    door.addEventListener("click", handleDoorClick);
    doorKnob.addEventListener("click", function (e) {
      e.stopPropagation(); // 이벤트 버블링 방지
      handleDoorClick();
    });

    doorMessageSpan.addEventListener("click", function () {
      door.classList.add("attention");
      setTimeout(() => {
        door.classList.remove("attention");
      }, 800);
    });

    door.addEventListener("keydown", function (e) {
      // 엔터 키 클릭 처리
      if (e.key === "Enter") {
        handleDoorClick();
      }
    });

    // 열쇠 드래그 이벤트 리스너 추가
    keys.forEach((key) => {
      key.addEventListener("dragstart", handleDragStart);
      key.addEventListener("dragend", handleDragEnd);
    });

    // 문에 드롭 이벤트 리스너 추가
    door.addEventListener("dragover", handleDragOver);
    door.addEventListener("dragenter", handleDragEnter);
    door.addEventListener("dragleave", handleDragLeave);
    door.addEventListener("drop", handleDrop);

    // 드래그 시작 처리
    function handleDragStart(e) {
      this.classList.add("dragging");
      draggedKey = this;
      e.dataTransfer.setData("text/plain", this.id);

      // 소스 슬롯 저장 및 빈 슬롯 표시
      sourceSlot = this.closest(".key-slot");
      if (sourceSlot) {
        sourceSlot.classList.add("empty");
      }

      // 키 요소 자체를 드래그 이미지로 사용
      // 드래그 이미지의 오프셋을 설정하여 마우스 커서 위치와 일치하도록 함
      const rect = this.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;

      e.dataTransfer.setDragImage(this, offsetX, offsetY);

      // 원본 키 요소를 투명하게 만들어 잔상이 보이지 않도록 함
      setTimeout(() => {
        this.style.opacity = "0";
      }, 0);
    }

    // 드래그 종료 처리
    function handleDragEnd() {
      this.classList.remove("dragging");

      // 빈 슬롯 클래스 제거
      if (sourceSlot) {
        sourceSlot.classList.remove("empty");
        sourceSlot = null;
      }

      // 드래그가 완료되면 키 요소 다시 보이게 함
      if (!door.classList.contains("clicked")) {
        this.style.opacity = "1";
      }

      draggedKey = null;
      door.classList.remove("drop-target");
    }

    // 드래그 오버 처리 (드롭 허용)
    function handleDragOver(e) {
      e.preventDefault();
      // dragover 이벤트에서도 drop-target 클래스를 추가하여 효과가 지속되도록 함
      this.classList.add("drop-target");

      // 세련된 블루 배경 효과 추가
      const doorBody = document.querySelector(".door-body");
      if (doorBody) {
        doorBody.style.backgroundImage = `
                    linear-gradient(135deg, 
                        rgba(67, 103, 178, 0.3) 0%, 
                        rgba(59, 89, 152, 0.4) 100%),
                    radial-gradient(
                        circle at 50% 50%, 
                        rgba(255, 255, 255, 0.2) 0%, 
                        rgba(255, 255, 255, 0) 60%
                    )
                `;
      }
    }

    // 드래그 요소가 드롭 대상 위로 들어왔을 때
    function handleDragEnter(e) {
      e.preventDefault();
      e.stopPropagation(); // 이벤트 버블링 방지
      this.classList.add("drop-target");

      // 세련된 블루 배경 효과 추가
      const doorBody = document.querySelector(".door-body");
      if (doorBody) {
        doorBody.style.backgroundImage = `
                    linear-gradient(135deg, 
                        rgba(67, 103, 178, 0.3) 0%, 
                        rgba(59, 89, 152, 0.4) 100%),
                    radial-gradient(
                        circle at 50% 50%, 
                        rgba(255, 255, 255, 0.2) 0%, 
                        rgba(255, 255, 255, 0) 60%
                    )
                `;
      }
    }

    // 드래그 요소가 드롭 대상에서 벗어났을 때
    function handleDragLeave(e) {
      // 실제로 문 영역을 벗어났을 때만 효과를 제거하기 위한 추가 검사
      // relatedTarget이 door의 자식 요소인 경우 효과를 유지
      if (!this.contains(e.relatedTarget)) {
        this.classList.remove("drop-target");

        // 갈색 배경 효과 제거
        const doorBody = document.querySelector(".door-body");
        if (doorBody) {
          doorBody.style.backgroundImage = "";
        }
      }
    }

    // 드롭 처리
    function handleDrop(e) {
      e.preventDefault();
      this.classList.remove("drop-target");

      // 갈색 배경 효과 제거 (문이 열리기 전에)
      const doorBody = document.querySelector(".door-body");
      if (doorBody) {
        doorBody.style.backgroundImage = "";
      }

      if (draggedKey) {
        // 애니메이션이 이미 진행 중이면 중복 실행 방지
        if (isAnimationRunning) return;

        // 애니메이션 시작 플래그 설정
        isAnimationRunning = true;

        // 키 컨테이너 즉시 숨기기 - 추가된 코드
        const keysContainer = document.querySelector(".keys-container");
        if (keysContainer) {
          keysContainer.style.transition = "opacity 0.1s ease-out";
          keysContainer.style.opacity = "0";
          keysContainer.style.zIndex = "0"; // 문 뒤에 위치하도록 z-index 낮춤
          keysContainer.style.pointerEvents = "none"; // 상호작용 방지
        }

        // 효과음 재생 (옵션)
        playDoorSound();

        // 클릭 횟수 증가
        clickCount++;

        // 로컬 스토리지에 클릭 횟수 저장
        localStorage.setItem("doorClickCount", clickCount);

        // 클릭 횟수 표시 업데이트
        updateClickCount();

        // 문 애니메이션 실행
        door.classList.add("clicked");

        // 열쇠에 설정된 타겟 경로 가져오기
        const targetPath = draggedKey.getAttribute("data-target");
        // 문이 열리는 효과 향상
        let frameCount = 0;
        const frames = 15;
        const animateOpenDoor = () => {
          frameCount++;
          if (frameCount <= frames) {
            // 열리는 동안 미세한 흔들림 추가
            const progress = frameCount / frames;
            const shakeFactor =
              Math.sin(progress * Math.PI * 3) * (1 - progress) * 1.8;
            const rotY = -85 * progress;

            door.style.transform = `perspective(2000px) rotateY(${rotY}deg) rotateX(${shakeFactor}deg) rotateZ(${
              shakeFactor * 0.5
            }deg)`;

            requestAnimationFrame(animateOpenDoor);
          } else {
            // 애니메이션 완료 후 포털 효과 적용
            applyPortalEffectWithTarget(targetPath);
          }
        };

        requestAnimationFrame(animateOpenDoor);
      }
    }

    // 마우스 이동에 따라 문에 입체감 추가
    document.addEventListener("mousemove", function (e) {
      // 문이 클릭되었거나 애니메이션이 진행 중이면 이벤트 무시
      if (door.classList.contains("clicked") || isAnimationRunning) return;

      // 마우스 커서가 문과 충분히 가까울 때만 적용
      const doorRect = door.getBoundingClientRect();

      // 마우스가 문 요소 위에 있는지 확인
      const isMouseOverDoor =
        e.clientX >= doorRect.left &&
        e.clientX <= doorRect.right &&
        e.clientY >= doorRect.top &&
        e.clientY <= doorRect.bottom;

      const doorCenterX = doorRect.left + doorRect.width / 2;
      const doorCenterY = doorRect.top + doorRect.height / 2;

      const distanceX = ((e.clientX - doorCenterX) / window.innerWidth) * 2;
      const distanceY = ((e.clientY - doorCenterY) / window.innerHeight) * 2;

      // 마우스가 정확히 문 위에 있을 때만 효과 적용
      if (isMouseOverDoor) {
        // 문의 전체 회전
        const rotY = -distanceX * 5;
        const rotX = distanceY * 3;

        door.style.transform = `perspective(2000px) rotateY(${rotY}deg) rotateX(${rotX}deg)`;

        // 각 패널마다 다른 시차(parallax) 효과 적용
        doorPanels.forEach((panel, index) => {
          const panelDepth = 3 + index;
          const offsetX = -distanceX * (5 + index * 2);
          const offsetY = distanceY * (3 + index);

          panel.style.transform = `translateZ(${panelDepth}px) translateX(${offsetX}px) translateY(${offsetY}px)`;
        });

        // 손잡이 시차 효과
        const knobOffsetX = -distanceX * 10;
        const knobOffsetY = distanceY * 5;
        doorKnob.style.transform = `translateY(-50%) translateZ(10px) translateX(${knobOffsetX}px) translateY(${knobOffsetY}px)`;

        // 블루 그라데이션 효과로 변경
        const lightPosX = 50 - distanceX * 30;
        const lightPosY = 50 - distanceY * 30;
        doorBody.style.backgroundImage = `
                    linear-gradient(135deg, 
                        rgba(67, 103, 178, 0.3) 0%, 
                        rgba(59, 89, 152, 0.4) 100%),
                    radial-gradient(
                        circle at ${lightPosX}% ${lightPosY}%, 
                        rgba(255, 255, 255, 0.2) 0%, 
                        rgba(255, 255, 255, 0) 60%
                    )
                `;
      } else {
        // 효과 제거
        door.style.transform = "";
        doorPanels.forEach((panel) => {
          panel.style.transform = "translateZ(3px)";
        });
        doorKnob.style.transform = "translateY(-50%) translateZ(10px)";
        doorBody.style.backgroundImage = "";
      }
    });

    function handleDoorClick() {
      // 애니메이션이 이미 진행 중이면 중복 실행 방지
      if (isAnimationRunning) return;

      // 애니메이션 시작 플래그 설정
      isAnimationRunning = true;

      // 키 컨테이너 즉시 숨기기 - 추가된 코드
      const keysContainer = document.querySelector(".keys-container");
      if (keysContainer) {
        keysContainer.style.transition = "opacity 0.1s ease-out";
        keysContainer.style.opacity = "0";
        keysContainer.style.zIndex = "0"; // 문 뒤에 위치하도록 z-index 낮춤
        keysContainer.style.pointerEvents = "none"; // 상호작용 방지
      }

      // 효과음 재생 (옵션)
      playDoorSound();

      // 클릭 횟수 증가
      clickCount++;

      // 로컬 스토리지에 클릭 횟수 저장
      localStorage.setItem("doorClickCount", clickCount);

      // 클릭 횟수 표시 업데이트
      updateClickCount();

      // 문 패널 효과 초기화
      doorPanels.forEach((panel) => {
        panel.style.transform = "translateZ(3px)";
      });

      // 문 애니메이션 실행
      door.classList.add("clicked");

      // 문이 열리는 효과 향상
      let frameCount = 0;
      const frames = 15;
      const animateOpenDoor = () => {
        frameCount++;
        if (frameCount <= frames) {
          // 열리는 동안 미세한 흔들림 추가
          const progress = frameCount / frames;
          const shakeFactor =
            Math.sin(progress * Math.PI * 3) * (1 - progress) * 1.8;
          const rotY = -85 * progress;

          door.style.transform = `perspective(2000px) rotateY(${rotY}deg) rotateX(${shakeFactor}deg) rotateZ(${
            shakeFactor * 0.5
          }deg)`;

          requestAnimationFrame(animateOpenDoor);
        } else {
          // 애니메이션 완료 후 포털 효과 적용 (기본 대상: home.html)
          applyPortalEffectWithTarget("home.html");
        }
      };

      requestAnimationFrame(animateOpenDoor);
    }

    // 포털 효과를 별도 함수로 분리하여 일관성 향상
    function applyPortalEffectWithTarget(targetPath) {
      // 애니메이션 플래그 유지
      isAnimationRunning = true;

      // 키 컨테이너 페이드 아웃 - 문과 겹치지 않도록 처리 (더 빠른 전환)
      const keysContainer = document.querySelector(".keys-container");
      if (keysContainer) {
        keysContainer.style.transition = "opacity 0.1s ease-out"; // 0.3초에서 0.1초로 단축
        keysContainer.style.opacity = "0";
        keysContainer.style.zIndex = "0"; // 문 뒤에 위치하도록 z-index 낮춤
        keysContainer.style.pointerEvents = "none"; // 상호작용 방지
      }

      // 문에 빛 효과 추가
      doorBody.style.boxShadow = "0 0 30px 10px rgba(255, 255, 255, 0.7)";

      // 애니메이션 시작 시간을 명확히 기록
      const portalStartTime = performance.now();

      // 문의 위치 및 크기 정보 가져오기
      const doorRect = door.getBoundingClientRect();
      const doorCenterX = doorRect.left + doorRect.width / 2;
      const doorCenterY = doorRect.top + doorRect.height / 2;

      // 포털 효과 요소 설정
      setupPortalElements(doorCenterX, doorCenterY);

      // requestAnimationFrame을 사용하여 애니메이션 일관성 향상
      const tunnelEffect = document.querySelector(".tunnel-effect");
      const speedLines = document.querySelector(".speed-lines");
      const container = document.querySelector(".container");

      requestAnimationFrame(function portalAnimation(timestamp) {
        const elapsed = timestamp - portalStartTime;

        if (elapsed < 600) {
          // 0.8초에서 0.6초로 단축하여 애니메이션 실행
          const progress = elapsed / 600;

          // 점진적인 효과 적용
          updatePortalAnimation(
            progress,
            door,
            tunnelEffect,
            speedLines,
            container
          );

          requestAnimationFrame(portalAnimation);
        } else {
          // 애니메이션 완료 후 리다이렉션
          window.location.href = `mini/mini.html?id=${targetPath}`;
        }
      });
    }

    // 포털 효과 요소 설정 함수
    function setupPortalElements(doorCenterX, doorCenterY) {
      // 터널 효과를 위한 오버레이 추가
      const tunnelEffect = document.createElement("div");
      tunnelEffect.className = "tunnel-effect";
      tunnelEffect.dataset.centerX = doorCenterX;
      tunnelEffect.dataset.centerY = doorCenterY;
      document.body.appendChild(tunnelEffect);

      // 속도선 효과 추가
      const speedLines = document.createElement("div");
      speedLines.className = "speed-lines";
      document.body.appendChild(speedLines);

      // 나뭇잎 효과 추가
      const leavesContainer = document.createElement("div");
      leavesContainer.className = "leaves-container";
      document.body.appendChild(leavesContainer);

      // 여러 개의 나뭇잎 생성
      const leafCount = 40; // 나뭇잎 개수 증가
      const leafTypes = [
        "leaf-1",
        "leaf-2",
        "leaf-3",
        "twig-1",
        "twig-2",
        "leaf-4",
        "leaf-5",
      ];

      for (let i = 0; i < leafCount; i++) {
        const leaf = document.createElement("div");
        const leafType =
          leafTypes[Math.floor(Math.random() * leafTypes.length)];

        leaf.className = `leaf ${leafType}`;

        // 초기 위치 설정 (주로 문의 오른쪽에 배치하여 왼쪽으로 날아가는 효과)
        const side = Math.random() < 0.85 ? 1 : -1; // 85%는 오른쪽에서 시작
        const distanceFromCenter = 30 + Math.random() * 100; // 문에서의 거리
        const offsetX = side * distanceFromCenter; // 주로 오른쪽에 배치
        const offsetY = Math.random() * 160 - 80; // -80 ~ 80 (높이 분포)

        // 바람의 세기와 방향 설정
        const windStrength = 300 + Math.random() * 300; // 바람 세기 (좌측 이동 속도)
        const windDirection = -1; // 왼쪽 방향 (-1)

        // 이동 속성 설정
        const moveX = windDirection * windStrength; // 왼쪽으로 이동
        const moveY = Math.random() * 100 - 50; // 약간의 상하 이동

        // 회전 설정
        const rotation = Math.random() * 360; // 초기 회전
        const rotationDelta = Math.random() * 1080 - 540; // 더 큰 회전 변화량

        // 크기 설정
        const scale = 0.3 + Math.random() * 1.2; // 0.3 ~ 1.5

        // 바람 영향에 관한 추가 속성
        const amplitude = 15 + Math.random() * 25; // 사인 곡선의 진폭
        const frequency = 3 + Math.random() * 5; // 사인 곡선의 주파수
        const resistance = 0.7 + Math.random() * 0.3; // 바람 저항 (낮을수록 더 큰 영향)
        const delay = Math.random() * 0.4; // 시작 지연 시간

        // 3D 회전 설정
        const rotateX = Math.random() * 180 - 90; // x축 회전 각도
        const rotateY = Math.random() * 180 - 90; // y축 회전 각도

        // 데이터 저장
        leaf.dataset.initialX = doorCenterX + offsetX;
        leaf.dataset.initialY = doorCenterY + offsetY;
        leaf.dataset.moveX = moveX;
        leaf.dataset.moveY = moveY;
        leaf.dataset.rotation = rotation;
        leaf.dataset.rotationDelta = rotationDelta;
        leaf.dataset.scale = scale;
        leaf.dataset.amplitude = amplitude;
        leaf.dataset.frequency = frequency;
        leaf.dataset.resistance = resistance;
        leaf.dataset.delay = delay;
        leaf.dataset.rotateX = rotateX;
        leaf.dataset.rotateY = rotateY;

        // 초기 스타일 설정
        leaf.style.left = `${leaf.dataset.initialX}px`;
        leaf.style.top = `${leaf.dataset.initialY}px`;
        leaf.style.transform = `rotate(${rotation}deg) scale(${scale})`;
        leaf.style.opacity = "0";

        leavesContainer.appendChild(leaf);
      }

      // 컨테이너 스타일 설정
      const container = document.querySelector(".container");

      // CSS 스타일 동적 추가
      const style = document.createElement("style");
      style.textContent = `
                .tunnel-effect {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: radial-gradient(circle at ${doorCenterX}px ${doorCenterY}px, 
                                   rgba(255,255,255,0) 0%, 
                                   rgba(200,230,255,0) 20%,
                                   rgba(255,255,255,0) 40%,
                                   rgba(255,255,255,0) 100%);
                    opacity: 0;
                    z-index: 3; /* 문보다 위에 위치 */
                    pointer-events: none;
                }
                .speed-lines {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><line x1="50" y1="0" x2="50" y2="100" stroke="rgba(255,255,255,0.3)" stroke-width="1"/></svg>') repeat;
                    background-size: 50px 50px;
                    opacity: 0;
                    z-index: 4; /* 터널 위에 위치 */
                    transform-origin: ${doorCenterX}px ${doorCenterY}px;
                    pointer-events: none;
                }
                .leaves-container {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 5; /* 다른 효과보다 위에 표시 */
                    opacity: 0;
                }
                
                .leaf {
                    position: absolute;
                    width: 30px;
                    height: 30px;
                    opacity: 0;
                    will-change: transform, opacity, left, top;
                    transition: opacity 0.05s ease-out;
                }
                
                .leaf-1 {
                    background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M20,50 Q40,20 50,50 Q60,20 80,50 Q60,80 50,50 Q40,80 20,50 Z" fill="%23228B22"/></svg>') no-repeat center/contain;
                }
                
                .leaf-2 {
                    background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M30,20 L50,80 L70,20 Z" fill="%2332CD32"/></svg>') no-repeat center/contain;
                }
                
                .leaf-3 {
                    background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><ellipse cx="50" cy="50" rx="30" ry="20" fill="%23006400"/></svg>') no-repeat center/contain;
                }
                
                .leaf-4 {
                    background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M20,20 C40,10 60,10 80,20 C90,40 90,60 80,80 C60,90 40,90 20,80 C10,60 10,40 20,20 Z" fill="%23228B22"/></svg>') no-repeat center/contain;
                }
                
                .leaf-5 {
                    background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50,20 C70,20 85,35 85,55 C85,75 70,90 50,90 C30,90 15,75 15,55 C15,35 30,20 50,20 Z" fill="%2332CD32"/></svg>') no-repeat center/contain;
                }
                
                .twig-1 {
                    background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><line x1="10" y1="50" x2="90" y2="50" stroke="%23654321" stroke-width="5"/></svg>') no-repeat center/contain;
                    width: 40px;
                    height: 10px;
                }
                
                .twig-2 {
                    background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M10,50 L90,50 M50,30 L70,50 L50,70" stroke="%23654321" stroke-width="5" fill="none"/></svg>') no-repeat center/contain;
                    width: 40px;
                    height: 20px;
                }
            `;
      document.head.appendChild(style);
    }

    // 포털 애니메이션 업데이트 함수
    function updatePortalAnimation(
      progress,
      door,
      tunnelEffect,
      speedLines,
      container
    ) {
      // 애니메이션 진행에 따라 효과 업데이트
      tunnelEffect.style.opacity = progress;
      speedLines.style.opacity = progress > 0.3 ? 0.7 : progress * 2.3;

      // 줌 및 회전 효과 업데이트
      const scale = 1 + progress * 0.5;
      const translateZ = progress * 300;

      // 문이 확대되는 효과 (transform 속성 유지)
      door.style.transform = `perspective(2000px) rotateY(-85deg) scale(${
        1 + progress * 0.2
      })`;
      door.style.filter = `brightness(${1 + progress * 0.8})`;

      // 문 컨테이너만 확대 효과 적용 (door-container)
      const doorContainer = document.querySelector(".door-container");
      if (doorContainer) {
        doorContainer.style.transform = `scale(${scale})`;
      }

      // 컨테이너의 다른 요소들은 확대하지 않고 밝기만 조정
      container.style.filter = `brightness(${1 + progress * 0.3})`;

      // 터널 효과 업데이트
      tunnelEffect.style.background = `radial-gradient(circle at ${
        tunnelEffect.dataset.centerX
      }px ${tunnelEffect.dataset.centerY}px, 
                rgba(255,255,255,${progress}) 0%, 
                rgba(200,230,255,${progress * 0.9}) 10%,
                rgba(255,255,255,${progress * 0.7}) 25%,
                rgba(255,255,255,0) 60%)`;

      // 속도선 크기 업데이트
      speedLines.style.backgroundSize = `${50 - progress * 40}px ${
        50 - progress * 40
      }px`;
      speedLines.style.transform = `scale(${1 + progress})`;

      // 바람 세기 변화 시뮬레이션 (시간에 따라 바람 세기가 변함)
      const windVariation = Math.sin(progress * 10) * 0.3 + 1; // 0.7 ~ 1.3 사이로 바람 세기 변화

      // 나뭇잎 애니메이션 업데이트
      const leavesContainer = document.querySelector(".leaves-container");
      if (leavesContainer) {
        // 컨테이너 전체 표시
        leavesContainer.style.opacity = Math.min(1, progress * 3); // 0.33 지점부터 완전히 표시

        // 바람 소리 효과를 위한 스타일 추가 (배경 이동)
        leavesContainer.style.backgroundImage = `linear-gradient(90deg, 
                    rgba(255,255,255,0) ${10 + progress * 60}%, 
                    rgba(255,255,255,0.05) ${15 + progress * 65}%, 
                    rgba(255,255,255,0) ${20 + progress * 70}%)`;

        // 각 나뭇잎의 애니메이션 업데이트
        const leaves = leavesContainer.querySelectorAll(".leaf");
        leaves.forEach((leaf, index) => {
          // 각 나뭇잎마다 약간 다른 타이밍 적용
          const leafDelay = parseFloat(leaf.dataset.delay || 0);
          const adjustedProgress = Math.max(
            0,
            Math.min(1, (progress - leafDelay) * 1.2)
          );

          if (adjustedProgress > 0) {
            // 나뭇잎 표시
            leaf.style.opacity = Math.min(1, adjustedProgress * 3);

            // 저장된 데이터 가져오기
            const initialX = parseFloat(leaf.dataset.initialX);
            const initialY = parseFloat(leaf.dataset.initialY);
            const moveX = parseFloat(leaf.dataset.moveX);
            const moveY = parseFloat(leaf.dataset.moveY);
            const rotation = parseFloat(leaf.dataset.rotation);
            const rotationDelta = parseFloat(leaf.dataset.rotationDelta);
            const scale = parseFloat(leaf.dataset.scale);
            const amplitude = parseFloat(leaf.dataset.amplitude);
            const frequency = parseFloat(leaf.dataset.frequency);
            const resistance = parseFloat(leaf.dataset.resistance);
            const rotateX = parseFloat(leaf.dataset.rotateX);
            const rotateY = parseFloat(leaf.dataset.rotateY);

            // 바람의 영향을 받는 진행률 (저항에 따라 다름)
            const windEffect =
              adjustedProgress * (2 - resistance) * windVariation;

            // 위치 계산 - 사인 곡선을 사용하여 바람에 날리는 효과
            const waveOffset =
              Math.sin(adjustedProgress * frequency) *
              amplitude *
              (1 - adjustedProgress);
            const accelerationFactor = Math.pow(adjustedProgress, 0.7); // 가속도 효과 (점점 더 빨라짐)

            const currentX = initialX + moveX * accelerationFactor;
            const currentY = initialY + moveY * adjustedProgress + waveOffset;

            // 회전 계산 - 바람 세기에 따라 회전 속도가 달라짐
            const currentRotation = rotation + rotationDelta * windEffect;

            // 3D 회전 효과 추가 - 바람에 따라 나뭇잎이 뒤집히는 효과
            const currentRotateX =
              rotateX * Math.sin(adjustedProgress * 6) * (1 - adjustedProgress);
            const currentRotateY =
              rotateY * Math.sin(adjustedProgress * 5) * (1 - adjustedProgress);

            // 스타일 적용 - 3D 변환을 포함한 복합 변환
            leaf.style.left = `${currentX}px`;
            leaf.style.top = `${currentY}px`;
            leaf.style.transform = `
                            rotate(${currentRotation}deg) 
                            rotateX(${currentRotateX}deg) 
                            rotateY(${currentRotateY}deg)
                            scale(${scale * (1 - adjustedProgress * 0.3)})
                        `;

            // 나뭇잎이 화면 밖으로 나갔을 때 투명도 감소
            if (
              currentX < 0 ||
              currentX > window.innerWidth ||
              currentY < 0 ||
              currentY > window.innerHeight
            ) {
              leaf.style.opacity = Math.max(
                0,
                1 - (adjustedProgress - 0.7) * 3
              );
            }
          }
        });
      }
    }

    function updateClickCount() {
      clickCountElement.textContent = clickCount;

      // 숫자 업데이트 애니메이션
      clickCountElement.classList.add("updated");
      setTimeout(function () {
        clickCountElement.classList.remove("updated");
      }, 300);
    }

    function playDoorSound() {
      // 효과음 재생 기능은 선택사항이므로 주석 처리
      // const doorSound = new Audio('door-open.mp3');
      // doorSound.play();
    }
  }
});
