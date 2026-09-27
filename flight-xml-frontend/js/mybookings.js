async function loadBookings(passengerId) {
  const container = document.getElementById('bookingsList');
  container.innerHTML = 'Loading...';

  try {
    const bookings = await getBookings(passengerId);

    if (bookings.length === 0) {
      container.innerHTML = '<p>No bookings found for this passenger.</p>';
      return;
    }

    container.innerHTML = `
      <table>
        <tr>
          <th>Booking ID</th><th>Flight</th><th>Route</th><th>Seat</th><th>Class</th><th>Status</th><th>Booked On</th><th></th>
        </tr>
        ${bookings.map(b => `
          <tr>
            <td>${b.bookingId}</td>
            <td>${b.flightRef}</td>
            <td>${b.from} → ${b.to}</td>
            <td>${b.seat}</td>
            <td>${b.seatClass}</td>
            <td>${b.status}</td>
            <td>${b.bookedOn}</td>
            <td><button onclick="cancel('${b.bookingId}', '${passengerId}')">Cancel</button></td>
          </tr>
        `).join('')}
      </table>
    `;
  } catch (err) {
    container.innerHTML = `<p class="error">Failed to load bookings: ${err.message}</p>`;
  }
}

async function cancel(bookingId, passengerId) {
  if (!confirm(`Cancel booking ${bookingId}?`)) return;
  try {
    await cancelBooking(bookingId);
    loadBookings(passengerId);
  } catch (err) {
    alert(`Cancellation failed: ${err.message}`);
  }
}

document.getElementById('lookupForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const passengerId = document.getElementById('passengerId').value.trim();
  if (passengerId) loadBookings(passengerId);
});

// Auto-load if passengerId is passed in URL (e.g. redirected from booking.html)
const urlParams = new URLSearchParams(window.location.search);
const prefillId = urlParams.get('passengerId');
if (prefillId) {
  document.getElementById('passengerId').value = prefillId;
  loadBookings(prefillId);
}