const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { runQuery, DB_NAME } = require('./basexClient');

const app = express();
app.use(cors());
app.use(express.json());

// ---------- Health check ----------
app.get('/', (req, res) => {
  res.send('Flight Booking Backend is running.');
});

// ---------- 1. GET /flights - search flights (Query 11.1, 11.5) ----------
app.get('/flights', async (req, res) => {
  const { from, to, date } = req.query;

  let xquery = `
    <Flights>{
    for $f in collection('${DB_NAME}')/Flights/Flight
    where true()`;

  if (from) xquery += ` and lower-case($f/Route/From) = lower-case('${from}')`;
  if (to) xquery += ` and lower-case($f/Route/To) = lower-case('${to}')`;
  if (date) xquery += ` and $f/Date = '${date}'`;

  xquery += `
    order by $f/DepartureTime
    return $f
    }</Flights>`;

  try {
    const result = await runQuery(xquery);
    res.type('application/xml').send(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch flights' });
  }
});

// ---------- 2. GET /flights/:flightNo/seats - available seats (Query 11.2) ----------
app.get('/flights/:flightNo/seats', async (req, res) => {
  const { flightNo } = req.params;

  const xquery = `
    <Seats>{
    for $s in collection('${DB_NAME}')/Flights/Flight[FlightNo='${flightNo}']/Seats/Seat
    where $s/Status = 'AVAILABLE'
    return $s
    }</Seats>`;

  try {
    const result = await runQuery(xquery);
    res.type('application/xml').send(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch seats' });
  }
});

// ---------- 3. GET /bookings/:passengerId - passenger's bookings (Query 11.3) ----------
app.get('/bookings/:passengerId', async (req, res) => {
  const { passengerId } = req.params;

  const xquery = `
    <Bookings>{
    for $b in collection('${DB_NAME}')/Bookings/Booking
    where $b/PassengerRef = '${passengerId}'
    let $flight := collection('${DB_NAME}')/Flights/Flight[FlightNo = $b/FlightRef]
    return <BookingDetail>{$b/*}{$flight/Route}</BookingDetail>
    }</Bookings>`;

  try {
    const result = await runQuery(xquery);
    res.type('application/xml').send(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// ---------- 4. POST /bookings - create a booking (atomic, Section 13) ----------
app.post('/bookings', async (req, res) => {
  const { bookingId, passengerId, flightNo, seatNumber } = req.body;

  if (!bookingId || !passengerId || !flightNo || !seatNumber) {
    return res.status(400).json({ error: 'Missing required booking fields' });
  }

  const checkQuery = `
    let $s := collection('${DB_NAME}')/Flights/Flight[FlightNo='${flightNo}']/Seats/Seat[Number='${seatNumber}']
    return $s/Status/text()`;

  try {
    const status = await runQuery(checkQuery);

    if (status.trim() !== 'AVAILABLE') {
      return res.status(409).json({ error: 'Seat is not available' });
    }

    const bookQuery = `
      let $seat := collection('${DB_NAME}')/Flights/Flight[FlightNo='${flightNo}']/Seats/Seat[Number='${seatNumber}']
      let $seatClass := $seat/Class/text()
      return (
        replace value of node $seat/Status with 'BOOKED',
        insert node
          <Booking>
            <BookingId>${bookingId}</BookingId>
            <PassengerRef>${passengerId}</PassengerRef>
            <FlightRef>${flightNo}</FlightRef>
            <Seat>${seatNumber}</Seat>
            <Class>{$seatClass}</Class>
            <Status>CONFIRMED</Status>
            <BookedOn>{current-date()}</BookedOn>
          </Booking>
        into collection('${DB_NAME}')/Bookings
      )`;

    await runQuery(bookQuery);
    res.status(201).json({ message: 'Booking created successfully', bookingId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// ---------- 5. DELETE /bookings/:bookingId - cancel a booking (atomic) ----------
app.delete('/bookings/:bookingId', async (req, res) => {
  const { bookingId } = req.params;

  const xquery = `
    let $b := collection('${DB_NAME}')/Bookings/Booking[BookingId='${bookingId}']
    let $flightNo := $b/FlightRef/text()
    let $seatNum := $b/Seat/text()
    let $seat := collection('${DB_NAME}')/Flights/Flight[FlightNo=$flightNo]/Seats/Seat[Number=$seatNum]
    return (
      replace value of node $seat/Status with 'AVAILABLE',
      delete node $b
    )`;

  try {
    await runQuery(xquery);
    res.json({ message: 'Booking cancelled successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});