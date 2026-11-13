import { useEffect, useRef, useState } from "react";
import Calendar from "./components/Calendar.jsx";
import TimeSlots from "./components/TimeSlots.jsx";
import BottomBar from "./components/BottomBar.jsx";
import { fetchToday, fetchSlots } from "./api.js";
import { isDateSelectable } from "./data/date.js";

function sameDate(first, second) {
  return Boolean(
    first && second &&
    first.day === second.day &&
    first.month === second.month &&
    first.year === second.year
  );
}

function LoadingMessage({ children }) {
  return <p className="request-state" role="status" aria-live="polite">{children}</p>;
}

function ErrorMessage({ message, onRetry }) {
  return (
    <div className="request-error" role="alert">
      <p>Не удалось загрузить данные: {message}</p>
      {onRetry && <button type="button" className="retry-button" onClick={onRetry}>Повторить</button>}
    </div>
  );
}

export default function BookingScreen() {
  // Состояния запроса «сегодня».
  const [today, setToday] = useState(null);
  const [loadingToday, setLoadingToday] = useState(true);
  const [errorToday, setErrorToday] = useState(null);
  const [todayAttempt, setTodayAttempt] = useState(0);

  // Состояние календаря и выбора пользователя.
  const [currentMonth, setCurrentMonth] = useState(null);
  const [currentYear, setCurrentYear] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  // Состояния запроса слотов.
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [errorSlots, setErrorSlots] = useState(null);
  const [slotsAttempt, setSlotsAttempt] = useState(0);
  const requestSequence = useRef(0);

  // При открытии страницы один раз запрашиваем дату, которую считает сегодняшней сервер.
  useEffect(() => {
    let active = true;

    async function loadToday() {
      setLoadingToday(true);
      setErrorToday(null);
      try {
        const data = await fetchToday();
        if (!active) return;
        if (
          !Number.isInteger(data.day) || !Number.isInteger(data.month) ||
          !Number.isInteger(data.year) || data.month < 0 || data.month > 11 ||
          data.day < 1 || data.day > new Date(data.year, data.month + 1, 0).getDate()
        ) {
          throw new Error("Сервер вернул некорректную дату.");
        }
        setToday(data);
        setCurrentMonth(data.month);
        setCurrentYear(data.year);
        setSelectedDate({ day: data.day, month: data.month, year: data.year });
      } catch (error) {
        if (active) setErrorToday(error.message || "Неизвестная ошибка");
      } finally {
        if (active) setLoadingToday(false);
      }
    }

    loadToday();
    return () => { active = false; };
  }, [todayAttempt]);

  // Запрашиваем слоты при первом получении today и при каждой смене выбранной даты.
  // cleanup + sequence защищают от устаревших ответов при быстрых кликах.
  useEffect(() => {
    if (!selectedDate) return undefined;

    let active = true;
    const sequence = ++requestSequence.current;

    async function loadSlots() {
      setLoadingSlots(true);
      setErrorSlots(null);
      setSlots([]);
      setSelectedTime(null);

      try {
        const result = await fetchSlots(selectedDate);
        const isLatest = sequence === requestSequence.current;
        if (!active || !isLatest) return;

        // Сервер возвращает дату вместе со слотами. Не принимаем ответ,
        // если он относится не к текущей выбранной дате.
        if (!sameDate(result.date, selectedDate)) {
          throw new Error("Сервер вернул слоты для другой даты.");
        }
        if (!Array.isArray(result.slots) || result.slots.some((slot) =>
          !slot || typeof slot.time !== "string" || typeof slot.available !== "boolean"
        )) {
          throw new Error("Сервер вернул некорректные слоты.");
        }
        setSlots(result.slots);
      } catch (error) {
        if (active && sequence === requestSequence.current) {
          setErrorSlots(error.message || "Неизвестная ошибка");
        }
      } finally {
        if (active && sequence === requestSequence.current) setLoadingSlots(false);
      }
    }

    loadSlots();
    return () => { active = false; };
  }, [selectedDate, slotsAttempt]);

  function handleDayClick(day) {
    if (!today || !isDateSelectable(day, currentMonth, currentYear, new Date(today.year, today.month, today.day))) return;
    const nextDate = { day, month: currentMonth, year: currentYear };
    if (sameDate(nextDate, selectedDate)) return;
    setSelectedTime(null);
    setSelectedDate(nextDate);
  }

  function changeMonth(direction) {
    if (currentMonth === null || currentYear === null || !today) return;

    const next = new Date(currentYear, currentMonth + direction, 1);
    const nextMonth = next.getMonth();
    const nextYear = next.getFullYear();
    setCurrentMonth(nextMonth);
    setCurrentYear(nextYear);

    // При переходе на другой месяц выбираем ближайший допустимый день,
    // чтобы поведение календаря оставалось удобным.
    const daysInMonth = new Date(nextYear, nextMonth + 1, 0).getDate();
    const todayDate = new Date(today.year, today.month, today.day);
    let day = Math.min(selectedDate?.day ?? today.day, daysInMonth);
    while (day <= daysInMonth && !isDateSelectable(day, nextMonth, nextYear, todayDate)) day += 1;

    if (day > daysInMonth) {
      setSelectedDate(null);
      setSelectedTime(null);
      setSlots([]);
      setLoadingSlots(false);
      setErrorSlots(null);
      return;
    }
    setSelectedDate({ day, month: nextMonth, year: nextYear });
  }

  function handleTimeClick(time) {
    const slot = slots.find((item) => item.time === time);
    if (slot?.available && !loadingSlots) setSelectedTime(time);
  }

  function handleNext() {
    if (!selectedDate || !selectedTime) {
      window.alert("Сначала выберите дату и доступное время.");
      return;
    }
    const date = new Date(selectedDate.year, selectedDate.month, selectedDate.day);
    const formatted = new Intl.DateTimeFormat("ru-RU", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    }).format(date);
    window.alert(`Вы выбрали запись на ${formatted} в ${selectedTime}`);
  }

  if (loadingToday) {
    return <section className="booking" aria-label="Выбор даты и времени"><LoadingMessage>Загрузка…</LoadingMessage></section>;
  }

  if (errorToday) {
    return (
      <section className="booking" aria-label="Выбор даты и времени">
        <ErrorMessage message={errorToday} onRetry={() => setTodayAttempt((value) => value + 1)} />
      </section>
    );
  }

  const todayDate = new Date(today.year, today.month, today.day);
  const visibleSelectedDay = selectedDate && selectedDate.month === currentMonth && selectedDate.year === currentYear
    ? selectedDate.day : null;

  return (
    <section className="booking" aria-label="Выбор даты и времени">
      <Calendar
        year={currentYear}
        month={currentMonth}
        selectedDay={visibleSelectedDay}
        today={todayDate}
        onDayClick={handleDayClick}
        onPrevMonth={() => changeMonth(-1)}
        onNextMonth={() => changeMonth(1)}
      />

      <section className="slots" aria-label="Доступное время">
        <h2 className="slots__title">Доступное время</h2>
        {loadingSlots ? (
          <LoadingMessage>Загрузка слотов…</LoadingMessage>
        ) : errorSlots ? (
          <ErrorMessage message={errorSlots} onRetry={() => setSlotsAttempt((value) => value + 1)} />
        ) : (
          <TimeSlots slots={slots} selectedTime={selectedTime} onTimeClick={handleTimeClick} />
        )}
      </section>

      <BottomBar
        day={selectedDate?.day ?? null}
        month={selectedDate?.month ?? currentMonth}
        year={selectedDate?.year ?? currentYear}
        selectedTime={selectedTime}
        onNext={handleNext}
      />
    </section>
  );
}
