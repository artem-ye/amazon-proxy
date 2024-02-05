FROM node:lts-alpine3.17
WORKDIR /app

COPY . .
RUN npm install --omit=dev
EXPOSE 3000

CMD ["npm", "run", "start"]