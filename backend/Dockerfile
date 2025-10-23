FROM node:18

# Installa Python 3 e venv
RUN apt-get update && \
    apt-get install -y python3 python3-pip python3-venv && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Crea directory di lavoro
WORKDIR /usr/src/app

# Crea e attiva virtualenv
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copia package.json e installa solo Node.js dependencies
COPY package*.json ./
RUN npm install --only=production

# Copia tutto il progetto
COPY . .

# Installa Python dependencies dentro virtualenv
RUN pip install --no-cache-dir -r src/python-scripts/requirements.txt

# Esponi la porta
EXPOSE 5555

# Avvia server Node
CMD ["node", "src/server.js"]