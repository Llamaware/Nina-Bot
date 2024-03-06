# ================ #
#    Base Stage    #
# ================ #

FROM node:20-bullseye-slim as base

WORKDIR /usr/src/app

RUN apt-get update && \
    apt-get upgrade -y --no-install-recommends && \
    apt-get install -y --no-install-recommends build-essential python3 dumb-init && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get autoremove

COPY --chown=node:node package-lock.json* .
COPY --chown=node:node package.json .

COPY --chown=node:node prisma/ prisma/
COPY --chown=node:node commands/ commands/
COPY --chown=node:node events/ events/
COPY --chown=node:node handlers/ handlers/
COPY --chown=node:node Utils/ Utils/
COPY --chown=node:node deploy-commands-prod.js deploy-commands-prod.js
COPY --chown=node:node index.js index.js

RUN npm install -g dotenv-cli
RUN npm install
RUN npx prisma generate

COPY --chown=node:node .env.prod .env

RUN chown node:node /usr/src/app/

USER node

EXPOSE 8080

RUN npm run deploy
CMD [ "npm", "run", "start" ]