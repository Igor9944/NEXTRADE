FROM node:20.18.0-bookworm-slim

WORKDIR /app

COPY --chown=node:node package*.json ./
RUN npm ci && chown -R node:node /app/node_modules

COPY --chown=node:node . .

USER node

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
