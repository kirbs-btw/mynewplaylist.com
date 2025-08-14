-- Analytics Schema for MyNewPlaylist
CREATE SCHEMA IF NOT EXISTS analytics;

-- User Sessions Table
CREATE TABLE analytics.user_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT, -- Anonymous user identifier
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_duration INTERVAL,
    page_views INTEGER DEFAULT 0,
    is_mobile BOOLEAN DEFAULT FALSE,
    country_code VARCHAR(2),
    city TEXT
);

-- Page Views Table
CREATE TABLE analytics.page_views (
    view_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES analytics.user_sessions(session_id) ON DELETE CASCADE,
    page_path TEXT NOT NULL,
    page_title TEXT,
    referrer TEXT,
    view_duration INTERVAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Playlist Analytics Table
CREATE TABLE analytics.playlists (
    playlist_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES analytics.user_sessions(session_id) ON DELETE CASCADE,
    playlist_name TEXT,
    song_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_public BOOLEAN DEFAULT FALSE,
    total_duration INTERVAL,
    genres TEXT[],
    mood TEXT,
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10)
);

-- Song Interactions Table
CREATE TABLE analytics.song_interactions (
    interaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES analytics.user_sessions(session_id) ON DELETE CASCADE,
    playlist_id UUID REFERENCES analytics.playlists(playlist_id) ON DELETE CASCADE,
    track_id TEXT REFERENCES b25.songs(track_id),
    interaction_type TEXT CHECK (interaction_type IN ('add', 'remove', 'play', 'like', 'dislike')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    interaction_duration INTERVAL,
    position_in_playlist INTEGER
);

-- Search Analytics Table
CREATE TABLE analytics.search_queries (
    search_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES analytics.user_sessions(session_id) ON DELETE CASCADE,
    query_text TEXT NOT NULL,
    results_count INTEGER,
    clicked_song_id TEXT REFERENCES b25.songs(track_id),
    search_duration INTERVAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    search_type TEXT DEFAULT 'text' CHECK (search_type IN ('text', 'semantic', 'advanced'))
);

-- Recommendation Analytics Table
CREATE TABLE analytics.recommendations (
    recommendation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES analytics.user_sessions(session_id) ON DELETE CASCADE,
    playlist_id UUID REFERENCES analytics.playlists(playlist_id) ON DELETE CASCADE,
    source_song_ids TEXT[],
    recommended_song_ids TEXT[],
    accepted_song_ids TEXT[],
    rejected_song_ids TEXT[],
    recommendation_algorithm TEXT DEFAULT 'embedding_average',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    response_time INTERVAL
);

-- User Engagement Metrics Table
CREATE TABLE analytics.user_engagement (
    engagement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES analytics.user_sessions(session_id) ON DELETE CASCADE,
    metric_name TEXT NOT NULL,
    metric_value NUMERIC,
    metric_unit TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Error Tracking Table
CREATE TABLE analytics.errors (
    error_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES analytics.user_sessions(session_id) ON DELETE SET NULL,
    error_type TEXT NOT NULL,
    error_message TEXT,
    stack_trace TEXT,
    user_agent TEXT,
    page_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance Metrics Table
CREATE TABLE analytics.performance (
    performance_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES analytics.user_sessions(session_id) ON DELETE SET NULL,
    metric_name TEXT NOT NULL,
    metric_value NUMERIC,
    metric_unit TEXT DEFAULT 'ms',
    page_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_user_sessions_user_id ON analytics.user_sessions(user_id);
CREATE INDEX idx_user_sessions_created_at ON analytics.user_sessions(created_at);
CREATE INDEX idx_user_sessions_country ON analytics.user_sessions(country_code);

CREATE INDEX idx_page_views_session_id ON analytics.page_views(session_id);
CREATE INDEX idx_page_views_created_at ON analytics.page_views(created_at);
CREATE INDEX idx_page_views_page_path ON analytics.page_views(page_path);

CREATE INDEX idx_playlists_session_id ON analytics.playlists(session_id);
CREATE INDEX idx_playlists_created_at ON analytics.playlists(created_at);

CREATE INDEX idx_song_interactions_session_id ON analytics.song_interactions(session_id);
CREATE INDEX idx_song_interactions_track_id ON analytics.song_interactions(track_id);
CREATE INDEX idx_song_interactions_created_at ON analytics.song_interactions(created_at);

CREATE INDEX idx_search_queries_session_id ON analytics.search_queries(session_id);
CREATE INDEX idx_search_queries_query_text ON analytics.search_queries(query_text);
CREATE INDEX idx_search_queries_created_at ON analytics.search_queries(created_at);

CREATE INDEX idx_recommendations_session_id ON analytics.recommendations(session_id);
CREATE INDEX idx_recommendations_created_at ON analytics.recommendations(created_at);

-- Create views for common analytics queries
CREATE VIEW analytics.daily_stats AS
SELECT 
    DATE(created_at) as date,
    COUNT(DISTINCT session_id) as unique_sessions,
    COUNT(DISTINCT playlist_id) as playlists_created,
    COUNT(DISTINCT track_id) as unique_songs_added,
    AVG(song_count) as avg_playlist_size,
    COUNT(*) as total_interactions
FROM analytics.user_sessions us
LEFT JOIN analytics.playlists p ON us.session_id = p.session_id
LEFT JOIN analytics.song_interactions si ON us.session_id = si.session_id
GROUP BY DATE(created_at)
ORDER BY date DESC;

CREATE VIEW analytics.popular_songs AS
SELECT 
    si.track_id,
    s.track_name,
    s.artist_name,
    COUNT(*) as interaction_count,
    COUNT(CASE WHEN si.interaction_type = 'add' THEN 1 END) as add_count,
    COUNT(CASE WHEN si.interaction_type = 'remove' THEN 1 END) as remove_count
FROM analytics.song_interactions si
JOIN b25.songs s ON si.track_id = s.track_id
GROUP BY si.track_id, s.track_name, s.artist_name
ORDER BY interaction_count DESC;

CREATE VIEW analytics.search_trends AS
SELECT 
    query_text,
    COUNT(*) as search_count,
    AVG(results_count) as avg_results,
    COUNT(CASE WHEN clicked_song_id IS NOT NULL THEN 1 END) as click_count
FROM analytics.search_queries
GROUP BY query_text
HAVING COUNT(*) > 1
ORDER BY search_count DESC;
