# Build environment
FROM node:20-alpine3.19 AS build
# Create app directory
WORKDIR /app
# Set environments
ENV PATH /app/node_modules/.bin:$PATH
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
RUN npm install
# Copy app
COPY . .
# Build
RUN npm run build


# Production environment
FROM alpine:3.20
# Connect repository
LABEL org.opencontainers.image.source https://github.com/derogab/poop-cleaner
# Create app directory
WORKDIR /app
# Copy app
COPY --from=build /app/dist/poop-cleaner /app
# Make executable
RUN chmod +x /app/poop-cleaner
# Run command 
CMD ["/app/poop-cleaner"]
