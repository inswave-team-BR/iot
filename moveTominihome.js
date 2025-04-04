const host = document.getElementsByClassName("toMini");

for (let i = 0; i < host.length; i++) {
  host[i].addEventListener("click", function () {
    const idValue = this.querySelector("h4").id;
    window.location.href = `mini/mini.html?id=${idValue}`;
  });
}
/*
const team = ["siyeon", "jaewon", "jaeseong", "wooseok"];
for (let i = 0; i < team.length; i++) {
  const val = localStorage.getItem(`${team[i]}_guestbook`);
  if (!val) {
    localStorage.setItem(`${team[i]}_guestbook`, JSON.stringify([]));
  }
}
*/
