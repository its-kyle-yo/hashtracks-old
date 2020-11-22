FROM node:13

WORKDIR /usr/src/app

RUN npm i -g prisma nodemon

COPY package.json ./
COPY package-lock.json ./

RUN npm install

COPY .babelrc .
COPY . .

RUN chmod -R +x ./docker-scripts/

# VOLUME [ "/usr/src/app" ]

EXPOSE 4000

ENTRYPOINT [ "./docker-scripts/entrypoint.sh" ]