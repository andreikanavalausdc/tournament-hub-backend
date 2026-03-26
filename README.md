# Tournament Hub Backend
<p style="text-align: center;">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# How to start the project

## What is needed to start the project

- Git - [Download & Install Git](https://git-scm.com/downloads).
- Node.js - [Download & Install Node.js](https://nodejs.org/en/download/) (version 22.20.0) and the npm package manager.
- Docker Desktop - [Download & Install Docker Desktop](https://hub.docker.com/repository/docker/fresemin/music-service-db/general)


## Clone the project
```bash
git clone https://github.com/andreikanavalausdc/tournament-hub-backend.git
```

## Set environments

1. Create `.env` in the source folder
2. Copy variables from `.env.example`
3. Set values for these variables

## Launching docker containers
```bash
npm run docker:up
```
## Installing the right version of Node.js (if this version has already been downloaded, skip the first command)
```bash
nvm install 22.20.0
nvm use 22.20.0
```
## Dependency installation
```bash
npm ci
```

## Starting PostgresSQL migrations
```bash
npm run mig:run
```

## Starting the application
```bash
npm run start:dev
```

## Swagger path by default
`http://localhost:{PORT}/api#/`