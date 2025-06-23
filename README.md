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

**Windows:**
```bash
start.bat
```

**Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

This will:
1. Build all containers (database, backend, frontend)
2. Start all services
3. Set up the PostgreSQL database with pgvector extension
4. Make the application available at http://localhost:3000

### Stop Everything

**Windows:**
```bash
stop.bat
```

**Linux/Mac:**
```bash
docker-compose down
```

## Architecture

- **Frontend**: React + TypeScript + Vite
- **Backend**: FastAPI + PostgreSQL with pgvector
- **Database**: PostgreSQL 16 with pgvector extension for similarity search

## Development

### Backend Only
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend Only
```bash
cd frontend
npm install
npm run dev
```

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

### Database issues
The database is automatically initialized with the schema from `init.sql`. If you need to reset:
```bash
docker-compose down -v  # This removes the database volume
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


## numbers 
rows: 2.7m 
index build time: 25min - hnsw
recall: ? 
