document.addEventListener('DOMContentLoaded', function() {
    // index.html 페이지 로직 실행
    initIndexPage();
    
    function initIndexPage() {
        // 애니메이션 상태를 추적하는 플래그 추가
        let isAnimationRunning = false;
        
        const door = document.querySelector('.door');
        const doorBody = document.querySelector('.door-body');
        const doorKnob = document.querySelector('.door-knob');
        const doorPanels = document.querySelectorAll('.door-panel-top, .door-panel-middle, .door-panel-bottom');
        const clickCountElement = document.getElementById('click-count');
        const doorMessageSpan = document.querySelector('.door-message span');
        
        // 로컬 스토리지에서 클릭 횟수 가져오기
        let clickCount = parseInt(localStorage.getItem('doorClickCount')) || 0;
        
        // 클릭 횟수 업데이트
        updateClickCount();
        
        // 문 클릭 이벤트
        door.addEventListener('click', handleDoorClick);
        doorKnob.addEventListener('click', function(e) {
            e.stopPropagation(); // 이벤트 버블링 방지
            handleDoorClick();
        });
        
        doorMessageSpan.addEventListener('click', function() {
            door.classList.add('attention');
            setTimeout(() => {
                door.classList.remove('attention');
            }, 800);
        });
        
        door.addEventListener('keydown', function(e) {
            // 엔터 키 클릭 처리
            if (e.key === 'Enter') {
                handleDoorClick();
            }
        });
        
        // 마우스 이동에 따라 문에 입체감 추가
        document.addEventListener('mousemove', function(e) {
            // 문이 클릭되었거나 애니메이션이 진행 중이면 이벤트 무시
            if (door.classList.contains('clicked') || isAnimationRunning) return;
            
            // 마우스 커서가 문과 충분히 가까울 때만 적용
            const doorRect = door.getBoundingClientRect();
            const doorCenterX = doorRect.left + doorRect.width / 2;
            const doorCenterY = doorRect.top + doorRect.height / 2;
            
            const distanceX = (e.clientX - doorCenterX) / window.innerWidth * 2;
            const distanceY = (e.clientY - doorCenterY) / window.innerHeight * 2;
            
            // 문 주변에 마우스가 있을 때만 회전 효과 적용
            if (Math.abs(distanceX) < 0.6 && Math.abs(distanceY) < 0.6) {
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
                
                // 빛 효과 시뮬레이션
                const lightPosX = 50 - distanceX * 30;
                const lightPosY = 50 - distanceY * 30;
                doorBody.style.backgroundImage = `
                    linear-gradient(135deg, 
                        rgba(160, 82, 45, 0.9) 0%, 
                        rgba(139, 69, 19, 0.9) 100%),
                    radial-gradient(
                        circle at ${lightPosX}% ${lightPosY}%, 
                        rgba(255, 255, 255, 0.15) 0%, 
                        rgba(255, 255, 255, 0) 50%
                    ),
                    repeating-linear-gradient(
                        90deg, 
                        rgba(0, 0, 0, 0.05) 0px, 
                        rgba(0, 0, 0, 0.05) 2px, 
                        transparent 2px, 
                        transparent 20px
                    )
                `;
            } else {
                // 효과 제거
                door.style.transform = '';
                doorPanels.forEach(panel => {
                    panel.style.transform = 'translateZ(3px)';
                });
                doorKnob.style.transform = 'translateY(-50%) translateZ(10px)';
                doorBody.style.backgroundImage = '';
            }
        });
        
        function handleDoorClick() {
            // 애니메이션이 이미 진행 중이면 중복 실행 방지
            if (isAnimationRunning) return;
            
            // 애니메이션 시작 플래그 설정
            isAnimationRunning = true;
            
            // 효과음 재생 (옵션)
            playDoorSound();
            
            // 클릭 횟수 증가
            clickCount++;
            
            // 로컬 스토리지에 클릭 횟수 저장
            localStorage.setItem('doorClickCount', clickCount);
            
            // 클릭 횟수 표시 업데이트
            updateClickCount();
            
            // 문 패널 효과 초기화
            doorPanels.forEach(panel => {
                panel.style.transform = 'translateZ(3px)';
            });
            
            // 문 애니메이션 실행
            door.classList.add('clicked');
            
            // 문이 열리는 효과 향상
            let frameCount = 0;
            const frames = 20;
            const animateOpenDoor = () => {
                frameCount++;
                if (frameCount <= frames) {
                    // 열리는 동안 미세한 흔들림 추가
                    const progress = frameCount / frames;
                    const shakeFactor = Math.sin(progress * Math.PI * 4) * (1 - progress) * 2;
                    const rotY = -85 * progress;
                    
                    door.style.transform = `perspective(2000px) rotateY(${rotY}deg) rotateX(${shakeFactor}deg) rotateZ(${shakeFactor * 0.5}deg)`;
                    
                    requestAnimationFrame(animateOpenDoor);
                } else {
                    // 애니메이션 완료 후 포털 효과 적용
                    applyPortalEffect();
                }
            };
            
            requestAnimationFrame(animateOpenDoor);
        }
        
        // 포털 효과를 별도 함수로 분리하여 일관성 향상
        function applyPortalEffect() {
            // 애니메이션 플래그 유지
            isAnimationRunning = true;
            
            // 문에 빛 효과 추가
            doorBody.style.boxShadow = '0 0 30px 10px rgba(255, 255, 255, 0.7)';
            
            // 애니메이션 시작 시간을 명확히 기록
            const portalStartTime = performance.now();
            
            // 문의 위치 및 크기 정보 가져오기
            const doorRect = door.getBoundingClientRect();
            const doorCenterX = doorRect.left + doorRect.width / 2;
            const doorCenterY = doorRect.top + doorRect.height / 2;
            
            // 포털 효과 요소 설정
            setupPortalElements(doorCenterX, doorCenterY);
            
            // requestAnimationFrame을 사용하여 애니메이션 일관성 향상
            const tunnelEffect = document.querySelector('.tunnel-effect');
            const speedLines = document.querySelector('.speed-lines');
            const container = document.querySelector('.container');
            
            requestAnimationFrame(function portalAnimation(timestamp) {
                const elapsed = timestamp - portalStartTime;
                
                if (elapsed < 800) { // 0.8초 동안 애니메이션 실행
                    const progress = elapsed / 800;
                    
                    // 점진적인 효과 적용
                    updatePortalAnimation(progress, door, tunnelEffect, speedLines, container);
                    
                    requestAnimationFrame(portalAnimation);
                } else {
                    // 애니메이션 완료 후 리다이렉션
                    window.location.href = 'home.html';
                }
            });
        }
        
        // 포털 효과 요소 설정 함수
        function setupPortalElements(doorCenterX, doorCenterY) {
            // 터널 효과를 위한 오버레이 추가
            const tunnelEffect = document.createElement('div');
            tunnelEffect.className = 'tunnel-effect';
            tunnelEffect.dataset.centerX = doorCenterX;
            tunnelEffect.dataset.centerY = doorCenterY;
            document.body.appendChild(tunnelEffect);
            
            // 속도선 효과 추가
            const speedLines = document.createElement('div');
            speedLines.className = 'speed-lines';
            document.body.appendChild(speedLines);
            
            // 컨테이너 스타일 설정
            const container = document.querySelector('.container');
            
            // CSS 스타일 동적 추가
            const style = document.createElement('style');
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
            `;
            document.head.appendChild(style);
        }
        
        // 포털 애니메이션 업데이트 함수
        function updatePortalAnimation(progress, door, tunnelEffect, speedLines, container) {
            // 애니메이션 진행에 따라 효과 업데이트
            tunnelEffect.style.opacity = progress;
            speedLines.style.opacity = progress > 0.3 ? 0.7 : progress * 2.3;
            
            // 줌 및 회전 효과 업데이트
            const scale = 1 + progress * 0.5;
            const translateZ = progress * 300;
            
            // 문이 확대되는 효과 (transform 속성 유지)
            door.style.transform = `perspective(2000px) rotateY(-85deg) scale(${1 + progress * 0.2})`;
            door.style.filter = `brightness(${1 + progress * 0.8})`;
            
            // 컨테이너 확대 효과
            container.style.transform = `scale(${scale})`;
            container.style.filter = `brightness(${1 + progress * 0.3})`;
            
            // 터널 효과 업데이트
            tunnelEffect.style.background = `radial-gradient(circle at ${tunnelEffect.dataset.centerX}px ${tunnelEffect.dataset.centerY}px, 
                rgba(255,255,255,${progress}) 0%, 
                rgba(200,230,255,${progress * 0.9}) 10%,
                rgba(255,255,255,${progress * 0.7}) 25%,
                rgba(255,255,255,0) 60%)`;
            
            // 속도선 크기 업데이트
            speedLines.style.backgroundSize = `${50 - progress * 40}px ${50 - progress * 40}px`;
            speedLines.style.transform = `scale(${1 + progress})`;
        }
        
        function updateClickCount() {
            clickCountElement.textContent = clickCount;
            
            // 숫자 업데이트 애니메이션
            clickCountElement.classList.add('updated');
            setTimeout(function() {
                clickCountElement.classList.remove('updated');
            }, 300);
        }
        
        function playDoorSound() {
            // 효과음 재생 기능은 선택사항이므로 주석 처리
            // const doorSound = new Audio('door-open.mp3');
            // doorSound.play();
        }
    }
}); 