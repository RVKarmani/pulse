FROM node:22.7.0-slim

WORKDIR /retroui

COPY ./package.json ./pnpm-lock.yaml ./
RUN npm i pnpm -g \
    && pnpm install --frozen-lockfile --no-cache \
    && pnpm store prune

COPY . .
RUN pnpm run build

EXPOSE 3000
CMD [ "pnpm", "run", "start" ]