# 1. Usamos una versión ligera de Node.js (la 22 como pide el PDF)
FROM node:22-slim

# 2. Creamos la carpeta dentro del contenedor
WORKDIR /usr/src/app

# 3. Copiamos los archivos de dependencias primero (para aprovechar la caché)
COPY package*.json ./

# 4. Instalamos las librerías (limpiamente, sin cosas de desarrollo)
RUN npm ci --omit=dev

# 5. Copiamos TODO el resto de tu código (server.js, carpetas model, controllers...)
COPY . .

# 6. Avisamos que tu servidor usa el puerto 3002
EXPOSE 3001

# 7. El comando para encender tu servidor
CMD ["node", "server.js"]