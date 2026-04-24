FROM node:20-slim

# yt-dlp ve ffmpeg kur
RUN apt-get update && apt-get install -y \
    ffmpeg \
    curl \
    python3 \
    --no-install-recommends \
    && curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Önce sadece package.json kopyala (layer cache için)
COPY package*.json ./
RUN npm install --production

# Kodu kopyala
COPY index.js ./
COPY src/ ./src/

CMD ["node", "index.js"]
