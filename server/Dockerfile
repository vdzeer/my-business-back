FROM node:18

RUN npm install -g nodemon

WORKDIR /app

COPY ["package.json", "package-lock.json", "tsconfig.json", ".env", "./"]

RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 4000

CMD ["npm", "run", "dev"]