// ======================================================
// 1. ДАННЫЕ
// ======================================================

const MONTHS_NOMINATIVE = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
];

const MONTHS_GENITIVE = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря"
];

const DAYS_OF_WEEK = [
  "Воскресенье", "Понедельник", "Вторник", "Среда",
  "Четверг", "Пятница", "Суббота"
];

const BASE_SLOTS = [
  { time: "10:00", available: true },
  { time: "11:00", available: false },
  { time: "12:00", available: true },
  { time: "13:00", available: false },
  { time: "14:00", available: true },
  { time: "15:00", available: true },
  { time: "16:00", available: true },
  { time: "17:00", available: true }
];

const today = new Date();
today.setHours(0, 0, 0, 0);

// ======================================================
// 2. СОСТОЯНИЕ ПРИЛОЖЕНИЯ
// ======================================================

const state = {
  currentMonth: today.getMonth(),
  currentYear: today.getFullYear(),
  selectedDay: today.getDate(),
  selectedTime: null,
  slots: []
};

// ======================================================
// 3. ЧИСТЫЕ ФУНКЦИИ
// ======================================================

function compareDates(date1, date2) {
  const first = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const second = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());

  if (first.getTime() < second.getTime()) return -1;
  if (first.getTime() > second.getTime()) return 1;
  return 0;
}

function isDateSelectable(day, month, year, currentDate) {
  return compareDates(new Date(year, month, day), currentDate) >= 0;
}

// Строит календарную сетку с понедельника по воскресенье.
// Пустые ячейки соседних месяцев имеют day: null.
function buildCalendarGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const mondayOffset = (firstDay.getDay() + 6) % 7;

  const cells = [];
  for (let i = 0; i < mondayOffset; i++) {
    cells.push({ day: null });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ day });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ day: null });
  }

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

function getSlotsForDate(day, month, year) {
  const selectedDate = new Date(year, month, day);
  const now = new Date();

  return BASE_SLOTS.map((slot) => {
    let available = slot.available;

    // Для сегодняшнего дня прошедшее время недоступно.
    if (compareDates(selectedDate, today) === 0) {
      const [hours, minutes] = slot.time.split(":").map(Number);
      const slotDate = new Date(year, month, day, hours, minutes);
      if (slotDate <= now) available = false;
    }

    return { ...slot, available };
  });
}

function formatSelectedDate() {
  const date = new Date(
    state.currentYear,
    state.currentMonth,
    state.selectedDay
  );
  const weekday = DAYS_OF_WEEK[date.getDay()];
  return `${weekday}, ${state.selectedDay} ${MONTHS_GENITIVE[state.currentMonth]} ${state.currentYear} • ${state.selectedTime || "время не выбрано"}`;
}

// ======================================================
// 4. ЭЛЕМЕНТЫ СТРАНИЦЫ
// ======================================================

const calendarTitle = document.querySelector("#calendar-title");
const calendarDays = document.querySelector("#calendar-days");
const slotsList = document.querySelector("#slots-list");
const summary = document.querySelector("#booking-summary");
const previousMonthButton = document.querySelector("#prev-month");
const nextMonthButton = document.querySelector("#next-month");
const nextButton = document.querySelector("#next-button");

// ======================================================
// 5. РЕНДЕР КАЛЕНДАРЯ
// ======================================================

function renderCalendar() {
  calendarTitle.textContent =
    `${MONTHS_NOMINATIVE[state.currentMonth]} ${state.currentYear}`;

  const weeks = buildCalendarGrid(state.currentYear, state.currentMonth);
  calendarDays.innerHTML = weeks.flat().map((cell) => {
    if (cell.day === null) {
      return '<li><button class="day-cell outside" type="button" disabled aria-hidden="true"></button></li>';
    }

    const selectable = isDateSelectable(
      cell.day, state.currentMonth, state.currentYear, today
    );
    const selected = cell.day === state.selectedDay;
    const classes = [
      "day-cell",
      selected ? "selected" : "",
      selectable ? "" : "disabled"
    ].filter(Boolean).join(" ");

    return `
      <li>
        <button
          class="${classes}"
          type="button"
          data-date="${cell.day}"
          ${selectable ? "" : "disabled"}
          aria-pressed="${selected}"
          aria-label="${cell.day} ${MONTHS_GENITIVE[state.currentMonth]}"
        >${cell.day}</button>
      </li>
    `;
  }).join("");

  // После перерисовки календаря назначаем обработчики новым кнопкам.
  calendarDays.querySelectorAll(".day-cell[data-date]").forEach((button) => {
    button.addEventListener("click", onDayClick);
  });
}

// ======================================================
// 6. РЕНДЕР ВРЕМЕНИ
// ======================================================

function renderTimeSlots() {
  state.slots = getSlotsForDate(
    state.selectedDay,
    state.currentMonth,
    state.currentYear
  );

  // Если выбранное время недоступно для нового дня, сбрасываем его.
  const selectedSlotIsAvailable = state.slots.some(
    (slot) => slot.time === state.selectedTime && slot.available
  );

  if (!selectedSlotIsAvailable) {
    const firstAvailable = state.slots.find((slot) => slot.available);
    state.selectedTime = firstAvailable ? firstAvailable.time : null;
  }

  slotsList.innerHTML = state.slots.map((slot) => {
    const selected = slot.time === state.selectedTime && slot.available;

    return `
      <li>
        <button
          class="slot ${slot.available ? "" : "busy"} ${selected ? "selected" : ""}"
          type="button"
          data-time="${slot.time}"
          ${slot.available ? "" : "disabled"}
          aria-pressed="${selected}"
        >
          <span>${slot.time}</span>
          ${slot.available ? "" : '<span class="slot__note">Занято</span>'}
        </button>
      </li>
    `;
  }).join("");

  slotsList.querySelectorAll(".slot[data-time]").forEach((button) => {
    button.addEventListener("click", onTimeSlotClick);
  });

  updateBottomBar();
}

// ======================================================
// 7. НИЖНЯЯ ПАНЕЛЬ
// ======================================================

function updateBottomBar() {
  summary.textContent = formatSelectedDate();
}

// ======================================================
// 8. ОБРАБОТЧИКИ СОБЫТИЙ
// ======================================================

function onDayClick(event) {
  const day = Number(event.currentTarget.dataset.date);

  if (!isDateSelectable(day, state.currentMonth, state.currentYear, today)) {
    return;
  }

  state.selectedDay = day;
  state.selectedTime = null;

  renderCalendar();
  renderTimeSlots();
}

function onTimeSlotClick(event) {
  const time = event.currentTarget.dataset.time;
  const slot = state.slots.find((item) => item.time === time);

  if (!slot || !slot.available) return;

  state.selectedTime = time;

  // Обновляем выделение слота и нижнюю панель.
  slotsList.querySelectorAll(".slot[data-time]").forEach((button) => {
    const selected = button.dataset.time === time;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });

  updateBottomBar();
}

function changeMonth(direction) {
  const newDate = new Date(
    state.currentYear,
    state.currentMonth + direction,
    1
  );

  state.currentMonth = newDate.getMonth();
  state.currentYear = newDate.getFullYear();

  // Если выбранный день существует в новом месяце и не прошёл,
  // оставляем его. Иначе выбираем ближайший доступный день.
  const daysInMonth = new Date(
    state.currentYear, state.currentMonth + 1, 0
  ).getDate();

  let candidateDay = Math.min(state.selectedDay || 1, daysInMonth);

  if (!isDateSelectable(
    candidateDay, state.currentMonth, state.currentYear, today
  )) {
    candidateDay = 1;
  }

  while (
    candidateDay <= daysInMonth &&
    !isDateSelectable(candidateDay, state.currentMonth, state.currentYear, today)
  ) {
    candidateDay++;
  }

  state.selectedDay = candidateDay <= daysInMonth ? candidateDay : null;
  state.selectedTime = null;

  renderCalendar();

  if (state.selectedDay !== null) {
    renderTimeSlots();
  } else {
    slotsList.innerHTML = "<li>В этом месяце нет доступных дат.</li>";
    summary.textContent = "Нет доступной даты";
  }
}

function setupMonthNavigation() {
  previousMonthButton.addEventListener("click", () => changeMonth(-1));
  nextMonthButton.addEventListener("click", () => changeMonth(1));
}

function setupNextButton() {
  nextButton.addEventListener("click", () => {
    if (!state.selectedDay || !state.selectedTime) {
      alert("Сначала выберите дату и время.");
      return;
    }

    alert(`Вы выбрали: ${formatSelectedDate()}`);
  });
}

// ======================================================
// 9. ИНИЦИАЛИЗАЦИЯ
// ======================================================

function init() {
  // На старте выбираем сегодня и первый доступный слот.
  state.slots = getSlotsForDate(
    state.selectedDay,
    state.currentMonth,
    state.currentYear
  );

  const firstAvailable = state.slots.find((slot) => slot.available);
  state.selectedTime = firstAvailable ? firstAvailable.time : null;

  setupMonthNavigation();
  setupNextButton();
  renderCalendar();
  renderTimeSlots();
}

document.addEventListener("DOMContentLoaded", init);
