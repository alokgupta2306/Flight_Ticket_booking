#!/bin/bash
set -e

echo ">>> Starting BaseX HTTP server..."
basexhttp &

echo ">>> Waiting for BaseX to be ready..."
sleep 10

echo ">>> Setting admin password..."
basex -c "ALTER PASSWORD admin admin123" 2>&1

echo ">>> Dropping old database (if exists)..."
basex -c "DROP DB flightsdb" 2>&1 || echo ">>> No existing database to drop."

echo ">>> Creating database from /app/data ..."
basex -c "CREATE DB flightsdb /app/data" 2>&1

echo ">>> Verifying database..."
basex -c "OPEN flightsdb; xquery count(collection('flightsdb')/Flights/Flight)" 2>&1

echo ">>> Starting Express server..."
node server.js