# MyNewPlaylist.com

A music playlist application with AI-powered song recommendations using vector embeddings.

## Features

- 🎵 Search for songs using advanced full-text search
- 📋 Create and manage your playlist
- 🤖 Get AI-powered song recommendations based on your playlist
- 🎸 Direct Spotify integration for listening

## Quick Start (Docker)

### Prerequisites
- Docker and Docker Compose installed
- Docker Desktop running (for Windows/Mac)

### Launch Everything

## Architecture

- **Frontend**: React + TypeScript + Vite
- **Backend**: FastAPI + PostgreSQL with pgvector
- **Database**: PostgreSQL 16 with pgvector extension for similarity search

## Development

## Ports

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- PostgreSQL: localhost:5432

## Troubleshooting

### View logs
```bash
docker-compose logs -f
```

### Rebuild from scratch
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```


# mynewplaylist.com
This repo is deploying a recommendation model. onto a frontend with fastapi, postgres + vectorpg and react 


The architecture will look like that: 
taking the CBOW model vectors and transfering them into a vector database
--> faster access and additional information on spot

Having a PostgreSQL + pgvector as a database

Then having a frontend build up with 
React there


## setup 
Composing up everything connectedto the project
```bash
docker compose up -d
```

connecting to the database (wip password secret) 
```bash
psql -h localhost -U postgres -d vectordemo
```


## debuging
docker-compose up --build -d frontend
docker-compose up --build -d backend
docker-compose up --build -d db


## prod setup
```sh
./deploy.sh
```

## wip 
fix quality 
changing the buttons 
