FROM node:19-alpine as BASE

WORKDIR /app
COPY package*.json ./

RUN apk add --no-cache git \
    && npm ci --force

FROM node:19-alpine as BUILD

WORKDIR /app

COPY --from=BASE /app/node_modules ./node_modules
COPY . .

RUN apk add --no-cache git curl \
    && npm run build

FROM node:19-alpine AS PRODUCTION

WORKDIR /app

RUN npm i -g serve

COPY --from=BUILD /app/dist ./dist

EXPOSE 8000

CMD ["serve", "-s", "dist", "-p", "8000"]