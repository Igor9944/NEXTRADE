FROM node:20.18.0-bookworm-slim

WORKDIR /app

COPY --chown=node:node package*.json ./
RUN npm ci

COPY --chown=node:node . .
RUN mkdir -p /app/uploads && chown node:node /app/uploads

USER node

EXPOSE 3000
CMD ["npm", "run", "dev"]
