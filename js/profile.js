document.addEventListener("DOMContentLoaded", () => {
  const nameInput = document.getElementById("p-name");
  const emailInput = document.getElementById("p-email");
  const phoneInput = document.getElementById("p-phone");

  const saveBtn = document.getElementById("saveProfile");
  const logoutBtn = document.getElementById("logoutBtn");

  const sideName = document.getElementById("sideName");
  const sideEmail = document.getElementById("sideEmail");
  const sidePhone = document.getElementById("sidePhone");
  let user = JSON.parse(sessionStorage.getItem("beautybook_current_user"));

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

  saveBtn.addEventListener("click", async () => {
    const updatedData = {
      id: user.id,
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      phone: phoneInput.value.trim(),
    };

    if (!updatedData.name || !updatedData.email) {
      alert("Enter at least name and email!");
      return;
    }

    try {
      const response = await fetch("http://localhost/api/update-user.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      const result = await response.json();

      if (result.success) {
        user = { ...user, ...updatedData };
        sessionStorage.setItem("beautybook_current_user", JSON.stringify(user));

        renderSide();
        alert("Data successfully saved to DB ✅");
      } else {
        alert("Error: " + result.message);
      }
    } catch (error) {
      console.error("Update error:", error);
      alert(
        "Error: Network error. Please check your connection to the server.",
      );
    }
  });

  logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem("beautybook_current_user");
    window.location.href = "/login/";
  });

  renderForm();
  renderSide();

  loadUserAppointments();

  async function loadUserAppointments() {
    const listContainer = document.getElementById("appointmentsList");
    const noAppMessage = document.getElementById("noAppointments");

    try {
      const response = await fetch(
        `http://localhost/api/get-user-appointments.php?user_id=${user.id}`,
      );
      const data = await response.json();
      if (data.length === 0) {
        noAppMessage.style.display = "block";
        listContainer.innerHTML = "";
        return;
      }

      noAppMessage.style.display = "none";

      listContainer.innerHTML = data
        .map(
          (app) => `
      <tr>
          <td data-label="Service"><b>${app.service_name}</b></td>
          <td data-label="Master">${app.master_name}</td>
          <td data-label="Date">${app.appointment_date}</td>
          <td data-label="Time">${app.appointment_time.substring(0, 5)}</td>
          <td data-label="Action">
              <button class="cancel-btn" data-id="${app.id}">Cancel</button>
          </td>
      </tr>
  `,
        )
        .join("");
    } catch (error) {
      console.error("Error loading appointments:", error);
    }
  }

  document.getElementById("appointmentsList").addEventListener("click", (e) => {
    if (e.target.classList.contains("cancel-btn")) {
      const id = e.target.getAttribute("data-id");
      cancelAppointment(id);
    }
  });

  window.cancelAppointment = async function (id) {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;

    try {
      const response = await fetch(
        "http://localhost/api/cancel-appointment.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ appointment_id: id }),
        },
      );

      const result = await response.json();
      if (result.success) {
        alert("Appointment cancelled!");
        loadUserAppointments(); 
      }
    } catch (error) {
      alert("Error cancelling appointment.");
    }
  };
});
