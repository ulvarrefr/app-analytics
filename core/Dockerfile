# syntax=docker/dockerfile:1
FROM node:18
WORKDIR /app
COPY package.json package.json
RUN npm install
EXPOSE 9002
COPY . .
CMD ["npm", "start"]
