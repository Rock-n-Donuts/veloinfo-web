FROM node as dev
WORKDIR /app

CMD bash -c "npm i && npx prisma generate && npx prisma migrate deploy && npm run dev"

##########################
FROM dev as prod
COPY . .
RUN npm i
RUN npx prisma generate
RUN npm run build

CMD bash -c "npx prisma migrate && npm start"