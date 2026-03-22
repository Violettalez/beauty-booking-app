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
  const logoutLink = document.querySelector(".logout-link");
  if (logoutLink) {
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      sessionStorage.removeItem("beautybook_current_user");
      window.location.href = "/login/";
    });
  }
}
function openProfileMenu() {
  const loggedInDiv = document.getElementById("loggedIn");
  const profileMenu = document.querySelector(".profile.dropdown .submenu");
  loggedInDiv.addEventListener("click", (e) => {
    e.stopPropagation();
    if (window.innerWidth <= 968) {
      window.location.href = "/profile/";
      return;
    }
    profileMenu.classList.toggle("active");
  });

  document.addEventListener("click", (e) => {
    if (!profileMenu.contains(e.target) && !loggedInDiv.contains(e.target)) {
      profileMenu.classList.remove("active");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  checkUser();
  setupLogout();
  openProfileMenu();
});
