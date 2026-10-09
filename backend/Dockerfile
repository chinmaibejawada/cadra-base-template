FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY tsconfig.json ./
COPY src/ ./src/
COPY data/ ./data/

RUN npm run build

EXPOSE 4000

CMD ["node", "dist/index.js"]