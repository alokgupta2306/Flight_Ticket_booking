document.getElementById('searchForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const from = document.getElementById('from').value.trim();
  const to = document.getElementById('to').value.trim();
  const date = document.getElementById('date').value;

  const messageEl = document.getElementById('message');
  messageEl.textContent = '';

  if (!from || !to || !date) {
    messageEl.textContent = 'Please fill in all fields.';
    messageEl.className = 'error';
    return;
  }

  // Pass search criteria to results.html via URL query parameters
  const params = new URLSearchParams({ from, to, date });
  window.location.href = `results.html?${params.toString()}`;
});