FROM node:carbon

RUN mkdir /app
WORKDIR /app

COPY . /app
RUN npm i && npm run build

CMD npx serve -s build

EXPOSE 5000
