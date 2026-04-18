let lashesData = [];

document.addEventListener("DOMContentLoaded", () => {
  loadLashesData();
  setupEventListeners();
});

async function loadLashesData() {
  try {
    const response = await fetch(
      "http://localhost/api/get-data.php?category_id=3",
    );
    const data = await response.json();

    if (Array.isArray(data)) {
      lashesData = data;
      renderCards(lashesData);
    } else {
      console.error("Server error or invalid data format:", data);
    }
  } catch (error) {
    console.error("Error loading data:", error);
    const container = document.getElementById("cardsContainer");
    if (container)
      container.innerHTML =
        "<p>Error loading data. Please check your connection.</p>";
  }
}

function setupEventListeners() {
  const searchInput = document.getElementById("searchInput");
  const sortSelect = document.getElementById("sortSelect");
  const serviceFilter = document.getElementById("serviceFilter");

  if (searchInput) searchInput.addEventListener("input", filterAndSort);
  if (sortSelect) sortSelect.addEventListener("change", filterAndSort);
  if (serviceFilter) serviceFilter.addEventListener("change", filterAndSort);
}

async function getBookedSlotsFromDB(masterId) {
  try {
    const response = await fetch(
      `http://localhost/api/get-booked-slots.php?master_id=${masterId}`,
    );
    const bookedData = await response.json();

    const booked = { today: [], tomorrow: [] };
    const todayStr = new Date().toISOString().split("T")[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    bookedData.forEach((slot) => {
      const timeShort = slot.appointment_time.substring(0, 5);
      if (slot.appointment_date === todayStr) {
        booked.today.push(timeShort);
      } else if (slot.appointment_date === tomorrowStr) {
        booked.tomorrow.push(timeShort);
      }
    });
    return booked;
  } catch (e) {
    console.error("Error: ", e);
    return { today: [], tomorrow: [] };
  }
}

function getAvailableSlotsWithBooked(master, bookedSlots) {
  const start = parseInt(master.workHoursStart);
  const end = parseInt(master.workHoursEnd);
  const duration = parseInt(master.duration) || 60;

  return {
    today: generateTimeSlots(start, end, duration, bookedSlots.today, true),
    tomorrow: generateTimeSlots(
      start,
      end,
      duration,
      bookedSlots.tomorrow,
      false,
    ),
  };
}

function generateTimeSlots(
  startHour,
  endHour,
  durationMinutes,
  bookedSlots = [],
  isToday = false,
) {
  const slots = [];
  const now = new Date();

  let currentTime = new Date();
  currentTime.setHours(startHour, 0, 0, 0);

  const endTime = new Date();
  endTime.setHours(endHour, 0, 0, 0);

  while (currentTime < endTime) {
    const timeString = formatTime(currentTime);
    const isPast = isToday && currentTime.getTime() < now.getTime();
    const isBooked = bookedSlots.includes(timeString);

    if (!isPast) {
      slots.push({
        time: timeString,
        isBooked: isBooked,
      });
    }
    currentTime.setMinutes(currentTime.getMinutes() + durationMinutes);
  }
  return slots;
}

function formatTime(date) {
  return (
    date.getHours().toString().padStart(2, "0") +
    ":" +
    date.getMinutes().toString().padStart(2, "0")
  );
}

function filterAndSort() {
  const searchValue = document
    .getElementById("searchInput")
    .value.toLowerCase();
  const sortValue = document.getElementById("sortSelect").value;
  const serviceValue = document.getElementById("serviceFilter").value;

  let filtered = lashesData.filter((master) => {
    const matchesSearch = master.name.toLowerCase().includes(searchValue);
    const matchesService = !serviceValue || master.serviceType === serviceValue;
    return matchesSearch && matchesService;
  });

  filtered.sort((a, b) => {
    if (sortValue === "price-asc") return a.cost - b.cost;
    if (sortValue === "price-desc") return b.cost - a.cost;
    if (sortValue === "rating") return b.rating - a.rating;
    if (sortValue === "name") return a.name.localeCompare(b.name, "uk");
    if (sortValue === "duration") return a.duration - b.duration;
    return 0;
  });

  renderCards(filtered);
}

async function renderCards(data) {
  const container = document.getElementById("cardsContainer");
  const noResults = document.getElementById("noResults");

  if (!container) return;
  container.innerHTML = "";

  if (data.length === 0) {
    if (noResults) noResults.style.display = "block";
    return;
  }
  if (noResults) noResults.style.display = "none";

  for (const master of data) {
    const bookedSlots = await getBookedSlotsFromDB(master.id);
    const slots = getAvailableSlotsWithBooked(master, bookedSlots);
    const card = createCard(master, slots);
    container.appendChild(card);
  }
}

function createCard(master, slots) {
  const card = document.createElement("div");
  card.className = "card";

  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const renderSlots = (daySlots, dateStr) => {
    if (daySlots.length === 0)
      return '<span style="color: #ccc;">No slots</span>';

    return daySlots
      .map(
        (slot) => `
            <div class="slot ${slot.isBooked ? "booked" : ""}" 
                 data-time="${slot.time}" 
                 data-date="${dateStr}"
                 style="${slot.isBooked ? "pointer-events: none; opacity: 0.5;" : "cursor: pointer;"}">
                ${slot.time}
            </div>
        `,
      )
      .join("");
  };

  card.innerHTML = `
        <img src="${master.image}" alt="${master.name}" class="card-image">
        <div class="card-content">
            <div class="card-header">
                <div>
                    <div class="card-title">${master.name}</div>
                    <div class="card-specialty">${master.specialty}</div>
                </div>
                <div class="card-rating">⭐ ${master.rating}</div>
            </div>
            <p class="card-description">${master.description}</p>
            <div class="card-info">
                <div class="info-item"><span>Hours:</span> <b>${master.workHoursStart}:00-${master.workHoursEnd}:00</b></div>
                <div class="info-item"><span>Duration:</span> <b>${master.duration} min</b></div>
                <div class="info-item"><span>Price:</span> <b>${master.cost} ₴</b></div>
            </div>
            <div class="available-times">
                <div class="time-row">
                    <span>Today:</span>
                    <div class="slots-list">${renderSlots(slots.today, todayStr)}</div>
                </div>
                <div class="time-row">
                    <span>Tomorrow:</span>
                    <div class="slots-list">${renderSlots(slots.tomorrow, tomorrowStr)}</div>
                </div>
            </div>
        </div>
    `;

  card.querySelectorAll(".slot:not(.booked)").forEach((slotElement) => {
    slotElement.addEventListener("click", () => {
      const time = slotElement.getAttribute("data-time");
      const date = slotElement.getAttribute("data-date");

      if (
        confirm(
          `Make an appointment with master ${master.name} on ${date} at ${time}?`,
        )
      ) {
        bookMaster(master.id, master.service_id || master.id, date, time);
      }
    });
  });

  return card;
}

async function bookMaster(masterId, serviceId, date, time) {
  const userData = sessionStorage.getItem("beautybook_current_user");
  if (!userData) {
    alert("Please log in to book an appointment!");
    window.location.href = "/login/";
    return;
  }

  const user = JSON.parse(userData);
  const bookingData = {
    user_id: user.id,
    master_id: masterId,
    service_id: serviceId,
    date: date,
    time: time,
  };

  try {
    const response = await fetch("http://localhost/api/book-appointments.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingData),
    });

    const result = await response.json();
    if (result.message) {
      alert("Great! " + result.message);
      location.reload();
    } else {
      alert("Error: " + result.error);
    }
  } catch (e) {
    console.error("Booking error:", e);
  }
}
