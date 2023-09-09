# Setup and build the client

FROM node:18 as client

WORKDIR /usr/app/client/

RUN npm install --legacy-peer-deps
COPY client/package*.json ./
COPY client/ ./
RUN npm run build


# Setup the server

FROM node:18

RUN npm install -g nodemon

WORKDIR /usr/app/
COPY --from=client /usr/app/client/dist/ ./client/dist/

WORKDIR /usr/app/server/
COPY server/package*.json ./

RUN npm install --legacy-peer-deps

COPY server/ ./

ENV PORT 5000

EXPOSE 5000

CMD ["npm", "run", "dev"]