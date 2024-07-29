# Etapa de construção
FROM node:20 AS build-deps

# Instalar dependências e ferramentas necessárias
RUN apt-get update && apt-get install -y wget gnupg

# Baixar e instalar Dockerize
ENV DOCKERIZE_VERSION v0.6.1
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && rm dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz

# Adicionar e configurar o Dumb-init
ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.1/dumb-init_1.2.1_amd64 /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init

# Configuração do Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Configuração do ambiente de trabalho
WORKDIR /usr/src/app

# Copiar arquivos de configuração e instalar dependências
COPY package*.json ./
RUN npm install --omit=dev

# Copiar o restante do código e construir o projeto
COPY . .
RUN npm run build

# Configurações de produção
ENV NODE_ENV=production
ENV PORT=3000
ENV CHROME_BIN=google-chrome-stable

# Expor a porta do aplicativo
EXPOSE 3000

# Copiar e configurar o script de variáveis de ambiente
COPY add-env-vars.sh ./
RUN chmod +x add-env-vars.sh

# Comando de inicialização
ENTRYPOINT ["dumb-init", "--"]
CMD ["dockerize", "-wait", "tcp://${DB_HOST}:5432", \
  "&&", "sh", "./add-env-vars.sh", \
  "&&", "npx", "sequelize", "db:migrate", \
  "&&", "npx", "sequelize", "db:seed:all", \
  "&&", "node", "dist/server.js"]
