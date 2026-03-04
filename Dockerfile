# #use node base image
# FROM node:18

# # create app directory
# WORKDIR /app


# #copy projects
# COPY  . .

# #install backend dep
# RUN cd backend && npm install

# #install frontend dep and build
# RUN cd frontend && npm install && npm run build

# #expose backend port
# EXPOSE 5000

# #start backend
# CMD [ "node","backend/server.js" ]


# Base image
FROM node:18

# App directory
WORKDIR /app

# Copy backend package files first (for caching)
COPY backend/package*.json backend/
RUN cd backend && npm install

# Copy frontend package files first
COPY frontend/package*.json frontend/
RUN cd frontend && npm install

# Copy remaining source code
COPY . .

# Build frontend
RUN cd frontend && npm run build

# Expose backend port
EXPOSE 5000

# Start backend server
CMD ["node", "backend/server.js"]