FROM node:12

# Install texlive
RUN apt-get update \
    && apt-get install -y \
    texlive-full \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install upstream pandoc
ENV PANDOC_VERSION 2.6
RUN wget https://github.com/jgm/pandoc/releases/download/${PANDOC_VERSION}/pandoc-${PANDOC_VERSION}-1-amd64.deb && \
    dpkg -i pandoc-*-amd64.deb
RUN wget https://github.com/lierdakil/pandoc-crossref/releases/download/v0.3.3.0/linux-ghc84-pandoc23.tar.gz -q -O - | tar xz && \
    mv pandoc-crossref /usr/bin/

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

ENV resources /www/app/data
COPY resources ${resources}


# Running the typescript compiler
RUN npm run build

EXPOSE 3030
CMD [ "npm", "start" ]