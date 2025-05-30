FROM node:20-alpine AS builder

WORKDIR /app
COPY . .

RUN npm install --legacy-peer-deps
RUN npx expo export --platform web

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
