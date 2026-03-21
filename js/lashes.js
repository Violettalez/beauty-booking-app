let lashesData = [];

document.addEventListener("DOMContentLoaded", () => {
  loadLashesData();
  setupEventListeners();
});

async function loadLashesData() {
  try {
    const response = await fetch("../js/lashes.json");
    lashesData = await response.json();
    renderCards(lashesData);
  } catch (error) {
    console.error("Error loading data:", error);
  }
}

function setupEventListeners() {
  const searchInput = document.getElementById("searchInput");
  const sortSelect = document.getElementById("sortSelect");
  const serviceFilter = document.getElementById("serviceFilter");

  searchInput.addEventListener("input", filterAndSort);
  sortSelect.addEventListener("change", filterAndSort);
  serviceFilter.addEventListener("change", filterAndSort);
}

function getAvailableSlots(master) {
  const slots = {
    today: [],
    tomorrow: [],
  };

  const durationMinutes = master.duration;
  const { start, end } = master.workHours;

  const bookedSlots = generateBookedSlots(master.id);

  slots.today = generateTimeSlots(
    start,
    end,
    durationMinutes,
    bookedSlots.today,
  );

  slots.tomorrow = generateTimeSlots(
    start,
    end,
    durationMinutes,
    bookedSlots.tomorrow,
  );

  return slots;
}

function generateBookedSlots(masterId) {
  const bookedMap = {
    1: { today: ["09:00", "11:30", "14:00"], tomorrow: ["10:00"] },
    2: { today: ["10:00", "12:00", "16:00"], tomorrow: ["11:00", "15:00"] },
    3: { today: ["11:00", "15:00"], tomorrow: ["12:00", "16:00"] },
    4: { today: ["09:30", "13:00"], tomorrow: ["14:00"] },
    5: { today: ["12:00", "16:00"], tomorrow: ["13:00"] },
    6: { today: ["10:30", "14:00"], tomorrow: ["15:00"] },
  };

  return bookedMap[masterId] || { today: [], tomorrow: [] };
}

function generateTimeSlots(
  startHour,
  endHour,
  durationMinutes,
  bookedSlots = {},
) {
  const slots = [];
  let currentTime = new Date();
  currentTime.setHours(startHour, 0, 0, 0);

  const endTime = new Date();
  endTime.setHours(endHour, 0, 0, 0);

  while (currentTime < endTime) {
    const timeString = formatTime(currentTime);
    const isBooked = bookedSlots.includes && bookedSlots.includes(timeString);

    if (!isSlotOverlapping(currentTime, durationMinutes, bookedSlots)) {
      slots.push({
        time: timeString,
        isBooked: isBooked,
      });
    }

    currentTime.setMinutes(currentTime.getMinutes() + durationMinutes);
  }

  return slots.slice(0, 5);
}

function isSlotOverlapping(startTime, durationMinutes, bookedSlots) {
  if (!bookedSlots || bookedSlots.length === 0) return false;

  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + durationMinutes);

  return bookedSlots.some((bookedTimeStr) => {
    const [hours, minutes] = bookedTimeStr.split(":").map(Number);
    const bookedStart = new Date(startTime);
    bookedStart.setHours(hours, minutes, 0, 0);
    const bookedEnd = new Date(bookedStart);
    bookedEnd.setMinutes(bookedEnd.getMinutes() + 60);

    return startTime < bookedEnd && endTime > bookedStart;
  });
}

function formatTime(date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function filterAndSort() {
  const searchValue = document
    .getElementById("searchInput")
    .value.toLowerCase();
  const sortValue = document.getElementById("sortSelect").value;
  const serviceValue = document.getElementById("serviceFilter").value;

  let filtered = lashesData.filter((master) => {
    const matchesSearch =
      master.name.toLowerCase().includes(searchValue) ||
      master.specialty.toLowerCase().includes(searchValue) ||
      master.description.toLowerCase().includes(searchValue);
    const matchesService = !serviceValue || master.serviceType === serviceValue;

    return matchesSearch && matchesService;
  });

  filtered.sort((a, b) => {
    switch (sortValue) {
      case "name":
        return a.name.localeCompare(b.name, "uk");
      case "price-asc":
        return a.cost - b.cost;
      case "price-desc":
        return b.cost - a.cost;
      case "rating":
        return b.rating - a.rating;
      case "duration":
        return a.duration - b.duration;
      default:
        return 0;
    }
  });

  renderCards(filtered);
}

function renderCards(data) {
  const container = document.getElementById("cardsContainer");
  const noResults = document.getElementById("noResults");

  container.innerHTML = "";

  if (data.length === 0) {
    noResults.style.display = "block";
    return;
  }

  noResults.style.display = "none";

  data.forEach((master) => {
    const slots = getAvailableSlots(master);
    const card = createCard(master, slots);
    container.appendChild(card);
  });
}

function createCard(master, slots) {
  const card = document.createElement("div");
  card.className = "card";

  const todayDate = new Date();
  const tomorrowDate = new Date(todayDate);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);

  const formatDate = (date) => {
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else {
      return "Tomorrow";
    }
  };

  const slotsHTML = `
        <div class="available-times">
            <span class="time-label">📅 Available times</span>
            
            <div class="time-slots">
                <span class="time-slot-label">${formatDate(todayDate)}:</span>
                <div class="slots-list">
                    ${slots.today
                      .map(
                        (slot) => `
                        <div class="slot ${slot.isBooked ? "booked" : ""}" 
                             title="${slot.isBooked ? "Booked" : "Available"}">
                            ${slot.time}
                        </div>
                    `,
                      )
                      .join("")}
                </div>
            </div>

            <div class="time-slots">
                <span class="time-slot-label">${formatDate(tomorrowDate)}:</span>
                <div class="slots-list">
                    ${slots.tomorrow
                      .map(
                        (slot) => `
                        <div class="slot ${slot.isBooked ? "booked" : ""}"
                             title="${slot.isBooked ? "Booked" : "Available"}">
                            ${slot.time}
                        </div>
                    `,
                      )
                      .join("")}
                </div>
            </div>
        </div>
    `;

  card.innerHTML = `
        <img src="${master.image}" alt="${master.name}" class="card-image">
        <div class="card-content">
            <div class="card-header">
                <div>
                    <div class="card-title">${master.name}</div>
                    <div class="card-specialty">${master.specialty}</div>
                </div>
                <div class="card-rating">
                    <span class="star">★</span>
                    <span>${master.rating}</span>
                </div>
            </div>

            <p class="card-description">${master.description}</p>

            <div class="card-info">
                <div class="info-item">
                    <span class="info-label">Working hours</span>
                    <span class="info-value work-hours">
                        ${String(master.workHours.start).padStart(2, "0")}:00 - ${String(master.workHours.end).padStart(2, "0")}:00
                    </span>
                </div>
                <div class="info-item">
                    <span class="info-label">Duration</span>
                    <span class="info-value duration">${master.duration} min</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Price</span>
                    <span class="info-value price">${master.cost} ₴</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Rating</span>
                    <span class="info-value">⭐ ${master.rating}</span>
                </div>
            </div>

            ${slotsHTML}
        </div>
    `;

  card.querySelectorAll(".slot:not(.booked)").forEach((slot) => {
    slot.addEventListener("click", () => {
      alert(`Booking with ${master.name} at ${slot.textContent}`);
    });
  });

  return card;
}

function formatDuration(minutes) {
  if (minutes < 60) {
    return `${minutes} min`;
  } else if (minutes % 60 === 0) {
    return `${Math.floor(minutes / 60)} h`;
  } else {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} h ${mins} min`;
  }
}
