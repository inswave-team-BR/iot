# 날씨 대시보드 기능

실시간 날씨 정보와 지역별 날씨 지도를 제공하는 대시보드 기능입니다.

## 기능 개요

사용자의 현재 위치 또는 검색한 지역의 실시간 날씨 데이터를 표시하고, 대한민국 주요 지역의 날씨를 한눈에 볼 수 있는 지도 기능을 제공합니다. 사용자 경험 향상을 위한 드래그 가능한 팝업 및 위치 동기화 기능을 포함합니다. 라이트/다크 모드 테마 시스템이 적용되어 시스템 설정에 따라 자동으로 또는 사용자 선택에 따라 테마가 변경됩니다.

## 기술 스택 및 API

- HTML5, CSS3, JavaScript (ES6+)
- OpenWeatherMap API: 실시간 날씨 데이터 및 예보 정보
- Kakao Maps API: 지도 표시 및 위치 기반 서비스
- HTML5 Geolocation API: 사용자 현재 위치 확인
- Chart.js: 주간 날씨 예보 차트 시각화
- CSS 변수: 테마 전환 시스템 구현
- Web Storage API: 사용자 테마 선호도 저장

## 주요 기능

1. **실시간 날씨 정보**
   - 현재 기온, 날씨 상태, 습도, 풍속, 체감온도 표시
   - 현재 위치 또는 검색한 지역의 날씨 정보 제공
   - 자동 위치 감지 및 수동 지역 검색 지원

2. **주간 날씨 예보**
   - 5일간의 날씨 예보 차트로 시각화
   - 최고/최저 온도 및 날씨 상태 표시

3. **지역별 날씨 지도**
   - 대한민국 주요 도시 날씨 정보를 지도에 표시
   - 지역별 현재 기온 및 날씨 아이콘 표시
   - 지역 클릭 시 상세 날씨 정보 팝업 제공

4. **드래그 가능한 날씨 팝업**
   - 팝업 전체 영역 드래그로 자유로운 위치 이동
   - 데스크톱 및 모바일 환경 모두 지원
   - 화면 경계 감지로 항상 가시성 유지

5. **위치 좌표 동기화**
   - 현재 날씨와 지도 날씨 간 데이터 일관성 확보
   - 현재 위치에서 가장 가까운 지역 자동 매핑

6. **다크모드 지원**
   - 시스템 테마 설정에 따른 자동 테마 적용
   - 수동 테마 전환 가능한 토글 버튼 제공
   - 날씨 카드, 지도, 차트 등 모든 요소에 테마 적용
   - 테마별 최적화된 가독성과 편안한 사용자 경험

## 설치 및 설정

### API 키 설정

1. OpenWeatherMap API 키 발급
   - [OpenWeatherMap](https://openweathermap.org/api) 에서 계정 생성 및 API 키 발급
   - `home.html` 파일에서 `apiKey` 변수 업데이트
   ```javascript
   const apiKey = '발급받은_API_키'; // OpenWeatherMap API 키
   ```

2. Kakao Maps API 키 설정
   - [Kakao Developers](https://developers.kakao.com/) 에서 앱 등록 및 API 키 발급
   - `home.html` 파일에 Kakao Maps SDK 스크립트 태그의 `appkey` 파라미터 업데이트
   ```html
   <script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=발급받은_API_키"></script>
   ```

### 주요 지역 설정

지도에 표시할 주요 지역을 `koreaRegions` 배열에서 정의하고 있습니다. 필요에 따라 지역을 추가하거나 수정할 수 있습니다:

```javascript
const koreaRegions = [
  { name: '서울', lat: 37.5665, lng: 126.8380 },
  { name: '부산', lat: 35.1796, lng: 129.1756 },
  // 다른 지역들...
];
```

## 구현 세부 사항

### 날씨 데이터 가져오기

OpenWeatherMap API를 사용하여 현재 날씨 데이터를 가져옵니다:

```javascript
function fetchWeatherData(latitude, longitude) {
  const apiKey = '발급받은_API_키';
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=kr`;
  
  fetch(weatherUrl)
    .then(response => response.json())
    .then(data => {
      displayWeatherData(data);
      fetchWeeklyForecast(latitude, longitude, data.timezone);
      fetchAirPollutionData(latitude, longitude);
    })
    .catch(error => {
      console.error("날씨 데이터를 가져오는데 실패했습니다:", error);
    });
}
```

### 현재 위치에서 가장 가까운 지역 찾기

하버사인 공식을 사용하여 현재 위치에서 가장 가까운 지역을 찾습니다:

```javascript
function findClosestRegion(lat, lng) {
  if (!koreaRegions || koreaRegions.length === 0) return null;
  
  // 거리 계산 함수 (하버사인 공식)
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // 지구 반경 (km)
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // 거리 (km)
  }
  
  // 각 지역과의 거리 계산
  let minDistance = Infinity;
  let closestRegion = null;
  
  koreaRegions.forEach(region => {
    const distance = calculateDistance(lat, lng, region.lat, region.lng);
    if (distance < minDistance) {
      minDistance = distance;
      closestRegion = region;
    }
  });
  
  return closestRegion;
}
```

### 드래그 가능한 팝업 구현

팝업 전체 영역에서 드래그가 가능하도록 구현합니다:

```javascript
// 팝업 전체에 드래그 이벤트 추가 (마우스)
popup.addEventListener('mousedown', function(e) {
  // 닫기 버튼 클릭은 예외 처리
  if (e.target.classList.contains('region-weather-popup-close')) {
    return;
  }
  
  isDragging = true;
  dragOffsetX = e.clientX - popup.offsetLeft;
  dragOffsetY = e.clientY - popup.offsetTop;
  popup.classList.add('dragging'); // 드래그 중임을 표시하는 클래스 추가
  e.preventDefault();
});

// 모바일 환경 지원
popup.addEventListener('touchstart', function(e) {
  // 닫기 버튼 터치는 예외 처리
  if (e.target.classList.contains('region-weather-popup-close')) {
    return;
  }
  
  isDragging = true;
  const touch = e.touches[0];
  dragOffsetX = touch.clientX - popup.offsetLeft;
  dragOffsetY = touch.clientY - popup.offsetTop;
  popup.classList.add('dragging');
  e.preventDefault();
});
```

### 다크모드 구현

CSS 변수를 활용하여 테마별 색상을 정의하고 관리합니다:

```css
:root {
  /* 라이트 모드 변수 */
  --weather-card-bg: #ffffff;
  --weather-text-color: #333333;
  --weather-temp-color: #e74c3c;
  --chart-grid-color: rgba(0, 0, 0, 0.1);
  /* 기타 변수들... */
}

@media (prefers-color-scheme: dark) {
  :root {
    /* 다크 모드 변수 */
    --weather-card-bg: #1e1e1e;
    --weather-text-color: #e0e0e0;
    --weather-temp-color: #ff6b6b;
    --chart-grid-color: rgba(255, 255, 255, 0.1);
    /* 기타 변수들... */
  }
}

[data-theme="dark"] {
  /* 수동 다크 모드용 변수 */
  --weather-card-bg: #1e1e1e;
  --weather-text-color: #e0e0e0;
  /* 기타 변수들... */
}
```

JavaScript로 테마 전환 및 저장 기능을 구현합니다:

```javascript
function handleThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  const currentTheme = localStorage.getItem('theme');
  
  // 테마 초기 설정
  if (currentTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    updateMapTheme('dark');
    updateChartTheme('dark');
  } else if (currentTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    updateMapTheme('light');
    updateChartTheme('light');
  } else if (prefersDarkScheme.matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
    updateMapTheme('dark');
    updateChartTheme('dark');
  }
  
  // 테마 토글 이벤트 처리
  themeToggle.addEventListener('click', () => {
    let theme;
    if (document.documentElement.getAttribute('data-theme') === 'dark') {
      document.documentElement.setAttribute('data-theme', 'light');
      theme = 'light';
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      theme = 'dark';
    }
    localStorage.setItem('theme', theme);
    updateMapTheme(theme);
    updateChartTheme(theme);
  });
}
```

## 사용 방법

### 현재 위치 날씨 확인
- 페이지 로드 시, 브라우저의 위치 액세스 권한을 허용하면 자동으로 현재 위치 날씨 표시
- 위치 액세스가 거부되면 기본 위치(서울)의 날씨 정보 표시

### 지역 검색
- 위치 정보 표시 부분을 클릭하여 원하는 도시 이름 입력
- 검색된 도시의 날씨 정보와 주간 예보 확인 가능

### 지역별 날씨 지도 사용
- 지도에 표시된 지역 마커 클릭 시 해당 지역의 상세 날씨 정보 팝업 표시
- 팝업은 드래그하여 자유롭게 위치 이동 가능
- 팝업 닫기는 'X' 버튼 또는 외부 영역 클릭

### 테마 변경
- 페이지 우측 상단의 테마 토글 버튼(☀️/🌙)을 클릭하여 라이트/다크 모드 전환
- 시스템 테마 설정에 따라 자동으로 테마 적용 (수동 선택하지 않은 경우)
- 테마 변경 시 날씨 카드, 지도, 차트 등 모든 UI 요소가 일관되게 변경됨

## 문제 해결

### 위치 정보를 가져올 수 없을 때
- 브라우저의 위치 정보 접근 권한 설정 확인
- 기본적으로 서울 좌표를 사용하여 날씨 정보 표시

### 날씨 데이터 불일치 문제
- 현재 날씨와 지도의 날씨 정보가 다른 경우:
  - 위치 좌표 동기화 기능이 정상 작동하는지 확인
  - 동일 지역을 검색하여 데이터 갱신

### API 호출 제한
- OpenWeatherMap 무료 계정의 API 호출 한도에 주의
- 과도한 API 호출이 발생하지 않도록 적절한 갱신 주기 설정

### 테마 전환이 작동하지 않을 때
- 브라우저가 최신 버전인지 확인 (CSS 변수 및 미디어 쿼리 지원 필요)
- 개발자 도구에서 로컬 스토리지 확인 및 필요시 'theme' 항목 삭제하여 초기화

## 향후 개선 사항

- 온도 단위 변환 기능 (섭씨/화씨)
- 테마별 날씨 아이콘 세트 제공
- 강수량 예측 및 강수 확률 표시
- 날씨에 따른 자동 배경 변화 (눈/비/맑음 등)
- 일출/일몰 시간 시각적 표현
- 다크모드 전환 시 부드러운 애니메이션 효과 추가 