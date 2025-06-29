FROM node:18-alpine

WORKDIR /app

# Installation de pnpm
RUN npm install -g pnpm

# Copier les fichiers de dépendances
COPY package*.json pnpm-lock.yaml ./

# Installer les dépendances
RUN pnpm install

# Copier le code source
COPY . .

# Exposer le port
EXPOSE 3000

# Commande par défaut avec host 0.0.0.0 pour Docker
CMD ["pnpm", "exec", "vite", "--port", "3000", "--host", "0.0.0.0"] 