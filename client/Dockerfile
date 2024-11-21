FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:22-alpine AS main

COPY --from=build /app /

EXPOSE 4173

CMD ["npm", "run", "preview"]