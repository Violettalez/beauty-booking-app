document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const messageInput = document.getElementById("message");

  const nameError = document.getElementById("nameError");
  const emailError = document.getElementById("emailError");
  const phoneError = document.getElementById("phoneError");
  const messageError = document.getElementById("messageError");
  const contactSuccess = document.getElementById("contactSuccess");

  let user = JSON.parse(sessionStorage.getItem("beautybook_current_user"));
  if (user) {
    nameInput.value = user.name || "";
    emailInput.value = user.email || "";
    phoneInput.value = user.phone || "";
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validatePhone(phone) {
    if (!phone) return true;
    return /^(\+38\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(phone);
  }

  function clearErrors() {
    [nameError, emailError, phoneError, messageError].forEach((el) => {
      if (el) el.textContent = "";
    });
    if (contactSuccess) contactSuccess.textContent = "";
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    clearErrors();

    let valid = true;

    if (!nameInput.value.trim()) {
      nameError.textContent = "Please enter your name.";
      nameError.style.display = "block";
      valid = false;
    }

    if (!emailInput.value.trim() || !validateEmail(emailInput.value.trim())) {
      emailError.textContent = "Please enter a valid email address.";
      emailError.style.display = "block";
      valid = false;
    }

    if (phoneInput.value && !validatePhone(phoneInput.value.trim())) {
      phoneError.textContent = "Please enter a valid phone number.";
      phoneError.style.display = "block";
      valid = false;
    }

    if (!messageInput.value.trim()) {
      messageError.textContent = "Please enter a message.";
      messageError.style.display = "block";
      valid = false;
    }

    if (!valid) return;

    let now = new Date();
    let hours = now.getHours().toString().padStart(2, "0");
    let minutes = now.getMinutes().toString().padStart(2, "0");
    let time = `${hours}:${minutes}`;

    emailjs.send("service_4mt4wq9", "template_vg8tr0y", {
      name: nameInput.value.trim(),
      time: time,
      message: messageInput.value.trim(),
      phone: phoneInput.value.trim() || null,
      email: emailInput.value.trim(),
    });
    alert("Message sent — thank you!");
    if (contactSuccess)
      contactSuccess.textContent = "Message sent — thank you!";
    messageInput.value = "";
  });
});
