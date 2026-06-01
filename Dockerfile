FROM node:20-slim

RUN apt-get update && apt-get install -y \
    ffmpeg \
    fontconfig \
    fonts-open-sans \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

ENV PORT=8080
EXPOSE 8080
CMD ["npm", "start"]
