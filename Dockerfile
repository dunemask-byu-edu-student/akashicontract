FROM node:24

# Install Infisical
RUN npm install -g @infisical/cli

# Start Build process
WORKDIR /com/akashicontract

# Build Envars
ENV VITE_ENVIRONMENT=production

# Setup entrypoint
COPY docker-entrypoint.sh docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh

# Copy Build Deps
COPY package.json package.json
COPY Makefile Makefile

# Copy dependencies
COPY server server
COPY web web
COPY atlas atlas

# Build atlas 
RUN make build-atlas

# Install deps
RUN yarn install

# Build App
RUN yarn build

# Copy Backend resources over
ENTRYPOINT [ "./docker-entrypoint.sh" ]