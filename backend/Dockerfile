# ─── Stage 1: Node.js + Python + FFmpeg ───────────────────────────────────────
FROM node:20-slim

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    python3 \
    python3-pip \
    python3-venv \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install gTTS (Python TTS library for Marathi)
RUN pip3 install --no-cache-dir gtts --break-system-packages

# Create app directory
WORKDIR /app

# Install Node dependencies
COPY package.json ./
RUN npm install --omit=dev

# Copy application code
COPY . .

# Create required directories
RUN mkdir -p tmp videos assets

# Copy default background image (must exist at build time)
# If you have a custom background.jpg, place it in backend/assets/
# Otherwise the container will use the placeholder below
RUN curl -s "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1920&h=1080&fit=crop" \
    -o assets/background.jpg || echo "Background download failed, using placeholder"

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

CMD ["node", "server.js"]
