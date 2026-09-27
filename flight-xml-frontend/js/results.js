async function loadResults() {
  const params = new URLSearchParams(window.location.search);
  const from = params.get('from');
  const to = params.get('to');
  const date = params.get('date');

  const container = document.getElementById('resultsList');

  try {
    const flights = await searchFlights(from, to, date);

    if (flights.length === 0) {
      container.innerHTML = '<p>No flights found for this route/date.</p>';
      return;
    }

    container.innerHTML = flights.map(f => `
      <div class="flight-card">
        <div class="details">
          <strong>${f.flightNo}</strong> — ${f.from} → ${f.to}<br>
          Date: ${f.date} | Dep: ${f.departureTime} | Arr: ${f.arrivalTime}<br>
          Aircraft: ${f.aircraft}
        </div>
        <div>
          <button onclick="goToBooking('${f.flightNo}')">Select</button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<p class="error">Failed to load flights: ${err.message}</p>`;
  }
}

function goToBooking(flightNo) {
  window.location.href = `booking.html?flightNo=${encodeURIComponent(flightNo)}`;
}

loadResults();