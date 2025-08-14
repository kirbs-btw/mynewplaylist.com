# Analytics System for MyNewPlaylist

This document outlines the comprehensive analytics system implemented to track user behavior, playlist creation, and application performance.

## 🚀 **What We Track**

### **User Sessions & Engagement**
- **Session Management**: Start/end times, duration, page views
- **Device Information**: Mobile vs desktop, user agent, IP address
- **Geographic Data**: Country code, city (if available)
- **Page Views**: Time spent on each page, navigation patterns

### **Playlist Analytics**
- **Playlist Creation**: Number of songs, creation time, public/private status
- **Song Interactions**: Add/remove songs, play counts, likes/dislikes
- **Playlist Evolution**: How playlists change over time
- **Genre & Mood Analysis**: Musical preferences and patterns

### **Search & Discovery**
- **Search Queries**: What users are searching for
- **Search Results**: Number of results, click-through rates
- **Search Performance**: Response times, result relevance
- **Search Patterns**: Popular terms, seasonal trends

### **Recommendation Analytics**
- **AI Recommendations**: What songs are suggested
- **User Acceptance**: Which recommendations users accept/reject
- **Algorithm Performance**: Response times, accuracy metrics
- **Source Analysis**: Which songs lead to better recommendations

### **Performance & Errors**
- **Application Performance**: Load times, response times
- **Error Tracking**: Error types, frequency, user impact
- **User Experience**: Page load performance, interaction delays

## 📊 **Data Points Collected**

### **Session Data**
```typescript
{
  session_id: string;
  user_id: string;
  ip_address: string;
  user_agent: string;
  referrer: string;
  created_at: timestamp;
  last_activity: timestamp;
  session_duration: interval;
  page_views: number;
  is_mobile: boolean;
  country_code: string;
  city: string;
}
```

### **Playlist Data**
```typescript
{
  playlist_id: string;
  session_id: string;
  playlist_name: string;
  song_count: number;
  created_at: timestamp;
  updated_at: timestamp;
  is_public: boolean;
  total_duration: interval;
  genres: string[];
  mood: string;
  energy_level: number;
}
```

### **Song Interaction Data**
```typescript
{
  interaction_id: string;
  session_id: string;
  playlist_id: string;
  track_id: string;
  interaction_type: 'add' | 'remove' | 'play' | 'like' | 'dislike';
  created_at: timestamp;
  interaction_duration: interval;
  position_in_playlist: number;
}
```

### **Search Query Data**
```typescript
{
  search_id: string;
  session_id: string;
  query_text: string;
  results_count: number;
  clicked_song_id: string;
  search_duration: interval;
  created_at: timestamp;
  search_type: 'text' | 'semantic' | 'advanced';
}
```

## 🔧 **How to Use Analytics**

### **Frontend Integration**

1. **Import Analytics Service**
```typescript
import { analytics, trackSongAdded, trackPlaylistUpdated } from '../services/analytics';
```

2. **Track Page Views**
```typescript
// Automatically tracked on component mount
useEffect(() => {
  analytics.trackPageView('/playlist', 'My Playlist');
}, []);
```

3. **Track Song Interactions**
```typescript
// When adding a song to playlist
const handleAddSong = (song: Song) => {
  addToPlaylist(song);
  trackSongAdded(song, playlist.length + 1);
};

// When removing a song
const handleRemoveSong = (songId: string) => {
  removeFromPlaylist(songId);
  analytics.trackSongInteraction(songId, 'remove', playlistId, position);
};
```

4. **Track Playlist Updates**
```typescript
// When playlist changes
useEffect(() => {
  if (playlist.length > 0) {
    trackPlaylistUpdated(playlist.length);
  }
}, [playlist]);
```

5. **Track Search Queries**
```typescript
const handleSearch = async (query: string) => {
  const results = await searchSongs(query);
  analytics.trackSearchWithResults(query, results.length);
};
```

6. **Track Recommendations**
```typescript
const handleGetRecommendations = async () => {
  const startTime = Date.now();
  const recommendations = await getRecommendations(songIds);
  const responseTime = (Date.now() - startTime) / 1000;
  
  analytics.trackRecommendations(
    songIds,
    recommendations.map(r => r.track_id),
    [], // accepted songs
    [], // rejected songs
    undefined, // playlist id
    responseTime
  );
};
```

### **Backend Analytics Endpoints**

All analytics endpoints are available under `/analytics/`:

- `POST /analytics/session/start` - Start new session
- `POST /analytics/session/end` - End session
- `POST /analytics/pageview` - Track page view
- `POST /analytics/playlist/create` - Track playlist creation
- `POST /analytics/song/interaction` - Track song interactions
- `POST /analytics/search/query` - Track search queries
- `POST /analytics/recommendations/request` - Track recommendations
- `POST /analytics/error` - Track errors
- `POST /analytics/performance` - Track performance metrics

### **Dashboard Endpoints**

- `GET /analytics/dashboard/daily-stats` - Daily statistics
- `GET /analytics/dashboard/popular-songs` - Most popular songs
- `GET /analytics/dashboard/search-trends` - Search trends
- `GET /analytics/dashboard/session-metrics` - Session metrics

## 📈 **Analytics Dashboard**

The analytics dashboard provides:

### **Key Metrics**
- **Sessions Today**: Total active sessions
- **Total Playlists**: Cumulative playlist creation
- **Avg Session Duration**: User engagement time
- **Total Searches**: Search activity volume

### **Charts & Visualizations**
- **Sessions & Playlists Over Time**: Line chart showing trends
- **Daily Interactions**: Bar chart of user activity
- **Device Distribution**: Doughnut chart of mobile vs desktop
- **Popular Songs**: Ranking of most interacted songs

### **Data Tables**
- **Search Trends**: Popular queries with click rates
- **Popular Songs**: Most engaged songs with interaction counts

## 🛡️ **Privacy & Data Protection**

### **Anonymous Tracking**
- No personal information is collected
- Session IDs are randomly generated
- IP addresses are stored but not linked to personal data
- All tracking is opt-in and transparent

### **Data Retention**
- Analytics data is stored for analysis purposes
- Old data can be automatically purged
- Users can request data deletion
- Compliance with GDPR and privacy regulations

### **Data Security**
- All data is encrypted in transit
- Database access is restricted
- No third-party analytics services
- Data is stored securely in your own database

## 🔍 **Business Insights**

### **User Behavior Analysis**
- **Engagement Patterns**: When users are most active
- **Feature Usage**: Which features are most popular
- **User Journey**: How users navigate the application
- **Retention Metrics**: How often users return

### **Content Performance**
- **Popular Songs**: What music users prefer
- **Search Effectiveness**: How well search works
- **Recommendation Quality**: AI algorithm performance
- **Content Discovery**: How users find new music

### **Technical Performance**
- **Application Speed**: Response times and performance
- **Error Rates**: System reliability and stability
- **User Experience**: Page load times and interactions
- **Scalability**: System performance under load

## 🚀 **Getting Started**

### **1. Database Setup**
Run the analytics tables creation script:
```sql
\i database/setup/analytics_tables.ddl
```

### **2. Backend Integration**
The analytics router is automatically included in your FastAPI app.

### **3. Frontend Integration**
Import and use the analytics service in your components.

### **4. Dashboard Access**
Add the AnalyticsDashboard component to your app for viewing data.

### **5. Data Collection**
Start collecting data by using the tracking functions in your components.

## 📊 **Sample Queries**

### **Daily Active Users**
```sql
SELECT 
  DATE(created_at) as date,
  COUNT(DISTINCT session_id) as daily_active_users
FROM analytics.user_sessions 
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### **Most Popular Genres**
```sql
SELECT 
  unnest(genres) as genre,
  COUNT(*) as playlist_count
FROM analytics.playlists 
WHERE genres IS NOT NULL
GROUP BY genre
ORDER BY playlist_count DESC;
```

### **User Engagement by Device**
```sql
SELECT 
  is_mobile,
  COUNT(*) as session_count,
  AVG(EXTRACT(EPOCH FROM session_duration)) as avg_duration_seconds
FROM analytics.user_sessions 
WHERE session_duration IS NOT NULL
GROUP BY is_mobile;
```

## 🔮 **Future Enhancements**

- **Real-time Analytics**: Live dashboard updates
- **Advanced Segmentation**: User behavior analysis
- **Predictive Analytics**: User preference prediction
- **A/B Testing**: Feature performance comparison
- **Export Functionality**: Data export for external analysis
- **Custom Dashboards**: User-configurable analytics views

---

*This analytics system provides comprehensive insights into user behavior, helping you understand how users interact with your music application and make data-driven decisions for improvements.*
