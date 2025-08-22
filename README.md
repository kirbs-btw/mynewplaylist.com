# MyNewPlaylist.com

A modern music playlist application with AI-powered song recommendations using vector embeddings.

## Features

- 🎵 **Smart Search**: Advanced full-text search for songs and artists
- 📝 **Playlist Builder**: Create and manage your custom playlists
- 🤖 **AI Recommendations**: Get intelligent song suggestions based on your playlist
- 🎸 **Spotify Integration**: Direct links to listen on Spotify
- 🎨 **Modern UI**: Beautiful glass-morphism design with smooth animations
- 📱 **Responsive**: Works perfectly on desktop and mobile devices

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Docker Desktop running (for Windows/Mac)

### Launch Everything

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Database**: localhost:5432

## Architecture

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: FastAPI + PostgreSQL with pgvector
- **Database**: PostgreSQL 16 with pgvector extension for similarity search
- **Containerization**: Docker with multi-stage builds for production

## Development

### Frontend Development

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

### Backend Development

```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Start development server
uvicorn main:app --reload
```

### Database Access

```bash
# Connect to the database
psql -h localhost -U postgres -d vectordemo
# Password: secret
```

## Production Deployment

```bash
# Deploy to production
./deploy.sh

chmod +x setup-ssl.sh
./setup-ssl.sh mynewplaylist.com
```

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

### Individual service rebuilds
```bash
docker-compose up --build -d frontend
docker-compose up --build -d backend
docker-compose up --build -d db
```

## Project Structure

```
mynewplaylist.com/
├── frontend/           # React application
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── services/   # API services
│   │   └── types/      # TypeScript definitions
│   ├── public/         # Static assets
│   └── Dockerfile      # Frontend container
├── backend/            # FastAPI application
│   ├── main.py         # API endpoints
│   └── requirements.txt
├── database/           # Database setup and utilities
├── docker-compose.yml  # Development environment
└── docker-compose.prod.yml # Production environment
```

## API Endpoints

- `GET /search-advanced/` - Search for songs
- `GET /recommend-average/` - Get AI recommendations
- `GET /` - Health check

## Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: FastAPI, Python
- **Database**: PostgreSQL, pgvector
- **AI/ML**: Vector embeddings for similarity search
- **Deployment**: Docker, Nginx 

# To dos for the website
- fix SEO
- make phone version better 
- have own corporate identity instead of that AI slop