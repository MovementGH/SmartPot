FROM node

COPY Client /App/Client
WORKDIR /App/Client
RUN npm run build

COPY Server /App/Server
CMD node /App/Server