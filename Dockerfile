# Build stage
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Supabase URL/key are baked into the client at build time (pass as build-args or use default)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

RUN npm run build

# Run stage: serve static files (Cloud Run sets PORT)
FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve

COPY --from=build /app/dist ./dist

ENV PORT=8080
EXPOSE 8080

CMD ["sh", "-c", "serve -s dist -l ${PORT}"]
