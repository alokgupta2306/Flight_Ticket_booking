const API_BASE = 'http://localhost:5000';

// Parses XML text response into a JS-friendly array of objects (simple flat parser)
function parseXML(xmlText) {
  const parser = new DOMParser();
  return parser.parseFromString(xmlText, 'application/xml');
}

// Converts a <Flight> XML element into a plain JS object
function flightNodeToObject(flightEl) {
  return {
    flightNo: flightEl.querySelector('FlightNo')?.textContent,
    from: flightEl.querySelector('Route From')?.textContent,
    to: flightEl.querySelector('Route To')?.textContent,
    date: flightEl.querySelector('Date')?.textContent,
    departureTime: flightEl.querySelector('DepartureTime')?.textContent,
    arrivalTime: flightEl.querySelector('ArrivalTime')?.textContent,
    aircraft: flightEl.querySelector('Aircraft')?.textContent
  };
}

// Converts a <Seat> XML element into a plain JS object
function seatNodeToObject(seatEl) {
  return {
    number: seatEl.querySelector('Number')?.textContent,
    class: seatEl.querySelector('Class')?.textContent,
    status: seatEl.querySelector('Status')?.textContent
  };
}

// Converts a <BookingDetail> XML element into a plain JS object
function bookingNodeToObject(bookingEl) {
  return {
    bookingId: bookingEl.querySelector('BookingId')?.textContent,
    passengerRef: bookingEl.querySelector('PassengerRef')?.textContent,
    flightRef: bookingEl.querySelector('FlightRef')?.textContent,
    seat: bookingEl.querySelector('Seat')?.textContent,
    seatClass: bookingEl.querySelector('Class')?.textContent,
    status: bookingEl.querySelector('Status')?.textContent,
    bookedOn: bookingEl.querySelector('BookedOn')?.textContent,
    from: bookingEl.querySelector('Route From')?.textContent,
    to: bookingEl.querySelector('Route To')?.textContent
  };
}

// ---------- API calls ----------

async function searchFlights(from, to, date) {
  const params = new URLSearchParams();
  if (from) params.append('from', from);
  if (to) params.append('to', to);
  if (date) params.append('date', date);

  const res = await fetch(`${API_BASE}/flights?${params.toString()}`);
  const text = await res.text();
  const xml = parseXML(text);
  return Array.from(xml.querySelectorAll('Flight')).map(flightNodeToObject);
}

async function getSeats(flightNo) {
  const res = await fetch(`${API_BASE}/flights/${flightNo}/seats`);
  const text = await res.text();
  const xml = parseXML(text);
  return Array.from(xml.querySelectorAll('Seat')).map(seatNodeToObject);
}

async function getBookings(passengerId) {
  const res = await fetch(`${API_BASE}/bookings/${passengerId}`);
  const text = await res.text();
  const xml = parseXML(text);
  return Array.from(xml.querySelectorAll('BookingDetail')).map(bookingNodeToObject);
}

async function createBooking(bookingId, passengerId, flightNo, seatNumber) {
  const res = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookingId, passengerId, flightNo, seatNumber })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Booking failed');
  return data;
}

async function cancelBooking(bookingId) {
  const res = await fetch(`${API_BASE}/bookings/${bookingId}`, { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Cancellation failed');
  return data;
}