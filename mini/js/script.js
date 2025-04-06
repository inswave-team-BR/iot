// ==========================================
// 페이지 초기화 및 사용자 인터랙션 처리
// ==========================================

/**
 * DOM이 완전히 로드된 후 실행되는 함수
 * 미니홈피의 각 기능별 초기화 작업을 순차적으로 진행합니다.
 */
let personalData = null; // 개인 데이터 객체
document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  currentHost = urlParams.get("id");

  // 개인 데이터 초기화
  initPersonalData();

  // 프로필 데이터 적용
  applyProfileData();

  // 방문자 수 업데이트
  updateVisitorCount();

  // 탭 메뉴 이벤트 리스너 등록
  initTabMenu();

  // 방명록 삭제 버튼 이벤트 리스너 등록
  initGuestbookActions();

  // 음악 플레이어 초기화
  initMusicPlayer();
});
function initPersonalData() {
  console.log("currentHost", currentHost);
  if (currentHost === "siyeon") personalData = siyeon_personalData;
  else if (currentHost === "jaeseong") personalData = jaeseong_personalData;
  else if (currentHost === "jaewon") personalData = jaewon_personalData;
  else if (currentHost === "yooseok") personalData = yooseok_personalData;
}

/**
 * 프로필 데이터를 HTML에 적용하는 함수
 * personal-data.js에서 정의된 personalData 객체를 사용하여 페이지의 내용을 업데이트합니다.
 */
function applyProfileData() {
  // 홈페이지 제목 적용
  document.querySelector(".homepage-title").textContent =
    personalData.profile.homepageTitle;

  // 오늘의 기분 적용
  const todayFeelingElement = document.querySelector(".today-feeling");
  todayFeelingElement.innerHTML = `<span class="today-title">TODAY is...</span> ${personalData.profile.todayFeeling}`;

  // 상태 메시지 적용
  document.querySelector(".status-message").textContent =
    personalData.profile.statusMessage;

  // 프로필 정보 적용
  document.querySelector(
    ".name-info"
  ).textContent = `이름: ${personalData.profile.profileInfo.name}`;
  document.querySelector(
    ".birthday-info"
  ).textContent = `생일: ${personalData.profile.profileInfo.birthday}`;
  document.querySelector(
    ".email-info"
  ).textContent = `이메일: ${personalData.profile.profileInfo.email}`;
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

  // URL 매개변수에서 팀원 이름(id) 가져오기
  let memberName = currentHost;

  // 팀원 이름이 없는 경우 기본값 설정
  if (!memberName) {
    memberName = "default";
  }

  // localStorage 키 생성 (팀원별로 고유한 키 사용)
  const visitorKey = "cyworld_visitor_" + memberName;

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
      total: totalCount,
    };
  } else {
    // 첫 방문인 경우
    visitorData = {
      lastVisit: today,
      today: 1,
      total: 1,
    };
  }

  // localStorage에 방문 데이터 저장
  localStorage.setItem(visitorKey, JSON.stringify(visitorData));

  // 화면에 방문자 수 표시
  document.querySelector(".today-count").textContent = visitorData.today;
  document.querySelector(".total-count").textContent = visitorData.total;
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
  const tabItems = document.querySelectorAll(".tab-item");

  tabItems.forEach((tab) => {
    tab.addEventListener("click", function () {
      // 모든 탭 비활성화
      tabItems.forEach((item) => item.classList.remove("active"));

      // 클릭한 탭 활성화
      this.classList.add("active");

      // 탭에 따라 콘텐츠 표시
      const tabName = this.getAttribute("data-tab");

      // 모든 콘텐츠 영역 숨기기
      document.getElementById("guestbook").style.display = "none";
      document.getElementById("miniroom").style.display = "none";
      document.getElementById("decorate").style.display = "none";
      document.getElementById("edit-area").style.display = "none";
      document.getElementById("update-news").style.display = "none";

      // 선택한 탭에 따라 콘텐츠 표시
      if (tabName === "home") {
        document.getElementById("decorate").style.display = "block";
        document.getElementById("edit-area").style.display = "block";
        document.getElementById("update-news").style.display = "block";
      } else if (tabName === "guestbook") {
        document.getElementById("miniroom").style.display = "block";
        document.getElementById("guestbook").style.display = "block";
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
  const deleteButtons = document.querySelectorAll(".entry-action");

  deleteButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // 삭제 확인
      if (confirm("정말로 이 방명록을 삭제하시겠습니까?")) {
        // 해당 방명록 삭제 (부모 엘리먼트 찾아서 삭제)
        const entry = this.closest(".guestbook-entry");
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

// ==========================================
// 다이어리 관련 기능
// ==========================================

// ==========================================
// 음악 플레이어 관련 변수
// ==========================================

/** HTML audio 요소에 대한 참조 - 배경음악 재생에 사용됨 */
let audioPlayer;

/** 현재 재생 중인 노래의 고유 식별자 */
let currentSongId = "";

/**
 * 주의: 오디오 파일은 Git 저장소에 포함되어 있지 않습니다.
 * 이 코드를 실행하려면 다음 작업이 필요합니다:
 * 1. 'audio/' 디렉토리를 만들거나 확인하세요.
 * 2. 아래 목록의 MP3 파일을 별도로 다운로드하여 해당 디렉토리에 추가하세요.
 * 3. 파일명은 정확히 일치해야 합니다.
 */

/** 현재 재생 중인 노래의 songsData 배열 내 인덱스 */
let currentSongIndex = 0;

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
  audioPlayer = document.getElementById("audio-player");

  // 노래 선택 드롭다운 옵션 초기화
  initSongSelectOptions();

  // 이벤트 리스너 등록
  document.getElementById("playBtn").addEventListener("click", playAudio);
  document.getElementById("pauseBtn").addEventListener("click", pauseAudio);
  document
    .getElementById("prevBtn")
    .addEventListener("click", playPreviousSong);
  document.getElementById("nextBtn").addEventListener("click", playNextSong);
  document.getElementById("songSelect").addEventListener("change", changeSong);

  // 오디오 이벤트 리스너
  audioPlayer.addEventListener("play", updatePlayPauseButtons);
  audioPlayer.addEventListener("pause", updatePlayPauseButtons);
  audioPlayer.addEventListener("ended", playNextSong);
  audioPlayer.addEventListener("timeupdate", updateProgress);
  audioPlayer.addEventListener("loadedmetadata", updateDuration);
}

/**
 * 음악 선택 드롭다운 메뉴를 초기화하는 함수
 * personal-data.js에서 정의한 personalData.songs 배열을 사용하여 드롭다운 옵션을 동적으로 생성합니다.
 */
function initSongSelectOptions() {
  const songSelect = document.getElementById("songSelect");

  // 기존 옵션 제거
  songSelect.innerHTML = "";

  // 기본 옵션 추가
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "-- 노래 선택 --";
  songSelect.appendChild(defaultOption);

  // 음악 목록에서 옵션 추가
  personalData.songs.forEach((song) => {
    const option = document.createElement("option");
    option.value = song.id;
    option.textContent = song.title;
    songSelect.appendChild(option);
  });
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
 * 이전 곡 재생 함수
 * 재생 목록에서 현재 곡 이전의 곡을 재생합니다.
 * 첫 번째 곡인 경우 마지막 곡으로 이동합니다.
 */
function playPreviousSong() {
  // 현재 인덱스에서 1을 빼고, 0보다 작아지면 마지막 인덱스로 설정
  currentSongIndex =
    (currentSongIndex - 1 + personalData.songs.length) %
    personalData.songs.length;

  // 선택된 곡 정보 가져오기
  const song = personalData.songs[currentSongIndex];

  // 곡 로드 및 재생
  loadAndPlaySong(song.id, song.title);

  // 선택 상자 업데이트
  updateSelectBox();
}

/**
 * 다음 곡 재생 함수
 * 재생 목록에서 현재 곡 다음의 곡을 재생합니다.
 * 마지막 곡인 경우 첫 번째 곡으로 이동합니다.
 */
function playNextSong() {
  // 현재 인덱스에서 1을 더하고, 배열 길이로 나눈 나머지를 구하여 순환 구조 생성
  currentSongIndex = (currentSongIndex + 1) % personalData.songs.length;

  // 선택된 곡 정보 가져오기
  const song = personalData.songs[currentSongIndex];

  // 곡 로드 및 재생
  loadAndPlaySong(song.id, song.title);

  // 선택 상자 업데이트
  updateSelectBox();
}

/**
 * 드롭다운에서 노래 변경 시 호출되는 함수
 * 사용자가 드롭다운에서 다른 곡을 선택했을 때 해당 곡을 로드하고 재생합니다.
 */
function changeSong() {
  // 선택한 곡의 ID 가져오기
  const songId = document.getElementById("songSelect").value;

  if (songId) {
    // 선택한 곡의 인덱스 찾기
    currentSongIndex = personalData.songs.findIndex((s) => s.id === songId);

    if (currentSongIndex !== -1) {
      // 선택한 곡 정보 가져오기
      const song = personalData.songs[currentSongIndex];

      // 곡 로드 및 재생
      loadAndPlaySong(song.id, song.title);
    }
  } else {
    // 곡을 선택하지 않은 경우 (기본 옵션 선택)
    pauseAudio();
    document.getElementById("songTitle").textContent = "노래를 선택해주세요";
    currentSongId = "";
  }
}

/**
 * 오디오 파일 로드 및 재생 함수
 * 지정된 노래 ID와 제목을 사용하여 오디오 파일을 로드하고 재생합니다.
 * @param {string} songId - 재생할 노래의 고유 ID
 * @param {string} title - 노래 제목 (UI에 표시됨)
 */
function loadAndPlaySong(songId, title) {
  // 이미 재생 중인 곡인지 확인
  if (currentSongId === songId && !audioPlayer.paused) {
    return;
  }

  // 선택한 곡 찾기
  const song = personalData.songs.find((s) => s.id === songId);

  if (song) {
    // 오디오 파일 경로 설정
    audioPlayer.src = song.src;

    // 곡 ID 저장
    currentSongId = songId;

    // 제목 표시
    document.getElementById("songTitle").textContent = title;

    // 재생
    playAudio();
  }
}

/**
 * 재생/일시정지 버튼 상태 업데이트 함수
 * 현재 오디오의 재생 상태에 따라 적절한 컨트롤 버튼을 표시합니다.
 * 재생 중일 때는 일시정지 버튼을, 일시정지 상태일 때는 재생 버튼을 보여줍니다.
 */
function updatePlayPauseButtons() {
  if (audioPlayer.paused) {
    document.getElementById("playBtn").style.display = "inline-block";
    document.getElementById("pauseBtn").style.display = "none";
  } else {
    document.getElementById("playBtn").style.display = "none";
    document.getElementById("pauseBtn").style.display = "inline-block";
  }
}

/**
 * 선택 박스 업데이트 함수
 * 현재 재생 중인 노래에 맞게 드롭다운 메뉴의 선택 상태를 동기화합니다.
 */
function updateSelectBox() {
  const selectElement = document.getElementById("songSelect");
  selectElement.value = personalData.songs[currentSongIndex].id;
}

/**
 * 진행 상태 업데이트 함수
 * 노래 재생 중 시간 표시와 진행 막대를 업데이트하여 현재 재생 위치를 시각적으로 보여줍니다.
 */
function updateProgress() {
  const currentTime = document.getElementById("current-time");
  const progressBar = document.getElementById("progress-bar");

  // 시간 표시 업데이트
  const minutes = Math.floor(audioPlayer.currentTime / 60);
  const seconds = Math.floor(audioPlayer.currentTime % 60);
  currentTime.textContent = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

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
  const durationElement = document.getElementById("duration");

  const minutes = Math.floor(audioPlayer.duration / 60);
  const seconds = Math.floor(audioPlayer.duration % 60);
  durationElement.textContent = `${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}
