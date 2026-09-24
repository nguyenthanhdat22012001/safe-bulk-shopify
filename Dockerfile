# ---- Build stage ----
FROM node:22-alpine AS build
WORKDIR /app

ARG VITE_ROOT_API
ARG VITE_SHOPIFY_CLIENT_ID
RUN test -n "$VITE_ROOT_API" && test -n "$VITE_SHOPIFY_CLIENT_ID"

COPY app/package.json app/package-lock.json ./
RUN npm ci --legacy-peer-deps
COPY app/ .
RUN npm run build

# ---- Serve stage ----
FROM nginx:1.28-alpine AS production
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --output-document=- http://127.0.0.1/health-check || exit 1
CMD ["nginx", "-g", "daemon off;"]
