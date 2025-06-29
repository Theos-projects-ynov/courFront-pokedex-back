FROM node:18-alpine

WORKDIR /app

# Installation de pnpm avec cache
RUN npm install -g pnpm

# Copier seulement les fichiers de dépendances pour le cache
COPY package.json pnpm-lock.yaml ./

# Installer les dépendances avec cache et frozen lockfile
RUN pnpm install --frozen-lockfile --prefer-offline

# Copier le reste du code source
COPY . .

# Exposer le port
EXPOSE 3000

# Commande par défaut
CMD ["pnpm", "run", "dev"] 