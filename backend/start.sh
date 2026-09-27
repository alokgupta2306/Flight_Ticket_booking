#!/bin/bash
set -e

# Start BaseX HTTP server in the background
basexhttp &

# Give it time to boot up
sleep 8

# Set a known password every startup (container storage is temporary, so this must run every time)
basex -c "ALTER PASSWORD admin admin123"

# Recreate the database fresh from bundled XML data every startup
basex -c "DROP DB flightsdb" || true
basex -c "CREATE DB flightsdb data"

# Start the Express backend
node server.js