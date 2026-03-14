# Build environment
FROM node:24-alpine AS build
# Create app directory
WORKDIR /app
# Set environments
ENV PATH=/app/node_modules/.bin:$PATH
# Copy package files
COPY package*.json ./
RUN npm install
# Copy app
COPY . .
# Build bundled app
RUN mkdir -p dist && esbuild bin.js --bundle --platform=node --outfile=dist/poop-cleaner.js


# Production environment
FROM alpine:3.23
# Connect repository
LABEL org.opencontainers.image.source=https://github.com/derogab/poop-cleaner
# Install Node.js runtime (much smaller than full Node.js binary)
RUN apk add --no-cache nodejs
# Create app directory
WORKDIR /app
# Copy bundled app from build stage
COPY --from=build /app/dist/poop-cleaner.js /app/
# Run command 
CMD ["node", "/app/poop-cleaner.js"]
