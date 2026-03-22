function checkUser() {
  const user = sessionStorage.getItem("beautybook_current_user");

  const loggedInDiv = document.getElementById("loggedIn");
  const notLoggedInDiv = document.getElementById("notLoggedIn");

  if (user && user !== "null" && user !== "") {
    try {
      const parsedUser = JSON.parse(user);

      if (parsedUser && Object.keys(parsedUser).length > 0) {
        loggedInDiv.style.display = "block";
        notLoggedInDiv.style.display = "none";
        return;
      }
    } catch (e) {
      console.error("Ошибка парсинга user:", e);
    }
  }

  loggedInDiv.style.display = "none";
  notLoggedInDiv.style.display = "block";
}

function setupLogout() {
  const loggedInDiv = document.getElementById("loggedIn");
  loggedInDiv.addEventListener("click", () => {
    sessionStorage.removeItem("beautybook_current_user");
    window.location.href = "/login/";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  checkUser();
  setupLogout();
});
