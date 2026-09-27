const axios = require('axios');
require('dotenv').config();

const BASEX_URL = process.env.BASEX_URL;
const USER = process.env.BASEX_USER;
const PASSWORD = process.env.BASEX_PASSWORD;
const DB_NAME = process.env.DB_NAME;

async function runQuery(xquery) {
  const body = `<query xmlns="http://basex.org/rest">
  <text><![CDATA[${xquery}]]></text>
</query>`;

  try {
    const response = await axios.post(
      `${BASEX_URL}/rest`,
      body,
      {
        auth: { username: USER, password: PASSWORD },
        headers: { 'Content-Type': 'application/xml' }
      }
    );
    return response.data;
  } catch (err) {
    console.error('BaseX query failed:', err.response ? err.response.data : err.message);
    throw err;
  }
}

module.exports = { runQuery, DB_NAME };