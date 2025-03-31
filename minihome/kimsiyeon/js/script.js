// ==========================================
// 페이지 초기화 및 사용자 인터랙션 처리
// ==========================================

/**
 * DOM이 완전히 로드된 후 실행되는 함수
 * 미니홈피의 각 기능별 초기화 작업을 순차적으로 진행합니다.
 */
document.addEventListener('DOMContentLoaded', function() {
    // 프로필 데이터 적용
    applyProfileData();
    
    // 방문자 수 업데이트
    updateVisitorCount();
    
    // 탭 메뉴 이벤트 리스너 등록
    initTabMenu();
    
    // 방명록 삭제 버튼 이벤트 리스너 등록
    initGuestbookActions();
    
    // 미니룸 댓글 등록 이벤트 리스너 등록
    initMiniroomComments();
    
    // 다이어리 등록 이벤트 리스너 등록
    initDiaryActions();
    
    // 음악 플레이어 초기화
    initMusicPlayer();

    const homeTab = document.querySelector('.tab-item[data-tab="home"]');
    homeTab.classList.add('active');

    // 홈 탭 관련 영역 중 아이템바, 배경 선택은 숨기고 background-stage만 보이게 설정
    document.getElementById('guestbook').style.display = 'none';
    document.getElementById('miniroom').style.display = 'none';
    document.getElementById('diary').style.display = 'none';

    const decorateElements = document.querySelectorAll('.background-selector, .item-bar');
    decorateElements.forEach(el => el.style.display = 'none');

});

/**
 * 프로필 데이터를 HTML에 적용하는 함수
 * personal-data.js에서 정의된 personalData 객체를 사용하여 페이지의 내용을 업데이트합니다.
 */
function applyProfileData() {
    // 홈페이지 제목 적용
    document.querySelector('.homepage-title').textContent = personalData.profile.homepageTitle;
    
    // 오늘의 기분 적용
    const todayFeelingElement = document.querySelector('.today-feeling');
    todayFeelingElement.innerHTML = `<span class="today-title">TODAY is...</span> ${personalData.profile.todayFeeling}`;
    
    // 상태 메시지 적용
    document.querySelector('.status-message').textContent = personalData.profile.statusMessage;
    
    // 프로필 정보 적용
    document.querySelector('.name-info').textContent = `이름: ${personalData.profile.profileInfo.name}`;
    document.querySelector('.birthday-info').textContent = `생일: ${personalData.profile.profileInfo.birthday}`;
    document.querySelector('.email-info').textContent = `이메일: ${personalData.profile.profileInfo.email}`;
}

// ==========================================
// 방문자 카운터 기능
// ==========================================

/**
 * 방문자 카운터를 업데이트하는 함수
 * 사용자의 방문 기록을 localStorage에 저장하고, 오늘 방문자 수와 총 방문자 수를 화면에 표시합니다.
 * 첫 방문인 경우 초기값을 설정하고, 재방문 시 카운터를 증가시킵니다.
 */
function updateVisitorCount() {
    // 오늘 날짜 가져오기
    const today = new Date().toDateString();
    
    // 현재 페이지 경로에서 팀원 이름 추출
    const pathSegments = window.location.pathname.split('/');
    let memberName = '';
    
    // 경로에서 minihome 폴더 다음에 오는 세그먼트가 팀원 이름
    for (let i = 0; i < pathSegments.length; i++) {
        if (pathSegments[i] === 'minihome' && i + 1 < pathSegments.length) {
            memberName = pathSegments[i + 1];
            break;
        }
    }
    
    // 팀원 이름이 추출되지 않은 경우 기본값 설정
    if (!memberName) {
        memberName = 'kimsiyeon';
    }
    
    // localStorage 키 생성 (팀원별로 고유한 키 사용)
    const visitorKey = 'cyworld_visitor_' + memberName;
    
    // localStorage에서 방문 기록 가져오기
    let visitorData = localStorage.getItem(visitorKey);
    
    if (visitorData) {
        visitorData = JSON.parse(visitorData);
        
        // 총 방문자 수 업데이트
        const totalCount = visitorData.total + 1;
        
        // 오늘 방문자 수 업데이트
        let todayCount = 1;
        if (visitorData.lastVisit === today) {
            // 오늘 이미 방문한 경우
            todayCount = visitorData.today + 1;
        }
        
        // 방문 데이터 업데이트
        visitorData = {
            lastVisit: today,
            today: todayCount,
            total: totalCount
        };
    } else {
        // 첫 방문인 경우
        visitorData = {
            lastVisit: today,
            today: 1,
            total: 1
        };
    }
    
    // localStorage에 방문 데이터 저장
    localStorage.setItem(visitorKey, JSON.stringify(visitorData));
    
    // 화면에 방문자 수 표시
    document.querySelector('.today-count').textContent = visitorData.today;
    document.querySelector('.total-count').textContent = visitorData.total;
}

// ==========================================
// 탭 메뉴 기능
// ==========================================

/**
 * 탭 메뉴 초기화 함수
 * 사용자가 탭을 클릭할 때마다 해당 탭에 맞는 콘텐츠를 표시하고 탭 스타일을 변경합니다.
 * 홈, 다이어리, 방명록 탭을 동적으로 전환하는 기능을 처리합니다.
 */
function initTabMenu() {
    const tabItems = document.querySelectorAll('.tab-item');

     //시연
     const decorateElements = document.querySelectorAll('.background-selector, .item-bar, #decorate-area');
     const guestbookArea = document.getElementById('guestbook');
     const miniroomArea = document.getElementById('miniroom');
     const diaryArea = document.getElementById('diary');
     
    
    tabItems.forEach(tab => {
        tab.addEventListener('click', function() {
            // 모든 탭 비활성화
            tabItems.forEach(item => item.classList.remove('active'));
            
            // 클릭한 탭 활성화
            this.classList.add('active');
            
            // 탭에 따라 콘텐츠 표시
            const tabName = this.getAttribute('data-tab');
            
            // 모든 콘텐츠 영역 숨기기
            document.getElementById('guestbook').style.display = 'none';
            document.getElementById('miniroom').style.display = 'none';
            document.getElementById('diary').style.display = 'none';
            
            // 선택한 탭에 따라 콘텐츠 표시
            if (tabName === 'home') {
                decorateElements.forEach(el => el.style.display = 'block');

                // 배경 영역 높이 & 레이아웃 강제 고정
                const backgroundStage = document.querySelector('.background-stage');
                backgroundStage.style.flex = '1';
                backgroundStage.style.minHeight = '200px';
                backgroundStage.style.height = ''; // 또는 'auto'
                backgroundStage.style.position = 'relative'; // 혹시 모르니 다시 설정

                } else {
                decorateElements.forEach(el => el.style.display = 'none');
                document.getElementById('diary').style.display = tabName === 'diary' ? 'block' : 'none';
                document.getElementById('guestbook').style.display = tabName === 'guestbook' ? 'block' : 'none';
                }
        });
    });
}

// ==========================================
// 방명록 기능
// ==========================================

/**
 * 방명록 기능 초기화 함수
 * 방명록 삭제 버튼에 이벤트를 연결하여 사용자가 방명록을 관리할 수 있게 합니다.
 * 삭제 전 확인 메시지를 통해 실수로 삭제하는 것을 방지합니다.
 */
function initGuestbookActions() {
    const deleteButtons = document.querySelectorAll('.entry-action');
    
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 삭제 확인
            if (confirm('정말로 이 방명록을 삭제하시겠습니까?')) {
                // 해당 방명록 삭제 (부모 엘리먼트 찾아서 삭제)
                const entry = this.closest('.guestbook-entry');
                entry.remove();
                
                // 추가적으로 서버에 삭제 요청을 보내는 코드가 필요할 수 있음
                // (현재는 프론트엔드만 구현)
            }
        });
    });
}

// ==========================================
// 미니룸 관련 기능
// ==========================================

/**
 * 미니룸 댓글 기능 초기화 함수
 * 미니룸에 남길 메시지를 입력하고 등록할 수 있는 기능을 설정합니다.
 * 빈 메시지는 등록되지 않도록 검증 로직이 포함되어 있습니다.
 */
function initMiniroomComments() {
    const miniroomInput = document.querySelector('.miniroom-input input');
    const miniroomButton = document.querySelector('.miniroom-input button');
    
    miniroomButton.addEventListener('click', function() {
        const commentText = miniroomInput.value.trim();
        
        if (commentText) {
            // 댓글 등록 성공 메시지
            alert('미니룸 댓글이 등록되었습니다!');
            
            // 입력 필드 초기화
            miniroomInput.value = '';
            
            // 추가적으로 서버에 댓글 저장 요청을 보내는 코드가 필요할 수 있음
        } else {
            // 입력 내용이 없을 경우
            alert('댓글 내용을 입력해주세요!');
        }
    });
}

// ==========================================
// 다이어리 관련 기능
// ==========================================

/**
 * 다이어리 기능 초기화 함수
 * 사용자가 작성한 다이어리 내용을 처리하는 이벤트 리스너를 설정합니다.
 * 내용 검증 후 등록 메시지를 표시하고 입력 필드를 초기화합니다.
 */
function initDiaryActions() {
    const diaryInput = document.querySelector('.diary-input input');
    const diaryButton = document.querySelector('.diary-input button');
    
    diaryButton.addEventListener('click', function() {
        const diaryText = diaryInput.value.trim();
        
        if (diaryText) {
            // 다이어리 등록 성공 메시지
            alert('다이어리가 등록되었습니다!');
            
            // 입력 필드 초기화
            diaryInput.value = '';
            
            // 추가적으로 서버에 다이어리 저장 요청을 보내는 코드가 필요할 수 있음
        } else {
            // 입력 내용이 없을 경우
            alert('다이어리 내용을 입력해주세요!');
        }
    });
}

// ==========================================
// 음악 플레이어 관련 변수
// ==========================================

/** HTML audio 요소에 대한 참조 - 배경음악 재생에 사용됨 */
let audioPlayer;

/** 현재 재생 중인 노래의 고유 식별자 */
let currentSongId = '';

/**
 * 음악 선택 드롭다운 메뉴를 초기화하는 함수
 * personal-data.js에서 정의한 personalData.songs 배열을 사용하여 드롭다운 옵션을 동적으로 생성합니다.
 */
function initSongSelectOptions() {
    const songSelect = document.getElementById('songSelect');
    
    // 기존 옵션 제거
    songSelect.innerHTML = '';
    
    // 기본 옵션 추가
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '-- 노래 선택 --';
    songSelect.appendChild(defaultOption);
    
    // 음악 목록에서 옵션 추가
    personalData.songs.forEach(song => {
        const option = document.createElement('option');
        option.value = song.id;
        option.textContent = song.title;
        songSelect.appendChild(option);
    });
}

// ==========================================
// 음악 플레이어 기능
// ==========================================

/**
 * 오디오 플레이어 초기화 함수
 * 플레이어 요소를 불러오고 각종 컨트롤 버튼에 이벤트 리스너를 연결합니다.
 * 재생, 일시정지, 이전/다음 곡 등의 제어 기능과 진행 상태 업데이트를 담당합니다.
 */
function initMusicPlayer() {
    // 오디오 플레이어 요소 가져오기
    audioPlayer = document.getElementById('audio-player');
    
    // 노래 선택 드롭다운 옵션 초기화
    initSongSelectOptions();
    
    // 이벤트 리스너 등록
    document.getElementById('playBtn').addEventListener('click', playAudio);
    document.getElementById('pauseBtn').addEventListener('click', pauseAudio);
    document.getElementById('prevBtn').addEventListener('click', playPreviousSong);
    document.getElementById('nextBtn').addEventListener('click', playNextSong);
    document.getElementById('songSelect').addEventListener('change', changeSong);
    
    // 오디오 이벤트 리스너
    audioPlayer.addEventListener('play', updatePlayPauseButtons);
    audioPlayer.addEventListener('pause', updatePlayPauseButtons);
    audioPlayer.addEventListener('ended', playNextSong);
    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('loadedmetadata', updateDuration);
}

/**
 * 오디오 재생 함수
 * 현재 로드된 오디오를 재생하거나, 선택된 노래가 없는 경우 첫 번째 노래를 자동으로 로드해 재생합니다.
 */
function playAudio() {
    if (audioPlayer && audioPlayer.src) {
        audioPlayer.play();
    } else if (personalData.songs.length > 0) {
        // 아직 노래가 선택되지 않았으면 첫 번째 노래 재생
        loadAndPlaySong(personalData.songs[0].id, personalData.songs[0].title);
    }
}

/**
 * 오디오 일시정지 함수
 * 현재 재생 중인 노래를 일시정지 상태로 전환합니다.
 */
function pauseAudio() {
    if (audioPlayer) {
        audioPlayer.pause();
    }
}

/**
 * 이전 노래 재생 함수
 * 현재 곡의 이전 곡으로 이동하며, 첫 번째 곡에서는 마지막 곡으로 순환합니다.
 */
function playPreviousSong() {
    if (currentSongIndex > 0) {
        currentSongIndex--;
    } else {
        currentSongIndex = personalData.songs.length - 1;
    }
    loadAndPlaySong(personalData.songs[currentSongIndex].id, personalData.songs[currentSongIndex].title);
    updateSelectBox();
}

/**
 * 다음 노래 재생 함수
 * 현재 곡의 다음 곡으로 이동하며, 마지막 곡에서는 첫 번째 곡으로 순환합니다.
 */
function playNextSong() {
    if (currentSongIndex < personalData.songs.length - 1) {
        currentSongIndex++;
    } else {
        currentSongIndex = 0;
    }
    loadAndPlaySong(personalData.songs[currentSongIndex].id, personalData.songs[currentSongIndex].title);
    updateSelectBox();
}

/**
 * 선택한 노래 변경 함수
 * 드롭다운 메뉴에서 사용자가 선택한 노래로 변경하고 재생을 시작합니다.
 */
function changeSong() {
    const selectElement = document.getElementById('songSelect');
    const selectedSongId = selectElement.value;
    
    if (selectedSongId) {
        // 선택한 노래의 인덱스 찾기
        for (let i = 0; i < personalData.songs.length; i++) {
            if (personalData.songs[i].id === selectedSongId) {
                currentSongIndex = i;
                break;
            }
        }
        
        loadAndPlaySong(selectedSongId, personalData.songs[currentSongIndex].title);
    }
}

/**
 * 노래 로드 및 재생 함수
 * 지정된 노래를 오디오 플레이어에 로드하고 재생을 시작합니다.
 * 
 * @param {string} songId - 재생할 노래의 고유 식별자로, personalData.songs 배열에서 노래를 찾는 데 사용됨
 * @param {string} title - 플레이어에 표시될 노래 제목
 */
function loadAndPlaySong(songId, title) {
    if (songId) {
        currentSongId = songId;
        
        // 선택한 노래의 소스 찾기
        const song = personalData.songs.find(s => s.id === songId);
        if (song) {
            audioPlayer.src = song.src;
            audioPlayer.load();
            audioPlayer.play();
            document.getElementById('songTitle').textContent = title;
        }
    }
}

/**
 * 재생/일시정지 버튼 상태 업데이트 함수
 * 현재 오디오의 재생 상태에 따라 적절한 컨트롤 버튼을 표시합니다.
 * 재생 중일 때는 일시정지 버튼을, 일시정지 상태일 때는 재생 버튼을 보여줍니다.
 */
function updatePlayPauseButtons() {
    if (audioPlayer.paused) {
        document.getElementById('playBtn').style.display = 'inline-block';
        document.getElementById('pauseBtn').style.display = 'none';
    } else {
        document.getElementById('playBtn').style.display = 'none';
        document.getElementById('pauseBtn').style.display = 'inline-block';
    }
}

/**
 * 선택 박스 업데이트 함수
 * 현재 재생 중인 노래에 맞게 드롭다운 메뉴의 선택 상태를 동기화합니다.
 */
function updateSelectBox() {
    const selectElement = document.getElementById('songSelect');
    selectElement.value = personalData.songs[currentSongIndex].id;
}

/**
 * 진행 상태 업데이트 함수
 * 노래 재생 중 시간 표시와 진행 막대를 업데이트하여 현재 재생 위치를 시각적으로 보여줍니다.
 */
function updateProgress() {
    const currentTime = document.getElementById('current-time');
    const progressBar = document.getElementById('progress-bar');
    
    // 시간 표시 업데이트
    const minutes = Math.floor(audioPlayer.currentTime / 60);
    const seconds = Math.floor(audioPlayer.currentTime % 60);
    currentTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // 진행 막대 업데이트
    if (audioPlayer.duration) {
        const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressBar.style.width = `${progress}%`;
    }
}

/**
 * 총 재생 시간 업데이트 함수
 * 오디오 파일이 로드된 후 전체 재생 시간을 계산하여 표시합니다.
 */
function updateDuration() {
    const durationElement = document.getElementById('duration');
    
    const minutes = Math.floor(audioPlayer.duration / 60);
    const seconds = Math.floor(audioPlayer.duration % 60);
    durationElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
} 