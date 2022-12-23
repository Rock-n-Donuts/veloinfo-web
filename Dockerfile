FROM node as dev
WORKDIR /app

CMD bash -c "npm i && npm start"

##########################
FROM dev as prod
RUN npm i

CMD npm start