# syntax=docker/dockerfile:1
# Image « app » de PokeTracker : sert le site et exécute les fonctions api/* (voir server/).

# --- Étape 1 : construction du site et du serveur -------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Clé PUBLIQUE de Clerk, nécessaire à la construction du site (elle est visible dans le navigateur)
ARG VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY
RUN npm run build

# Le serveur a besoin de « pg » et d'« esbuild » : ajoutés ici sans modifier package.json
# (le déploiement Vercel + Supabase reste inchangé).
RUN npm install --no-save esbuild pg && node server/build.mjs

# --- Étape 2 : image finale, légère ----------------------------------------------------------
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    STATIC_DIR=/app/dist

COPY --from=build /app/dist ./dist
COPY --from=build /app/dist-server ./dist-server

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/healthz || exit 1

CMD ["node", "dist-server/server.mjs"]
