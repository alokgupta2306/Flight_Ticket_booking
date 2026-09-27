const params = new URLSearchParams(window.location.search);
const flightNo = params.get('flightNo');
let selectedSeat = null;

document.getElementById('flightInfo').textContent = `Flight: ${flightNo}`;

async function loadSeats() {
  const seatMapEl = document.getElementById('seatMap');
  try {
    const seats = await getSeats(flightNo);

    if (seats.length === 0) {
      seatMapEl.innerHTML = '<p>No available seats on this flight.</p>';
      return;
    }

    seatMapEl.innerHTML = seats.map(s => `
      <span class="seat" data-seat="${s.number}" onclick="selectSeat('${s.number}', this)">
        ${s.number} (${s.class})
      </span>
    `).join('');
  } catch (err) {
    seatMapEl.innerHTML = `<p class="error">Failed to load seats: ${err.message}</p>`;
  }
}

function selectSeat(seatNumber, el) {
  document.querySelectorAll('.seat').forEach(s => s.classList.remove('selected'));
  el.classList.add('selected');
  selectedSeat = seatNumber;
}

document.getElementById('bookingForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const messageEl = document.getElementById('message');
  messageEl.textContent = '';

  const passengerId = document.getElementById('passengerId').value.trim();

  if (!selectedSeat) {
    messageEl.textContent = 'Please select a seat first.';
    messageEl.className = 'error';
    return;
  }
  if (!passengerId) {
    messageEl.textContent = 'Please enter your Passenger ID.';
    messageEl.className = 'error';
    return;
  }

  const bookingId = 'B' + Date.now(); // simple unique ID generator

  try {
    await createBooking(bookingId, passengerId, flightNo, selectedSeat);
    messageEl.textContent = `Booking confirmed! Booking ID: ${bookingId}`;
    messageEl.className = 'success';
    setTimeout(() => {
      window.location.href = `mybookings.html?passengerId=${encodeURIComponent(passengerId)}`;
    }, 1500);
  } catch (err) {
    messageEl.textContent = `Booking failed: ${err.message}`;
    messageEl.className = 'error';
  }
});

loadSeats();