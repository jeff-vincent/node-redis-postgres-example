FROM node:alpine
WORKDIR /home/node
COPY package*.json .
RUN yarn install --production
WORKDIR /home/node/app
COPY . .
EXPOSE 3000
CMD ["node", "index.js"]
