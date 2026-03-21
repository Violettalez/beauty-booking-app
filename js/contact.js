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

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validateUSPhone(phone) {
    if (!phone) return true;
    // Accept formats like +1 (555) 555-5555 or 555-555-5555
    return /^(\+1\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(phone);
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

    if (phoneInput.value && !validateUSPhone(phoneInput.value.trim())) {
      phoneError.textContent = "Please enter a valid US phone number.";
      phoneError.style.display = "block";
      valid = false;
    }

    if (!messageInput.value.trim()) {
      messageError.textContent = "Please enter a message.";
      messageError.style.display = "block";
      valid = false;
    }

    if (!valid) return;

    alert("Message sent — thank you!");
    if (contactSuccess)
      contactSuccess.textContent = "Message sent — thank you!";
    form.reset();
  });
});
