FROM node as dev
WORKDIR /app

CMD bash -c "npm i && npm run dev"

##########################
FROM dev as prod
COPY . .
RUN npm i
RUN npm build

CMD npm start