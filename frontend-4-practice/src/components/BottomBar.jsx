import { DAYS_OF_WEEK, MONTHS_GENITIVE } from "../data/date.js";

export default function BottomBar({
  day,
  month,
  year,
  selectedTime,
  onNext
}) {
  const selectedDate = day === null ? null : new Date(year, month, day);

  const dateText = selectedDate
    ? `${DAYS_OF_WEEK[selectedDate.getDay()]}, ${day} ${MONTHS_GENITIVE[month]} ${year}`
    : "Нет доступной даты";

  return (
    <div className="bottom-bar">
      <p className="booking-summary" aria-live="polite">
        Выбрано:{" "}
        <strong>
          {selectedDate
            ? `${dateText} • ${selectedTime || "время не выбрано"}`
            : dateText}
        </strong>
      </p>

      <button
        className="next-button"
        id="next-button"
        type="button"
        onClick={onNext}
        disabled={!selectedDate || !selectedTime}
      >
        Далее
      </button>
    </div>
  );
}
