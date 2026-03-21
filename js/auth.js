class AuthSystem {
  constructor() {
    this.users = [];
    this.currentUser = null;
    this.JSON_FILE = "users.json";
    this.loadUsers();
    this.initEventListeners();
  }

  async loadUsers() {
    try {
      const response = await fetch(this.JSON_FILE);
      if (response.ok) {
        const data = await response.json();
        this.users = data.users || [];
      } else {
        this.users = [
          {
            id: "1",
            name: "Test User",
            email: "test@example.com",
            phone: "+1 (555) 555-5555",
            password: this.hashPassword("password123"),
            createdAt: new Date().toISOString(),
            lastLogin: null,
          },
        ];
        await this.saveUsersToFile();
      }
    } catch (error) {
      this.users = [
        {
          id: "1",
          name: "Test User",
          email: "test@example.com",
          phone: "+1 (555) 555-5555",
          password: this.hashPassword("password123"),
          createdAt: new Date().toISOString(),
          lastLogin: null,
        },
      ];
    }
  }

  async saveUsersToFile() {
    try {
      localStorage.setItem(
        "beautybook_users_backup",
        JSON.stringify(this.users, null, 2),
      );

      const dataStr = JSON.stringify({ users: this.users }, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);

      return true;
    } catch (error) {
      return false;
    }
  }

  hashPassword(password) {
    return btoa(password);
  }

  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  validatePhone(phone) {
    if (!phone) return true;
    const re = /^(\+1)?[\s\-\(]?\d{3}[\)\s\-]?\d{3}[\s\-]?\d{4}$/;
    return re.test(phone.replace(/\s+/g, ""));
  }

  validatePassword(password) {
    return password.length >= 6;
  }

  getPasswordStrength(password) {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return Math.min(strength, 3);
  }

  async register(userData) {
    if (this.users.some((u) => u.email === userData.email)) {
      return {
        success: false,
        message: "A user with this email already exists",
      };
    }

    const newUser = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      phone: userData.phone || "",
      password: this.hashPassword(userData.password),
      createdAt: new Date().toISOString(),
      lastLogin: null,
    };

    this.users.push(newUser);

    const saved = await this.saveUsersToFile();

    if (saved) {
      return {
        success: true,
        message: "Registration successful!",
        user: newUser,
      };
    } else {
      return { success: false, message: "Error saving data" };
    }
  }

  login(email, password) {
    const user = this.users.find((u) => u.email === email);

    if (!user) {
      return { success: false, message: "User not found" };
    }

    if (user.password !== this.hashPassword(password)) {
      return { success: false, message: "Invalid password" };
    }

    user.lastLogin = new Date().toISOString();
    this.saveUsersToFile();

    this.currentUser = user;
    sessionStorage.setItem(
      "beautybook_current_user",
      JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      }),
    );

    return { success: true, message: "Login successful!", user };
  }

  logout() {
    this.currentUser = null;
    sessionStorage.removeItem("beautybook_current_user");
  }

  isAuthenticated() {
    return !!sessionStorage.getItem("beautybook_current_user");
  }

  getCurrentUser() {
    const userStr = sessionStorage.getItem("beautybook_current_user");
    return userStr ? JSON.parse(userStr) : null;
  }

  initEventListeners() {
    if (document.getElementById("registerForm")) {
      this.initRegisterForm();
    }
    if (document.getElementById("loginForm")) {
      this.initLoginForm();
    }
  }

  initRegisterForm() {
    const form = document.getElementById("registerForm");
    if (!form) return;

    const passwordInput = document.getElementById("password");
    const strengthBar = document.getElementById("strengthBar");
    const registerBtn = document.getElementById("registerBtn");
    const loader = registerBtn?.querySelector(".loader");
    const btnText = registerBtn?.querySelector("span");

    const inputs = form.querySelectorAll("input");
    inputs.forEach((input) => {
      input.addEventListener("input", () => this.validateField(input));
      input.addEventListener("blur", () => this.validateField(input, true));
    });

    if (passwordInput) {
      passwordInput.addEventListener("input", () => {
        const strength = this.getPasswordStrength(passwordInput.value);

        if (strengthBar) {
          strengthBar.className = "strength-bar";
          if (strength === 1) strengthBar.classList.add("weak");
          else if (strength === 2) strengthBar.classList.add("medium");
          else if (strength >= 3) strengthBar.classList.add("strong");
        }

        this.validateField(passwordInput);
      });
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      let isValid = true;
      const fields = ["name", "email", "phone", "password", "confirmPassword"];
      fields.forEach((fieldId) => {
        const field = document.getElementById(fieldId);
        if (!this.validateField(field, true)) {
          isValid = false;
        }
      });

      const agreement = document.getElementById("agreement");
      const agreementError = document.getElementById("agreementError");
      if (agreement && !agreement.checked) {
        isValid = false;
        if (agreementError) {
          agreementError.textContent = "You must accept the terms of use";
          agreementError.classList.add("visible");
        }
      } else if (agreementError) {
        agreementError.classList.remove("visible");
      }

      if (!isValid) return;

      if (registerBtn) {
        registerBtn.disabled = true;
        if (loader) loader.classList.remove("hidden");
        if (btnText) btnText.textContent = "Registering...";
      }

      const userData = {
        name: document.getElementById("name")?.value.trim() || "",
        email: document.getElementById("email")?.value.trim() || "",
        phone: document.getElementById("phone")?.value.trim() || "",
        password: document.getElementById("password")?.value || "",
      };

      setTimeout(async () => {
        const result = await this.register(userData);

        if (result.success) {
          this.showNotification(
            "Registration successful! Redirecting...",
            "success",
          );
          setTimeout(() => {
            window.location.href = "/login/";
          }, 2000);
        } else {
          this.showNotification(result.message, "error");
          if (registerBtn) {
            registerBtn.disabled = false;
            if (loader) loader.classList.add("hidden");
            if (btnText) btnText.textContent = "Register";
          }
        }
      }, 1000);
    });
  }

  validateField(field, showError = false) {
    if (!field) return true;

    const errorElement = document.getElementById(`${field.id}Error`);
    if (!errorElement) return true;

    let isValid = true;
    let errorMessage = "";

    switch (field.id) {
      case "name":
        isValid = field.value.trim().length >= 2;
        errorMessage = "Name must have at least 2 characters";
        break;
      case "email":
        isValid = this.validateEmail(field.value);
        errorMessage = "Please enter a valid email";
        break;
      case "phone":
        isValid = this.validatePhone(field.value);
        errorMessage = "Please enter a valid phone number";
        break;
      case "password":
        isValid = this.validatePassword(field.value);
        errorMessage = "Password must be at least 6 characters";
        break;
      case "confirmPassword":
        const password = document.getElementById("password")?.value || "";
        isValid = field.value === password;
        errorMessage = "Passwords do not match";
        break;
    }

    field.classList.toggle("valid", isValid && field.value);
    field.classList.toggle("error", !isValid && field.value && showError);

    if (!isValid && field.value && showError) {
      errorElement.textContent = errorMessage;
      errorElement.classList.add("visible");
    } else {
      errorElement.classList.remove("visible");
    }

    return isValid;
  }

  initLoginForm() {
    const form = document.getElementById("loginForm");
    if (!form) return;

    const loginBtn = document.getElementById("loginBtn");
    const loader = loginBtn?.querySelector(".loader");
    const btnText = loginBtn?.querySelector("span");

    const inputs = form.querySelectorAll("input");
    inputs.forEach((input) => {
      input.addEventListener("blur", () => {
        const errorElement = document.getElementById(`${input.id}Error`);
        if (!input.value) {
          input.classList.add("error");
          if (errorElement) {
            errorElement.textContent = "This field is required";
            errorElement.classList.add("visible");
          }
        } else {
          input.classList.remove("error");
          if (errorElement) {
            errorElement.classList.remove("visible");
          }
        }
      });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const email = document.getElementById("email")?.value.trim() || "";
      const password = document.getElementById("password")?.value || "";
      const remember = document.getElementById("remember")?.checked || false;

      if (!email || !password) {
        this.showNotification("Please fill all fields", "error");
        return;
      }

      if (loginBtn) {
        loginBtn.disabled = true;
        if (loader) loader.classList.remove("hidden");
        if (btnText) btnText.textContent = "Signing in...";
      }

      setTimeout(() => {
        const result = this.login(email, password);

        if (result.success) {
          this.showNotification("Login successful!", "success");
          setTimeout(() => {
            window.location.href = "/";
          }, 1500);
        } else {
          this.showNotification(result.message, "error");
          if (loginBtn) {
            loginBtn.disabled = false;
            if (loader) loader.classList.add("hidden");
            if (btnText) btnText.textContent = "Sign In";
          }
        }
      }, 800);
    });
  }

  showNotification(message, type = "success") {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}

const auth = new AuthSystem();
window.auth = auth;
