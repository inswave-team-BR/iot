/**
 * 개인 정보 및 음악 정보를 담은 데이터 파일
 * 기존의 profile-data.js와 music-data.js를 하나로 통합
 */

const personalData = {
    // 프로필 정보
    profile: {
        homepageTitle: "황유석님의 미니홈피 입니다.",
        todayFeeling: "신남😎",
        statusMessage: "오늘도 코딩 중...",
        profileInfo: {
            name: "황유석",
            birthday: "1993년 8월 28일",
            email: "youjason@example.com"
        }
    },
    
    // 음악 정보
    songs: [
        {id: 'song1', title: '기리보이 - 호랑이소굴', src: 'audio/Giriboy - Tiger Den (호랑이소굴) (Feat. Jvcki Wai).mp3'},
        {id: 'song2', title: '고등래퍼 - 바라봐', src: 'audio/Chaboom, Webster B - Look At Me (바라봐).mp3'},
        {id: 'song3', title: '식케이 - 랄라', src: 'audio/Sik-K - RING RING (Feat. Gaeko, pH-1).mp3'}
    ]
}; 