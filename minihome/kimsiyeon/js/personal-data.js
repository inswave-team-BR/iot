/**
 * 개인 정보 및 음악 정보를 담은 데이터 파일
 * 기존의 profile-data.js와 music-data.js를 하나로 통합
 */

const personalData = {
    // 프로필 정보
    profile: {
        homepageTitle: "김시연님의 미니홈피 입니다.",
        todayFeeling: "행복😊",
        statusMessage: "행복한 하루 되세요!",
        profileInfo: {
            name: "김시연",
            birthday: "1997년 8월 6일",
            email: "siyeon.kim@example.com"
        }
    },
    
    // 음악 정보
    songs: [
        {id: 'song1', title: 'IU - 밤편지', src: 'audio/IU - Through the Night (밤편지).mp3'},
        {id: 'song2', title: '태연 - 그대라는 시', src: 'audio/TAEYEON - All About You (그대라는 시).mp3'},
        {id: 'song3', title: '아이유 - 가을 아침', src: 'audio/IU - Autumn morning (가을 아침).mp3'}
    ]
}; 