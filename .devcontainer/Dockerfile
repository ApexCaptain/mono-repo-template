ARG NODE_VERSION
FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:0-${NODE_VERSION}

# Update APT
RUN apt upgrade -y \
    && apt update -y

# Update NPM
RUN npm install -g npm@latest

# Install APT Packages
RUN apt install -y \
    yarn \
    maven \
    openjdk-11-jdk