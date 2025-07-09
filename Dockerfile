FROM node:22-alpine

WORKDIR /app

# Install Chrome dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ttf-freefont

# Copy package files
COPY package*.json ./

# Install dependencies with unsafe-perm flag
RUN npm install --unsafe-perm

# Copy source code
COPY . .

# Build TypeScript files
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
