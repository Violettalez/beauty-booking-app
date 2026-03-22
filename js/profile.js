document.addEventListener("DOMContentLoaded", () => {
  const nameInput = document.getElementById("p-name");
  const emailInput = document.getElementById("p-email");
  const phoneInput = document.getElementById("p-phone");

  const saveBtn = document.getElementById("saveProfile");
  const logoutBtn = document.getElementById("logoutBtn");

  const sideName = document.getElementById("sideName");
  const sideEmail = document.getElementById("sideEmail");
  const sidePhone = document.getElementById("sidePhone");

  function getUser() {
    const raw = sessionStorage.getItem("beautybook_current_user");
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function setUser(user) {
    sessionStorage.setItem("beautybook_current_user", JSON.stringify(user));
  }

  let user = getUser();

  if (!user) {
    window.location.href = "/login/";
    return;
  }

  function renderForm() {
    nameInput.value = user.name || "";
    emailInput.value = user.email || "";
    phoneInput.value = user.phone || "";
  }

  function renderSide() {
    sideName.textContent = user.name || "";
    sideEmail.textContent = user.email || "";
    sidePhone.textContent = user.phone || "";
  }

  saveBtn.addEventListener("click", () => {
    const newName = nameInput.value.trim();
    const newEmail = emailInput.value.trim();
    const newPhone = phoneInput.value.trim();

    if (!newName || !newEmail) {
      alert("Fill name and email");
      return;
    }

    user.name = newName;
    user.email = newEmail;
    user.phone = newPhone;

    setUser(user);

    renderSide();

    alert("Saved ✅");
  });

  logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem("beautybook_current_user");
    window.location.href = "/login/";
  });

  renderForm();
  renderSide();
});
