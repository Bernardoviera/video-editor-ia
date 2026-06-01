FROM node:20-slim

RUN apt-get update && apt-get install -y \
    ffmpeg \
    fontconfig \
    fonts-open-sans \
    chromium \
    libnspr4 \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

ENV PORT=8080
ENV REMOTION_CHROME_EXECUTABLE=/usr/bin/chromium
EXPOSE 8080
CMD ["npm", "start"]
