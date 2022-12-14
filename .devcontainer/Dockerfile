ARG NODE_VERSION
FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:0-${NODE_VERSION}

ARG NPM_VERSION

# Update APT
RUN apt upgrade -y \
    && apt update -y

# Update NPM
RUN npm install -g npm@${NPM_VERSION}

# Update Yarn
RUN apt install -y \
    yarn