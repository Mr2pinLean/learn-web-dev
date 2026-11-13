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

export function getSlotsForDate(day, month, year, today = new Date()) {
  const selectedDate = new Date(year, month, day);
  const now = new Date();

  return BASE_SLOTS.map((slot) => {
    let available = slot.available;

    // Для сегодняшнего дня прошедшее время недоступно.
    const isToday =
      selectedDate.getFullYear() === today.getFullYear() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getDate() === today.getDate();

    if (isToday) {
      const [hours, minutes] = slot.time.split(":").map(Number);
      const slotDate = new Date(year, month, day, hours, minutes);

      if (slotDate <= now) {
        available = false;
      }
    }

    return { ...slot, available };
  });
}
