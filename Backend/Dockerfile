# Use a smaller, more secure base image
FROM node:20

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Expose API port
EXPOSE 5000

# Run the server
CMD ["npm", "start"]
