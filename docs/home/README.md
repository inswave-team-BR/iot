# 🌐 Team HomePage

> 팀 구성원을 소개하고 날씨, 지도, 차트 등 다양한 기능을 제공하는 반응형 웹 기반 홈페이지입니다.

## 🔧 Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript
- **Framework & Libraries**:
  - Bootstrap 5 (Customized)
  - SweetAlert2
  - AOS (Animate on Scroll)
  - Glightbox
  - Kakao Maps API
  - Chart.js
- **기타**: LocalStorage 기반 로그인 상태 관리

---

## 📌 Features


#### 1. 🧱 Bootstrap 수정 및 반응형 개선
- 전체 페이지에서 사용되는 Bootstrap 기반 레이아웃 및 버튼 스타일 커스터마이징

#### 2. 🏠 `Home`, `About`, `Services` Section 구성
- 메인 섹션을 직접 설계 및 구성
- `Services` 항목 클릭 시 동적으로 콘텐츠 보드 변경

#### 3. 🔐 로그인/로그아웃 기능
- 로그인하지 않은 상태: 로그인 버튼만 표시
- 로그인 시:
  - 상단에 사용자 이름 + 환영 메시지 표시
  - **로그아웃** 및 **회원탈퇴** 버튼 동적 표시
  - 탈퇴 시 비밀번호 확인 → 계정 및 마커 정보 완전 삭제

#### 4. 🎬 메인 영상 삽입
- `videos/kosa_intro.mp4` 영상 삽입
- 썸네일 설정(`poster`) 포함

#### 5. 🧑‍💻 Personal Homepage 보드
- 각 팀원(김시연, 이재성, 이재원, 황유석)의 카드형 UI 구현
- hover 효과 및 반응형 대응

#### 6. 🧭 Services 항목 구현
- `Team 소개`, `Kanban Board`, `Map`, `Chart` 클릭 시 보드 전환
- 각 섹션은 별도 iframe으로 분리되어 로딩

#### 7. 🗺️ Map / 📊 Chart iframe 구현
- `map.html`, `chart.html` 파일을 iframe으로 로드하여 표시
- `Map`은 카카오 지도 중심 좌표 초기화 기능 포함
- `Chart`는 로딩 시 애니메이션 및 스크롤 처리 적용

#### 8. 🦶 Footer 전체 구성
- 주소, 연락처, 위치 보기 기능
- 카카오맵 기반 위치 보기 구현 (지도 토글)
- SNS 링크: 블로그, 페이스북, 카카오톡, 유튜브
- 다크모드 대응 (아이콘 반전 포함)


