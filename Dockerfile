FROM node:22

WORKDIR /app

COPY package*.json ./
RUN npm install


COPY . .

EXPOSE 5000

ENV PORT=5000
ENV NODE_ENV=production

CMD ["node", "src/server.js"]
