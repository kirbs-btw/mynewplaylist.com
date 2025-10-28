# MyNewPlaylist.com

A modern music playlist application with AI-powered song recommendations using vector embeddings and personalized user accounts.

## Features

- 🎵 **Smart Search**: Advanced full-text search for songs and artists
- 📝 **Playlist Builder**: Create and manage your custom playlists
- 🤖 **AI Recommendations**: Get intelligent song suggestions based on your playlist
- 🎸 **Streaming Service Integration**: Connect to Spotify, Apple Music, and more
- 🎨 **Modern UI**: Beautiful glass-morphism design with smooth animations
- 📱 **Responsive**: Works perfectly on desktop and mobile devices
- 👤 **User Accounts**: Personalized experience with saved playlists and preferences
- 🔐 **Secure Authentication**: Multiple login options with OAuth integration
- 📊 **Personal Analytics**: Track your listening habits and playlist evolution
- 🌐 **Social Features**: Share playlists and discover music from friends

## Account Concept & User Experience

### 🚀 **Getting Started with Your Account**

#### **1. Quick Sign-Up Options**
- **Email/Password**: Traditional account creation
- **Google OAuth**: One-click sign-in with Google
- **Facebook OAuth**: Connect your Facebook account
- **Apple Sign-In**: Seamless iOS integration
- **Guest Mode**: Try before you commit (limited features)

#### **2. Personalization Features**
- **Music Profile**: Set your favorite genres, artists, and mood preferences
- **Listening History**: Track what you've discovered and enjoyed
- **Custom Recommendations**: AI learns from your taste and suggests new music
- **Playlist Collections**: Organize playlists by mood, occasion, or theme

#### **3. Enhanced Playlist Experience**
- **Private Playlists**: Keep personal collections just for you
- **Public Playlists**: Share your musical taste with the world
- **Collaborative Playlists**: Invite friends to contribute songs
- **Playlist Analytics**: See which songs are most popular in your playlists
- **Export Options**: Download playlists for offline use or import to streaming services

### 🔗 **Streaming Service Integration**

#### **Connected Services**
- **Spotify**: Full integration with your Spotify library and playlists
- **Apple Music**: Sync with your Apple Music collection
- **YouTube Music**: Access YouTube's vast music catalog
- **Amazon Music**: Connect your Amazon Music account
- **Tidal**: High-quality streaming integration

#### **Cross-Platform Sync**
- **Unified Library**: See all your music in one place
- **Smart Sync**: Automatically sync playlists across platforms
- **Offline Access**: Download playlists for offline listening
- **Queue Management**: Control playback across all connected services

### 👥 **Social & Discovery Features**

#### **Community Features**
- **Follow Friends**: See what your friends are listening to
- **Music Groups**: Join communities based on genres or interests
- **Playlist Sharing**: Share your creations and discover others
- **Music Challenges**: Participate in themed playlist competitions
- **Collaborative Discovery**: Create group playlists with friends

#### **Discovery & Recommendations**
- **Friend Recommendations**: Get suggestions based on friends' tastes
- **Trending Playlists**: See what's popular in the community
- **Genre Exploration**: Discover new music through curated collections
- **Mood-Based Discovery**: Find music that matches your current vibe
- **Seasonal Collections**: Themed playlists for holidays and seasons

### 📊 **Personal Analytics & Insights**

#### **Listening Analytics**
- **Playlist Statistics**: Track your most-played songs and artists
- **Genre Evolution**: See how your music taste changes over time
- **Discovery Rate**: Monitor how many new artists you discover monthly
- **Listening Patterns**: Analyze when and how you listen to music
- **Mood Tracking**: Correlate music choices with your daily moods

#### **Music Intelligence**
- **Taste Profile**: Detailed analysis of your musical preferences
- **Compatibility Scores**: See how well you match with other users
- **Recommendation Accuracy**: Rate how well our AI suggestions work for you
- **Discovery Insights**: Learn about your music exploration patterns

### 🔐 **Security & Privacy**

#### **Account Security**
- **Two-Factor Authentication**: Extra security for your account
- **Password Management**: Secure password storage and recovery
- **Session Management**: Control active sessions across devices
- **Privacy Controls**: Choose what information to share publicly
- **Data Export**: Download your data anytime

#### **Privacy Features**
- **Private Mode**: Browse without affecting your recommendations
- **Anonymous Listening**: Listen without saving to your history
- **Selective Sharing**: Choose which playlists to make public
- **Friend Privacy**: Control who can see your activity
- **Data Retention**: Choose how long to keep your listening data

## Quick Start

### Authentication Setup (Supabase + Google)
1. Create a Supabase project and enable the Google provider under **Authentication -> Providers**. Note the project URL, anon key, and JWT secret.
2. Populate the new environment variables in `.env`, `env.production.template`, and your deployment secrets:
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
   - `SUPABASE_JWT_SECRET`
   - `SUPABASE_JWT_AUDIENCE` (defaults to `authenticated`)
   - `REACT_APP_ANON_RECOMMENDATION_LIMIT` / `REACT_APP_AUTH_RECOMMENDATION_LIMIT`
   - `ANON_RECOMMENDATION_LIMIT` / `AUTH_RECOMMENDATION_LIMIT`
3. In Supabase Auth settings, add your local and production redirect URLs (e.g. `http://localhost:3000`, `http://localhost:3000/auth/v1/callback`, `https://mynewplaylist.com`).
4. Install the new dependencies and restart the stack:
   - Frontend: `npm install` (pulls `@supabase/supabase-js`).
   - Backend: `pip install -r backend/requirements.txt` (adds `PyJWT`).
5. Deploy: surface the same variables in production (Docker secrets, hosting provider, etc.) and verify Google sign-in end-to-end before raising limits.

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
- **Authentication**: JWT tokens with OAuth integration
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
│   │   ├── auth/       # Authentication components
│   │   ├── profile/    # User profile components
│   │   └── types/      # TypeScript definitions
│   ├── public/         # Static assets
│   └── Dockerfile      # Frontend container
├── backend/            # FastAPI application
│   ├── main.py         # API endpoints
│   ├── auth/           # Authentication logic
│   ├── users/          # User management
│   ├── playlists/      # Playlist management
│   └── requirements.txt
├── database/           # Database setup and utilities
├── docker-compose.yml  # Development environment
└── docker-compose.prod.yml # Production environment
```

## API Endpoints

### **Public Endpoints**
- `GET /search-advanced/` - Search for songs
- `GET /recommend-average/` - Get AI recommendations
- `GET /` - Health check

### **Authentication Endpoints**
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh JWT token
- `POST /auth/logout` - User logout
- `POST /auth/oauth/{provider}` - OAuth authentication

### **User Management**
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile
- `GET /users/playlists` - Get user playlists
- `POST /users/playlists` - Create new playlist
- `PUT /users/playlists/{id}` - Update playlist
- `DELETE /users/playlists/{id}` - Delete playlist

### **Social Features**
- `GET /users/{id}/profile` - View public user profile
- `POST /users/follow/{id}` - Follow a user
- `DELETE /users/follow/{id}` - Unfollow a user
- `GET /users/following` - Get following list
- `GET /users/followers` - Get followers list

## Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: FastAPI, Python, SQLAlchemy
- **Database**: PostgreSQL, pgvector
- **Authentication**: JWT, OAuth 2.0, Passlib
- **AI/ML**: Vector embeddings for similarity search
- **Deployment**: Docker, Nginx, Redis (session storage)

## User Journey Examples

### 🎯 **New User Experience**
1. **Landing Page**: Discover the app's features and benefits
2. **Quick Sign-Up**: Choose from multiple authentication options
3. **Music Profile Setup**: Select favorite genres and artists
4. **First Playlist**: Create your first playlist with guided assistance
5. **Discovery**: Receive personalized recommendations based on your profile

### 🎵 **Daily Music Discovery**
1. **Morning Routine**: Check daily music recommendations
2. **Mood-Based Selection**: Choose music that matches your current mood
3. **Social Discovery**: See what friends are listening to
4. **Playlist Creation**: Build new playlists for different activities
5. **Analytics Review**: Track your listening patterns and discoveries

### 🌟 **Power User Features**
1. **Advanced Analytics**: Deep insights into your music taste
2. **Community Building**: Create and moderate music groups
3. **Playlist Curation**: Build themed collections for different audiences
4. **Cross-Platform Sync**: Manage music across all streaming services
5. **API Access**: Use our API for custom integrations

## Future Roadmap

### **Phase 1: Core Account System**
- [x] User registration and authentication
- [x] Basic profile management
- [x] Playlist creation and management
- [x] AI recommendations

### **Phase 2: Social Features**
- [ ] Playlist sharing and collaboration 
- [ ] Community features and groups
- ([ ] Social discovery algorithms) 

### **Phase 3: Advanced Integration**
- [ ] Multiple streaming service connections
- [ ] Cross-platform playlist sync
- [ ] Advanced analytics and insights
- [ ] Mobile app development

### **Phase 4: Enterprise Features**
- [ ] Business accounts for music venues

---

# To dos for the website
- ✅ **Account System**: Implement user authentication and profiles
- ✅ **OAuth Integration**: Google, Facebook, Apple sign-in
- ✅ **Streaming Service Connections**: Spotify, Apple Music, etc.
- 🔄 **Mobile Optimization**: Improve phone version
- 🔄 **Corporate Identity**: Develop unique brand identity
- 🔄 **Analytics Bug Fixes**: Resolve tracking issues
- 🔄 **Social Features**: Implement friend system and sharing
