export default function TimeSlots({ slots, selectedTime, onTimeClick }) {
  return (
    <ul className="slots__list" id="slots-list">
      {slots.length === 0 ? (
        <li className="slots__empty">На эту дату нет доступного времени.</li>
      ) : (
        slots.map((slot) => {
          const selected = slot.time === selectedTime && slot.available;
          const classes = [
            "slot",
            slot.available ? "" : "busy",
            selected ? "selected" : "",
          ].filter(Boolean).join(" ");

          return (
            <li key={slot.time}>
              <button
                className={classes}
                type="button"
                disabled={!slot.available}
                aria-pressed={selected}
                onClick={() => onTimeClick(slot.time)}
              >
                <span>{slot.time}</span>
                {!slot.available && <span className="slot__note">Занято</span>}
              </button>
            </li>
          );
        })
      )}
    </ul>
  );
}
