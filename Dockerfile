FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Fly.io expects apps to listen on port 8080 by default
EXPOSE 8080
ENV PORT=8080

# Start server
CMD ["npm", "start"]
