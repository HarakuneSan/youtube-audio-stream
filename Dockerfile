# Verwende ein offizielles Node.js-Image als Basis
FROM node:22

# Arbeitsverzeichnis im Container erstellen
WORKDIR /app

# package.json und package-lock.json kopieren
COPY package*.json ./

# Abhängigkeiten installieren
RUN npm install

# Den Rest des Codes kopieren
COPY . .

# Port definieren (anpassen, falls nötig)
EXPOSE 3000

# Startbefehl (ggf. "start" durch dein passendes npm-Script ersetzen)
CMD ["npm", "run", "start"]
