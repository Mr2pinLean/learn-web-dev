import { useState } from "react";
import Calendar from "./components/Calendar.jsx";
import TimeSlots from "./components/TimeSlots.jsx";
import BottomBar from "./components/BottomBar.jsx";
import { getSlotsForDate } from "./data/slots.js";
import { DAYS_OF_WEEK, MONTHS_GENITIVE, isDateSelectable } from "./data/date.js";

function getToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

export default function BookingScreen() {
  const [today] = useState(getToday);

  // Пять значений состояния, которые используются на странице.
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [selectedTime, setSelectedTime] = useState(() => {
    const initialSlots = getSlotsForDate(
      today.getDate(),
      today.getMonth(),
      today.getFullYear(),
      today
    );
    return initialSlots.find((slot) => slot.available)?.time ?? null;
  });
  const [slots, setSlots] = useState(() =>
    getSlotsForDate(
      today.getDate(),
      today.getMonth(),
      today.getFullYear(),
      today
    )
  );

  function handleDayClick(day) {
    if (!isDateSelectable(day, currentMonth, currentYear, today)) {
      return;
    }

    setSelectedDay(day);
    setSelectedTime(null);
    setSlots(getSlotsForDate(day, currentMonth, currentYear, today));
  }

  function changeMonth(direction) {
    const nextDate = new Date(currentYear, currentMonth + direction, 1);
    const nextMonth = nextDate.getMonth();
    const nextYear = nextDate.getFullYear();

    setCurrentMonth(nextMonth);
    setCurrentYear(nextYear);

    const daysInMonth = new Date(nextYear, nextMonth + 1, 0).getDate();
    let nextDay = Math.min(selectedDay ?? 1, daysInMonth);

    if (!isDateSelectable(nextDay, nextMonth, nextYear, today)) {
      nextDay = 1;
    }

    while (
      nextDay <= daysInMonth &&
      !isDateSelectable(nextDay, nextMonth, nextYear, today)
    ) {
      nextDay += 1;
    }

    if (nextDay > daysInMonth) {
      setSelectedDay(null);
      setSelectedTime(null);
      setSlots([]);
      return;
    }

    setSelectedDay(nextDay);
    setSelectedTime(null);
    setSlots(getSlotsForDate(nextDay, nextMonth, nextYear, today));
  }

  function handleTimeClick(time) {
    const clickedSlot = slots.find((slot) => slot.time === time);

    if (!clickedSlot || !clickedSlot.available) {
      return;
    }

    setSelectedTime(time);
  }

  function handleNext() {
    if (selectedDay === null || selectedTime === null) {
      window.alert("Сначала выберите дату и время.");
      return;
    }

    const selectedDate = new Date(
      currentYear,
      currentMonth,
      selectedDay
    );
    const weekday = DAYS_OF_WEEK[selectedDate.getDay()];
    const monthName = MONTHS_GENITIVE[currentMonth];

    window.alert(
      `Вы выбрали: ${weekday}, ${selectedDay} ${monthName} ${currentYear} • ${selectedTime}`
    );
  }

  return (
    <section className="booking" aria-label="Выбор даты и времени">
      <Calendar
        year={currentYear}
        month={currentMonth}
        selectedDay={selectedDay}
        today={today}
        onDayClick={handleDayClick}
        onPrevMonth={() => changeMonth(-1)}
        onNextMonth={() => changeMonth(1)}
      />

      <TimeSlots
        slots={slots}
        selectedTime={selectedTime}
        onTimeClick={handleTimeClick}
      />

      <BottomBar
        day={selectedDay}
        month={currentMonth}
        year={currentYear}
        selectedTime={selectedTime}
        onNext={handleNext}
      />
    </section>
  );
}
