FROM node:18-alpine

WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer toutes les dépendances (prod + dev)
RUN npm ci

# Copier le code source
COPY . .

# Installer ts-node pour l'exécution
RUN npm install -g ts-node

# Générer le client Prisma
RUN npx prisma generate

# Exposer les ports
EXPOSE 4000 4001

# Commande par défaut avec attente PostgreSQL et migrations
CMD ["sh", "-c", "echo 'Waiting for PostgreSQL...' && sleep 5 && npx prisma migrate deploy && echo 'Starting application...' && npx ts-node --transpile-only src/server.ts"] 