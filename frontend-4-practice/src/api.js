// Все обращения к серверу собраны в одном месте.
async function request(url) {
  const response = await fetch(url);

  if (!response.ok) {
    let message = `Ошибка сервера (${response.status})`;
    try {
      const data = await response.json();
      if (data?.error) message = data.error;
    } catch {
      // Если сервер вернул не JSON, используем сообщение по умолчанию.
    }
    throw new Error(message);
  }

  return response.json();
}

// GET /api/booking/today -> { day, month, year }
export function fetchToday() {
  return request("/api/booking/today");
}

// GET /api/slots?day=&month=&year= -> { date, slots }
export function fetchSlots(date) {
  const params = new URLSearchParams({
    day: String(date.day),
    month: String(date.month),
    year: String(date.year),
  });
  return request(`/api/slots?${params.toString()}`);
}
