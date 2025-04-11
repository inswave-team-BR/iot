# 미니홈피 방문자 카운터 시스템

미니홈피의 Today와 Total 방문자 카운터 기능은 싸이월드 미니홈피의 핵심 기능 중 하나로, 사용자의 방문 통계를 기록하고 표시합니다.

## 기능 개요

미니홈피 방문자 카운터는 다음과 같은 기능을 제공합니다:

- **Today**: 오늘 방문한 방문자 수를 표시합니다.
- **Total**: 미니홈피 개설 이후 누적된 총 방문자 수를 표시합니다.
- 각 사용자별로 독립적인 방문자 통계를 관리합니다.
- 페이지 방문 시 자동으로 카운터를 업데이트합니다.

![방문자 카운터 UI](../../mini/image/counter_preview.png)

## 기술 스택

- JavaScript (ES6+)
- localStorage API - 방문자 데이터 영구 저장
- HTML/CSS - 방문자 카운터 UI 구현

## 주요 기능 설명

### Today 카운터

Today 카운터는 현재 날짜를 기준으로 방문자 수를 계산합니다:

- 사용자가 처음 방문하면 Today 카운터는 1로 시작합니다.
- 같은 날에 재방문할 경우 Today 카운터가 증가합니다.
- 날짜가 바뀌면 Today 카운터는 다시 1부터 시작됩니다.

### Total 카운터

Total 카운터는 미니홈피 전체 방문 횟수를 누적하여 보여줍니다:

- 사용자의 모든 방문이 Total 카운터에 반영됩니다.
- 브라우저의 localStorage에 저장되어 페이지를 닫았다가 다시 열어도 데이터가 유지됩니다.
- 각 사용자(미니홈피 주인)별로 독립적인 Total 카운터를 관리합니다.

## 구현 세부 사항

### 방문자 데이터 저장 방식

방문자 데이터는 브라우저의 localStorage에 JSON 형식으로 저장됩니다:

```javascript
// 저장되는 데이터 구조
{
  lastVisit: "날짜 문자열", // 마지막 방문 날짜
  today: 숫자,           // 오늘 방문자 수
  total: 숫자            // 누적 방문자 수
}
```

### 카운터 업데이트 로직

```javascript
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
```

### 사용자별 카운터 관리

미니홈피 방문자 카운터는 URL 매개변수로 전달된 사용자 ID를 기반으로 개별적인 카운터를 관리합니다:

1. URL에서 사용자 ID 파라미터를 추출합니다: `?id=사용자이름`
2. 사용자 ID를 localStorage 키의 일부로 사용합니다: `cyworld_visitor_사용자이름`
3. 이를 통해 각 미니홈피 주인별로 독립적인 방문자 통계를 유지합니다.

## 사용 방법

### 기본 사용법

미니홈피 페이지가 로드될 때 방문자 카운터가 자동으로 업데이트됩니다:

```javascript
document.addEventListener("DOMContentLoaded", function () {
  // ...기타 초기화 코드...
  
  // 방문자 수 업데이트
  updateVisitorCount();
  
  // ...기타 초기화 코드...
});
```

### 사용자별 미니홈피 방문

특정 사용자의 미니홈피를 방문하려면 URL 매개변수를 통해 사용자 ID를 전달합니다:

```
mini.html?id=사용자이름
```

예를 들어, 'siyeon'의 미니홈피를 방문하는 경우:

```
mini.html?id=siyeon
```

## 문제 해결 및 향후 개선 사항

### 알려진 문제점

- localStorage는 브라우저별로 독립적으로 동작하기 때문에, 동일한 사용자가 다른 브라우저로 접속할 경우 방문자 수가 중복으로 카운트됩니다.
- 개인 정보 보호 모드에서는 localStorage가 제한될 수 있어 카운터가 정상 작동하지 않을 수 있습니다.

### 향후 개선 사항

- 서버 기반 방문자 카운터 시스템으로 전환하여 브라우저 간 일관성 있는 데이터 관리
- IP 주소 기반 중복 방문 필터링으로 더 정확한 방문자 통계 제공
- 일별/월별 방문 통계 차트 추가
- 로그인한 사용자의 방문 내역 관리 기능 추가 