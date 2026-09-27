async function loadAllFlights() {
  const container = document.getElementById('allFlights');
  try {
    const flights = await searchFlights(); // no filters = returns all flights

    if (flights.length === 0) {
      container.innerHTML = '<p>No flights in the database.</p>';
      return;
    }

    container.innerHTML = `
      <table>
        <tr><th>Flight No</th><th>Route</th><th>Date</th><th>Departure</th><th>Arrival</th><th>Aircraft</th></tr>
        ${flights.map(f => `
          <tr>
            <td>${f.flightNo}</td>
            <td>${f.from} → ${f.to}</td>
            <td>${f.date}</td>
            <td>${f.departureTime}</td>
            <td>${f.arrivalTime}</td>
            <td>${f.aircraft}</td>
          </tr>
        `).join('')}
      </table>
    `;
  } catch (err) {
    container.innerHTML = `<p class="error">Failed to load flights: ${err.message}</p>`;
  }
}

loadAllFlights();