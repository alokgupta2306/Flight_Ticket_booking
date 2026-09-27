#!/bin/bash
set -e

echo ">>> Setting admin password..."
basex -c "ALTER PASSWORD admin admin123" 2>&1

echo ">>> Dropping old database (if exists)..."
basex -c "DROP DB flightsdb" 2>&1 || echo ">>> No existing database to drop."

echo ">>> Creating database from /app/data ..."
basex -c "CREATE DB flightsdb /app/data" 2>&1

echo ">>> Verifying database..."
basex -c "OPEN flightsdb; xquery count(collection('flightsdb')/Flights/Flight)" 2>&1

echo ">>> Starting BaseX HTTP server (with correct credentials already set)..."
basexhttp &

echo ">>> Waiting for BaseX HTTP server to be ready..."
sleep 8

echo ">>> Starting Express server..."
node server.js