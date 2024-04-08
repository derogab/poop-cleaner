FROM node:lts-alpine3.19

# Create app directory
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
RUN npm install

# Copy app
COPY ./src .

# Run command 
ENTRYPOINT [ "node", "/app/index.js" ]
CMD []
