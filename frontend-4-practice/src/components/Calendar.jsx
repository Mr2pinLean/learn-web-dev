import {
  buildCalendarGrid,
  isDateSelectable,
  MONTHS_NOMINATIVE,
  MONTHS_GENITIVE
} from "../data/date.js";

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export default function Calendar({
  year,
  month,
  selectedDay,
  today,
  onDayClick,
  onPrevMonth,
  onNextMonth
}) {
  const weeks = buildCalendarGrid(year, month);

  return (
    <section className="calendar" aria-label="Календарь">
      <div className="calendar__head">
        <h2 className="calendar__title" id="calendar-title">
          {MONTHS_NOMINATIVE[month]} {year}
        </h2>

        <div className="calendar__arrows">
          <button
            className="calendar__arrow"
            type="button"
            aria-label="Предыдущий месяц"
            onClick={onPrevMonth}
          >
            ‹
          </button>
          <button
            className="calendar__arrow"
            type="button"
            aria-label="Следующий месяц"
            onClick={onNextMonth}
          >
            ›
          </button>
        </div>
      </div>

      <ul className="calendar__weekdays">
        {WEEKDAYS.map((weekday) => (
          <li key={weekday}>{weekday}</li>
        ))}
      </ul>

      <ul className="calendar__days" id="calendar-days">
        {weeks.flat().map((cell, index) => {
          if (cell.day === null) {
            return (
              <li key={`empty-${index}`}>
                <button
                  className="day-cell outside"
                  type="button"
                  disabled
                  aria-hidden="true"
                />
              </li>
            );
          }

          const selectable = isDateSelectable(
            cell.day,
            month,
            year,
            today
          );
          const selected = cell.day === selectedDay;
          const classes = [
            "day-cell",
            selected ? "selected" : "",
            selectable ? "" : "disabled"
          ].filter(Boolean).join(" ");

          return (
            <li key={`${year}-${month}-${cell.day}`}>
              <button
                className={classes}
                type="button"
                disabled={!selectable}
                aria-pressed={selected}
                aria-label={`${cell.day} ${MONTHS_GENITIVE[month]}`}
                onClick={() => onDayClick(cell.day)}
              >
                {cell.day}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
