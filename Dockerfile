#use node base image
FROM node:18

# create app directory
WORKDIR /app


#copy projects
COPY  . .

#install backend dep
RUN cd backend && npm install

#install frontend dep and build
RUN cd frontend && npm install && npm run build

#expose backend port
EXPOSE 5000

#start backend
CMD [ "node","backend/server.js" ]
