// 회원가입 처리
const signupForm = document.getElementById("signup-form");
if (signupForm) {
  signupForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const id = document.getElementById("signup-id").value;
    const password = document.getElementById("signup-password").value;

    let users = JSON.parse(localStorage.getItem("users")) || [];

    // 이미 존재하는 아이디인지 체크
    const existingUser = users.find(user => user.id === id);
    if (existingUser) {
      alert("이미 존재하는 아이디입니다.");
      return;
    }

    // 새 사용자 추가
    users.push({ name, id, password });
    localStorage.setItem("users", JSON.stringify(users));
    alert("회원가입 완료! 로그인 해주세요.");
    window.location.href = "login.html";
  });
}

// 로그인 처리
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const id = document.getElementById("login-id").value;
    const password = document.getElementById("login-password").value;

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const matchedUser = users.find(user => user.id === id && user.password === password);

    if (matchedUser) {
      localStorage.setItem("user", JSON.stringify(matchedUser)); // 로그인 상태 저장
      alert("로그인 성공!");
      window.location.href = "home.html";
    } else {
      alert("아이디 또는 비밀번호가 잘못되었습니다.");
    }
  });
}
