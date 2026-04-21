
const {
  validateEmail,
  validatePhone,
  validatePassword,
  getPasswordStrength,
  generateTimeSlots,
  formatTime,
} = require("./test-file.js");

test("Перевірка коректного Email при оновленні даних на сторінці профілю", () => {
  expect(validateEmail("test@gmail.com")).toBe(true);
  expect(validateEmail("invalid-email")).toBe(false);
});

test("Валідація номеру телефону при оновленні даних на сторінці профілю", () => {
  expect(validatePhone("")).toBe(true);
  expect(validatePhone("+380991234567")).toBe(true);
  expect(validatePhone("12345")).toBe(false);
});

test("Перевірка коректності пароля при реєстрації", () => {
  expect(validatePassword("123456789")).toBe(true);
  expect(validatePassword("123456")).toBe(true);
  expect(validatePassword("123")).toBe(false);
});
describe("Тестування функції getPasswordStrength", () => {
  test("Повертає 0 для порожнього рядка або відсутності пароля", () => {
    expect(getPasswordStrength("")).toBe(0);
    expect(getPasswordStrength(null)).toBe(0);
  });

  test("Повертає 1 для короткого або простого пароля (низька складність)", () => {
    // Тільки довжина < 6
    expect(getPasswordStrength("12345")).toBe(1);
    expect(getPasswordStrength("qwert")).toBe(1);
  });

  test("Повертає 2 для паролів середньої складності", () => {
    // Довжина 6 + велика літера
    expect(getPasswordStrength("Qwerty")).toBe(2);
    // Довжина 6 + цифра
    expect(getPasswordStrength("12345a")).toBe(2);
  });

  test("Повертає 3 для надійних паролів (висока складність)", () => {
    // Довжина 8 + велика літера + цифра
    expect(getPasswordStrength("SafePass123")).toBe(3);
    // Довжина 6 + спецсимвол + велика літера + цифра
    expect(getPasswordStrength("A1!abc")).toBe(3);
  });

  test("Не повертає більше 3, навіть якщо виконані всі умови", () => {
    // Довжина > 8, велика літера, цифра, спецсимвол  5 балів, але Math.min обріже до 3)
    expect(getPasswordStrength("VeryComplexPassword123!!!")).toBe(3);
  });
});

test("Генерація часових слотів для запису на послугу", () => {
  const bookedSlots = ["10:00", "11:30"];
  const slots = generateTimeSlots(9, 17, 30, bookedSlots, false);
  expect(slots).toEqual([
    { time: "09:00", isBooked: false },
    { time: "09:30", isBooked: false },
    { time: "10:00", isBooked: true },
    { time: "10:30", isBooked: false },
    { time: "11:00", isBooked: false },
    { time: "11:30", isBooked: true },
    { time: "12:00", isBooked: false },
    { time: "12:30", isBooked: false },
    { time: "13:00", isBooked: false },
    { time: "13:30", isBooked: false },
    { time: "14:00", isBooked: false },
    { time: "14:30", isBooked: false },
    { time: "15:00", isBooked: false },
    { time: "15:30", isBooked: false },
    { time: "16:00", isBooked: false },
    { time: "16:30", isBooked: false },
  ]);
});

test("Форматування часу у форматі HH:MM", () => {
  const date = new Date();
  date.setHours(9, 5);
  expect(formatTime(date)).toBe("09:05");
  date.setHours(14, 30);
  expect(formatTime(date)).toBe("14:30");
  date.setHours(23, 59);
  expect(formatTime(date)).toBe("23:59");
  date.setHours(0, 0);
  expect(formatTime(date)).toBe("00:00");
});
