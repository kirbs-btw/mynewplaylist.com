# MyNewPlaylist Frontend

A modern, responsive React application for creating AI-powered playlists.

## Features

- 🎵 Search for songs and artists
- 📝 Build custom playlists
- 🤖 AI-powered song recommendations
- 🎨 Modern, glass-morphism UI design
- 📱 Fully responsive design
- ⚡ Fast and smooth animations

## Tech Stack

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Vite** for fast development
- **Docker** for containerization

## Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The app will be available at `http://localhost:3000`

### Docker Development

```bash
# From the project root
docker-compose up frontend
```

## Building for Production

### Local Build

```bash
npm run build
```

### Docker Production Build

```bash
# From the project root
docker-compose -f docker-compose.prod.yml up --build
```

## Environment Variables

- `REACT_APP_API_URL`: Backend API URL (defaults to proxy in development)

## Project Structure

```
src/
├── components/          # React components
│   ├── SearchBar.tsx
│   ├── SongCard.tsx
│   ├── PlaylistSection.tsx
│   └── RecommendationsSection.tsx
├── services/           # API services
│   └── api.ts
├── types/              # TypeScript type definitions
│   └── types.ts
├── App.tsx             # Main app component
├── index.tsx           # App entry point
└── index.css           # Global styles
```

## API Integration

The frontend communicates with the backend API for:
- Song search (`/search-advanced/`)
- AI recommendations (`/recommend-average/`)

## Styling

The app uses Tailwind CSS with custom components and animations:
- Glass-morphism effects
- Smooth hover animations
- Responsive design
- Dark theme with gradient backgrounds 