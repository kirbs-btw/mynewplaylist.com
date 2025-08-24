-- See all analytics tables
\dt analytics.*

-- Daily active users
SELECT 
  DATE(created_at) as date,
  COUNT(DISTINCT session_id) as daily_active_users
FROM analytics.user_sessions 
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Most popular songs
SELECT 
  track_name, 
  artist_name, 
  COUNT(*) as interaction_count
FROM analytics.song_interactions 
GROUP BY track_id, track_name, artist_name
ORDER BY interaction_count DESC
LIMIT 10;

-- User engagement by device
SELECT 
  is_mobile,
  COUNT(*) as session_count,
  AVG(EXTRACT(EPOCH FROM session_duration)) as avg_duration_seconds
FROM analytics.user_sessions 
WHERE session_duration IS NOT NULL
GROUP BY is_mobile;