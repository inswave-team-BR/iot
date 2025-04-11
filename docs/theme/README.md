# 다크모드 기능

사용자 환경에 맞게 자동 또는 수동으로 전환 가능한 다크모드 기능입니다.

## 기능 개요

사용자의 시스템 설정(OS 테마)에 따라 자동으로 라이트/다크 모드를 적용하거나, 사용자가 수동으로 테마를 전환할 수 있는 기능입니다. CSS 변수를 활용하여 모든 UI 요소가 일관되게 테마에 따라 변경됩니다. 사용자의 테마 선택은 로컬 스토리지에 저장되어 페이지 방문 시 유지됩니다.

## 기술 스택

- HTML5, CSS3, JavaScript (ES6+)
- CSS 변수 (Custom Properties)
- CSS 미디어 쿼리 (prefers-color-scheme)
- Web Storage API (localStorage)
- Window.matchMedia API

## 주요 기능

1. **시스템 테마 감지**
   - 운영체제(Windows, macOS, iOS, Android 등)의 테마 설정 감지
   - `prefers-color-scheme` 미디어 쿼리를 사용하여 자동 적용

2. **사용자 테마 선택**
   - 테마 토글 버튼을 통한 수동 테마 변경
   - 사용자 선택이 시스템 설정보다 우선 적용

3. **테마 설정 저장**
   - 로컬 스토리지에 사용자의 테마 선택 저장
   - 페이지 재방문 시 선택한 테마 유지

4. **UI 전체 테마 적용**
   - 배경, 텍스트, 카드, 버튼 등 모든 UI 요소 스타일 변경
   - 날씨 위젯, 팀 카드, 소셜 아이콘 등 모든 구성 요소에 테마 적용
   - 3D 문, 키, 날씨 차트 등 복잡한 요소에도 테마 적용

5. **적용 페이지**
   - `index.html`: 3D 문 입장 페이지
   - `home.html`: 메인 페이지 및 날씨 대시보드
   - 각 미니홈피 페이지

## 설치 및 설정

별도의 설치나 API 키는 필요하지 않습니다. 모든 기능은 클라이언트 측 코드로 구현되어 있습니다.

## 구현 세부 사항

### CSS 변수 정의

라이트모드와 다크모드에 대한 색상 변수를 CSS에 정의합니다:

```css
:root {
  /* 라이트 모드 변수 */
  --background-color: #ffffff;
  --background-gradient: linear-gradient(135deg, #eaedf0 0%, #d9dde2 100%);
  --default-color: #212529;
  --text-color: #333;
  --heading-color: #101f0c;
  --surface-color: #ffffff;
  /* 추가 변수들... */
}

/* 다크 모드 변수 - 시스템 설정 기반 */
@media (prefers-color-scheme: dark) {
  :root {
    --background-color: #121212;
    --background-gradient: linear-gradient(135deg, #121212 0%, #1a1f25 100%);
    --default-color: #e0e0e0;
    --text-color: #e0e0e0;
    --heading-color: #ffffff;
    --surface-color: #1e1e1e;
    /* 추가 변수들... */
  }
}

/* 수동 다크 모드 클래스 */
[data-theme="dark"] {
  --background-color: #121212;
  --background-gradient: linear-gradient(135deg, #121212 0%, #1a1f25 100%);
  --default-color: #e0e0e0;
  /* 추가 변수들... */
}
```

### 테마 토글 버튼 추가

HTML에 테마 토글 버튼을 추가합니다:

```html
<button class="theme-toggle" id="theme-toggle" aria-label="다크 모드 토글">
  <svg class="icon sun-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <!-- 추가 SVG 요소들... -->
  </svg>
  <svg class="icon moon-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
</button>
```

### JavaScript 테마 관리 로직

테마 감지 및 전환 로직을 JavaScript로 구현합니다:

```javascript
// 테마 관리 함수
function handleThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  
  // 시스템 다크모드 감지
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  
  // 로컬 스토리지에서 사용자 설정 불러오기
  const currentTheme = localStorage.getItem('theme');
  
  // 초기 테마 설정
  if (currentTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else if (currentTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  } else if (prefersDarkScheme.matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
  
  // 테마 토글 기능
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
  });
  
  // 시스템 테마 변경 감지 및 반영 (자동 모드일 때만)
  prefersDarkScheme.addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      if (e.matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
      }
    }
  });
}

// 페이지 로드 시 테마 관리 함수 실행
document.addEventListener('DOMContentLoaded', handleThemeToggle);
```

### 페이지별 구현 상세

#### 입장 페이지 (index.html)
입장 페이지에서는 3D 문의 텍스처와 그림자, 열쇠 색상이 테마에 맞게 조정됩니다:
```css
/* 라이트 모드 */
.door {
  background-color: var(--door-color);
  box-shadow: var(--door-shadow);
}

/* 다크 모드 */
[data-theme="dark"] .door {
  background-color: var(--dark-door-color);
  box-shadow: var(--dark-door-shadow);
}

/* 열쇠 스타일 */
.key {
  background-color: var(--key-color);
}

[data-theme="dark"] .key {
  background-color: var(--dark-key-color);
}
```

#### 홈 페이지 (home.html)
날씨 위젯과 팀 카드가 테마에 따라 최적화됩니다:
```css
/* 날씨 카드 - 라이트 모드 */
.weather-card {
  background-color: var(--surface-color);
  color: var(--text-color);
}

/* 팀 카드 - 라이트 모드 */
.team-card {
  background-color: var(--surface-color);
  box-shadow: var(--card-shadow);
}

/* 다크 모드 적용 */
[data-theme="dark"] .weather-card,
[data-theme="dark"] .team-card {
  background-color: var(--dark-surface-color);
  color: var(--dark-text-color);
  box-shadow: var(--dark-card-shadow);
}
```

### 이미지 및 그래픽 최적화

다크모드에서 이미지와 그래픽의 가시성을 향상시키기 위한 처리:

```css
/* 로고 및 이미지 필터 처리 */
[data-theme="dark"] .logo-image {
  filter: brightness(0.9) contrast(1.1);
}

/* SVG 아이콘 색상 처리 */
.icon {
  fill: var(--icon-color);
}
[data-theme="dark"] .icon {
  fill: var(--dark-icon-color);
}
```

## 사용 방법

### 시스템 설정에 따른 자동 테마 적용
- 별도의 설정 없이 운영체제의 테마 설정을 따라 자동으로 적용됩니다.
- Windows, macOS, iOS, Android 등의 다크모드 설정과 연동됩니다.

### 수동 테마 변경
- 페이지 우측 상단의 테마 토글 버튼(☀️/🌙)을 클릭하여 테마 전환
- 설정한 테마는 브라우저 로컬 스토리지에 저장되어 유지됩니다.

### 테마 초기화
- 브라우저 로컬 스토리지를 초기화하면 시스템 설정에 따른 자동 테마로 돌아갑니다.

## 문제 해결

### 테마가 변경되지 않는 경우
- 브라우저가 최신 버전인지 확인하세요. 이 기능은 모던 브라우저를 필요로 합니다.
- 개발자 도구로 로컬 스토리지를 확인하고, 필요시 'theme' 항목을 삭제하여 초기화할 수 있습니다.

### 일부 요소가 테마에 맞지 않게 표시되는 경우
- 개발자 도구를 통해 해당 요소의 CSS 변수 적용 여부를 확인하세요.
- 하드코딩된 색상값이 CSS 변수를 덮어쓰고 있을 수 있습니다.

### 시스템 테마 감지가 작동하지 않는 경우
- 브라우저가 `prefers-color-scheme` 미디어 쿼리를 지원하는지 확인하세요.
- 일부 구형 브라우저에서는 시스템 테마 감지 기능이 지원되지 않을 수 있습니다.

## 향후 개선 사항

- 테마 변경 시 부드러운 트랜지션 효과 추가
- 추가 테마 옵션 (시스템 자동/항상 라이트/항상 다크) 선택 UI
- 테마별 폰트 크기 및 간격 조정 기능
- 특정 시간에 따른 자동 테마 전환 기능
- 사용자 커스텀 테마 생성 기능 추가
- 컴포넌트별 테마 설정 옵션 제공 