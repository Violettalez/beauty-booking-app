//Profile

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePhone = (phone) => {
  if (!phone) return true;
  return /^(\+38\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(phone);
};

//Services

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

//Auth

function validatePassword(password) {
  return password.length >= 6;
}

function getPasswordStrength(password) {
  if (!password || password.length === 0) return 0;

  let strength = 0;

  if (password.length > 0 && password.length < 6) {
    strength += 1;
    return strength;
  }

  if (password.length >= 6) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[0-9]/.test(password)) strength += 1;
  if (/[^A-Za-z0-9]/.test(password)) strength += 1;

  return Math.min(strength, 3);
}

module.exports = {
  validateEmail,
  validatePhone,
  validatePassword,
  getPasswordStrength,
  generateTimeSlots,
  formatTime,
};
