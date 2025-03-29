document.addEventListener('DOMContentLoaded', function() {
    // index.html 페이지 로직 실행
    initIndexPage();
    
    function initIndexPage() {
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
            if (door.classList.contains('clicked')) return;
            
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
                    // 애니메이션 완료 후 문을 열린 상태로 유지
                    // 0.5초 후 줌 인 페이드 아웃 시작
                    setTimeout(function() {
                        // 페이드 아웃 효과 추가
                        const fadeEffect = document.createElement('div');
                        fadeEffect.className = 'fade-effect';
                        document.body.appendChild(fadeEffect);
                        
                        // 줌 인 효과를 위해 컨테이너에 스타일 적용
                        const container = document.querySelector('.container');
                        container.style.transition = 'transform 0.7s ease-in';
                        container.style.transformOrigin = 'center center';
                        
                        // 페이드 아웃 CSS 스타일 동적 추가
                        const style = document.createElement('style');
                        style.textContent = `
                            .fade-effect {
                                position: fixed;
                                top: 0;
                                left: 0;
                                width: 100%;
                                height: 100%;
                                background-color: #fff;
                                opacity: 0;
                                transition: opacity 0.6s ease-in;
                                z-index: 9999;
                            }
                            .fade-effect.active {
                                opacity: 1;
                            }
                        `;
                        document.head.appendChild(style);
                        
                        // 줌 인 효과 적용
                        setTimeout(() => {
                            container.style.transform = 'scale(1.1)';
                            
                            // 페이드 효과 활성화
                            fadeEffect.classList.add('active');
                            
                            // 페이드 완료 후 리다이렉션
                            setTimeout(() => {
                                window.location.href = 'home.html';
                            }, 600);
                        }, 10);
                    }, 500);
                }
            };
            
            requestAnimationFrame(animateOpenDoor);
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