export default function TimeSlots({ slots, selectedTime, onTimeClick }) {
  return (
    <section className="slots" aria-label="Доступное время">
      <h2 className="slots__title">Доступное время</h2>

      <ul className="slots__list" id="slots-list">
        {slots.length === 0 ? (
          <li>Нет доступного времени.</li>
        ) : (
          slots.map((slot) => {
            const selected = slot.time === selectedTime && slot.available;
            const classes = [
              "slot",
              slot.available ? "" : "busy",
              selected ? "selected" : ""
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
                  {!slot.available && (
                    <span className="slot__note">Занято</span>
                  )}
                </button>
              </li>
            );
          })
        )}
      </ul>
    </section>
  );
}
