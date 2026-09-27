FROM node:20-slim

# Install Java (needed for BaseX) plus tools to download/unzip it
RUN apt-get update && \
    apt-get install -y openjdk-17-jre-headless wget unzip ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Download and install BaseX (pinned version, not "latest")
RUN wget -v https://files.basex.org/releases/BaseX9.7.3/BaseX9.7.3.zip -O /tmp/basex.zip && \
    unzip -q /tmp/basex.zip -d /opt/basex && \
    rm /tmp/basex.zip && \
    chmod +x /opt/basex/bin/basex /opt/basex/bin/basexhttp

ENV PATH="/opt/basex/bin:${PATH}"

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

RUN chmod +x start.sh

EXPOSE 5000

CMD ["./start.sh"]