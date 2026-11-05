FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_BASE_URL=/api/v1
ARG VITE_USE_MOCK_DATA=false
ARG VITE_PUBLIC_APP_URL=
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_USE_MOCK_DATA=$VITE_USE_MOCK_DATA \
    VITE_PUBLIC_APP_URL=$VITE_PUBLIC_APP_URL
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY nginx/docker-entrypoint.sh /docker-entrypoint-cloudsync.sh
RUN chmod +x /docker-entrypoint-cloudsync.sh
EXPOSE 80
ENTRYPOINT ["/docker-entrypoint-cloudsync.sh"]
