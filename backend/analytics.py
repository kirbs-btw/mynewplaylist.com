from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import psycopg
import os
import uuid
from datetime import datetime, timedelta
import json
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/analytics", tags=["analytics"])

DATABASE_URL = os.environ["DATABASE_URL"]

# Pydantic models for analytics data
class SessionData(BaseModel):
    user_id: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    referrer: Optional[str] = None
    is_mobile: Optional[bool] = False
    country_code: Optional[str] = None
    city: Optional[str] = None

class PageViewData(BaseModel):
    session_id: str
    page_path: str
    page_title: Optional[str] = None
    referrer: Optional[str] = None
    view_duration: Optional[float] = None

class PlaylistData(BaseModel):
    session_id: str
    playlist_name: Optional[str] = None
    song_count: int
    is_public: bool = False
    genres: Optional[List[str]] = None
    mood: Optional[str] = None
    energy_level: Optional[int] = None

class SongInteractionData(BaseModel):
    session_id: str
    playlist_id: Optional[str] = None
    track_id: str
    interaction_type: str  # 'add', 'remove', 'play', 'like', 'dislike'
    interaction_duration: Optional[float] = None
    position_in_playlist: Optional[int] = None

class SearchQueryData(BaseModel):
    session_id: str
    query_text: str
    results_count: Optional[int] = None
    clicked_song_id: Optional[str] = None
    search_duration: Optional[float] = None
    search_type: str = 'text'

class RecommendationData(BaseModel):
    session_id: str
    playlist_id: Optional[str] = None
    source_song_ids: List[str]
    recommended_song_ids: List[str]
    accepted_song_ids: Optional[List[str]] = None
    rejected_song_ids: Optional[List[str]] = None
    recommendation_algorithm: str = 'embedding_average'
    response_time: Optional[float] = None

class ErrorData(BaseModel):
    session_id: Optional[str] = None
    error_type: str
    error_message: str
    stack_trace: Optional[str] = None
    user_agent: Optional[str] = None
    page_path: Optional[str] = None

class PerformanceData(BaseModel):
    session_id: Optional[str] = None
    metric_name: str
    metric_value: float
    metric_unit: str = 'ms'
    page_path: Optional[str] = None

# Helper function to get client IP
def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"

# Helper function to detect mobile
def is_mobile_device(user_agent: str) -> bool:
    mobile_keywords = ['mobile', 'android', 'iphone', 'ipad', 'blackberry', 'windows phone']
    return any(keyword in user_agent.lower() for keyword in mobile_keywords)

# Analytics endpoints
@router.post("/session/start")
async def start_session(request: Request, session_data: SessionData):
    """Start a new user session"""
    try:
        with psycopg.connect(DATABASE_URL) as conn:
            with conn.cursor() as cur:
                # Generate session ID if not provided
                session_id = str(uuid.uuid4())
                
                # Get client IP
                ip_address = session_data.ip_address or get_client_ip(request)
                
                # Get user agent
                user_agent = session_data.user_agent or request.headers.get("User-Agent", "")
                
                # Detect mobile
                is_mobile = session_data.is_mobile or is_mobile_device(user_agent)
                
                cur.execute("""
                    INSERT INTO analytics.user_sessions 
                    (session_id, user_id, ip_address, user_agent, referrer, is_mobile, country_code, city)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING session_id
                """, (
                    session_id,
                    session_data.user_id,
                    ip_address,
                    user_agent,
                    session_data.referrer,
                    is_mobile,
                    session_data.country_code,
                    session_data.city
                ))
                
                conn.commit()
                return {"session_id": session_id, "status": "started"}
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start session: {str(e)}")

@router.post("/session/end")
async def end_session(session_id: str):
    """End a user session and calculate duration"""
    try:
        with psycopg.connect(DATABASE_URL) as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    UPDATE analytics.user_sessions 
                    SET session_duration = NOW() - created_at,
                        last_activity = NOW()
                    WHERE session_id = %s
                    RETURNING session_id
                """, (session_id,))
                
                if cur.fetchone():
                    conn.commit()
                    return {"status": "session_ended"}
                else:
                    raise HTTPException(status_code=404, detail="Session not found")
                    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to end session: {str(e)}")

@router.post("/pageview")
async def track_pageview(pageview_data: PageViewData):
    """Track a page view"""
    try:
        with psycopg.connect(DATABASE_URL) as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO analytics.page_views 
                    (session_id, page_path, page_title, referrer, view_duration)
                    VALUES (%s, %s, %s, %s, %s)
                """, (
                    pageview_data.session_id,
                    pageview_data.page_path,
                    pageview_data.page_title,
                    pageview_data.referrer,
                    timedelta(seconds=pageview_data.view_duration) if pageview_data.view_duration else None
                ))
                
                # Update session page view count
                cur.execute("""
                    UPDATE analytics.user_sessions 
                    SET page_views = page_views + 1,
                        last_activity = NOW()
                    WHERE session_id = %s
                """, (pageview_data.session_id,))
                
                conn.commit()
                return {"status": "pageview_tracked"}
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to track pageview: {str(e)}")

@router.post("/playlist/create")
async def track_playlist_creation(playlist_data: PlaylistData):
    """Track playlist creation"""
    try:
        with psycopg.connect(DATABASE_URL) as conn:
            with conn.cursor() as cur:
                playlist_id = str(uuid.uuid4())
                
                cur.execute("""
                    INSERT INTO analytics.playlists 
                    (playlist_id, session_id, playlist_name, song_count, is_public, genres, mood, energy_level)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING playlist_id
                """, (
                    playlist_id,
                    playlist_data.session_id,
                    playlist_data.playlist_name,
                    playlist_data.song_count,
                    playlist_data.is_public,
                    playlist_data.genres,
                    playlist_data.mood,
                    playlist_data.energy_level
                ))
                
                conn.commit()
                return {"playlist_id": playlist_id, "status": "playlist_tracked"}
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to track playlist: {str(e)}")

@router.post("/song/interaction")
async def track_song_interaction(interaction_data: SongInteractionData):
    """Track song interactions (add, remove, play, etc.)"""
    try:
        with psycopg.connect(DATABASE_URL) as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO analytics.song_interactions 
                    (session_id, playlist_id, track_id, interaction_type, interaction_duration, position_in_playlist)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (
                    interaction_data.session_id,
                    interaction_data.playlist_id,
                    interaction_data.track_id,
                    interaction_data.interaction_type,
                    timedelta(seconds=interaction_data.interaction_duration) if interaction_data.interaction_duration else None,
                    interaction_data.position_in_playlist
                ))
                
                conn.commit()
                return {"status": "interaction_tracked"}
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to track interaction: {str(e)}")

@router.post("/search/query")
async def track_search_query(search_data: SearchQueryData):
    """Track search queries"""
    try:
        with psycopg.connect(DATABASE_URL) as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO analytics.search_queries 
                    (session_id, query_text, results_count, clicked_song_id, search_duration, search_type)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (
                    search_data.session_id,
                    search_data.query_text,
                    search_data.results_count,
                    search_data.clicked_song_id,
                    timedelta(seconds=search_data.search_duration) if search_data.search_duration else None,
                    search_data.search_type
                ))
                
                conn.commit()
                return {"status": "search_tracked"}
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to track search: {str(e)}")

@router.post("/recommendations/request")
async def track_recommendations(recommendation_data: RecommendationData):
    """Track recommendation requests and responses"""
    try:
        with psycopg.connect(DATABASE_URL) as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO analytics.recommendations 
                    (session_id, playlist_id, source_song_ids, recommended_song_ids, accepted_song_ids, rejected_song_ids, recommendation_algorithm, response_time)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    recommendation_data.session_id,
                    recommendation_data.playlist_id,
                    recommendation_data.source_song_ids,
                    recommendation_data.recommended_song_ids,
                    recommendation_data.accepted_song_ids or [],
                    recommendation_data.rejected_song_ids or [],
                    recommendation_data.recommendation_algorithm,
                    timedelta(seconds=recommendation_data.response_time) if recommendation_data.response_time else None
                ))
                
                conn.commit()
                return {"status": "recommendation_tracked"}
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to track recommendation: {str(e)}")

@router.post("/error")
async def track_error(error_data: ErrorData):
    """Track application errors"""
    try:
        with psycopg.connect(DATABASE_URL) as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO analytics.errors 
                    (session_id, error_type, error_message, stack_trace, user_agent, page_path)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (
                    error_data.session_id,
                    error_data.error_type,
                    error_data.error_message,
                    error_data.stack_trace,
                    error_data.user_agent,
                    error_data.page_path
                ))
                
                conn.commit()
                return {"status": "error_tracked"}
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to track error: {str(e)}")

@router.post("/performance")
async def track_performance(performance_data: PerformanceData):
    """Track performance metrics"""
    try:
        with psycopg.connect(DATABASE_URL) as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO analytics.performance 
                    (session_id, metric_name, metric_value, metric_unit, page_path)
                    VALUES (%s, %s, %s, %s, %s)
                """, (
                    performance_data.session_id,
                    performance_data.metric_name,
                    performance_data.metric_value,
                    performance_data.metric_unit,
                    performance_data.page_path
                ))
                
                conn.commit()
                return {"status": "performance_tracked"}
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to track performance: {str(e)}")

# Analytics dashboard endpoints
@router.get("/dashboard/daily-stats")
async def get_daily_stats(days: int = 30):
    """Get daily statistics for the dashboard"""
    try:
        with psycopg.connect(DATABASE_URL) as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT * FROM analytics.daily_stats 
                    WHERE date >= CURRENT_DATE - INTERVAL '%s days'
                    ORDER BY date DESC
                """, (days,))
                
                columns = [desc[0] for desc in cur.description]
                rows = cur.fetchall()
                
                return [dict(zip(columns, row)) for row in rows]
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get daily stats: {str(e)}")

@router.get("/dashboard/popular-songs")
async def get_popular_songs(limit: int = 20):
    """Get most popular songs based on interactions"""
    try:
        with psycopg.connect(DATABASE_URL) as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT * FROM analytics.popular_songs 
                    LIMIT %s
                """, (limit,))
                
                columns = [desc[0] for desc in cur.description]
                rows = cur.fetchall()
                
                return [dict(zip(columns, row)) for row in rows]
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get popular songs: {str(e)}")

@router.get("/dashboard/search-trends")
async def get_search_trends(limit: int = 20):
    """Get search trends and popular queries"""
    try:
        with psycopg.connect(DATABASE_URL) as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT * FROM analytics.search_trends 
                    LIMIT %s
                """, (limit,))
                
                columns = [desc[0] for desc in cur.description]
                rows = cur.fetchall()
                
                return [dict(zip(columns, row)) for row in rows]
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get search trends: {str(e)}")

@router.get("/dashboard/session-metrics")
async def get_session_metrics():
    """Get session-related metrics"""
    try:
        with psycopg.connect(DATABASE_URL) as conn:
            with conn.cursor() as cur:
                # Total sessions today
                cur.execute("""
                    SELECT COUNT(*) as total_sessions_today
                    FROM analytics.user_sessions 
                    WHERE DATE(created_at) = CURRENT_DATE
                """)
                total_sessions_today = cur.fetchone()[0]
                
                # Average session duration
                cur.execute("""
                    SELECT AVG(EXTRACT(EPOCH FROM session_duration)) as avg_session_duration
                    FROM analytics.user_sessions 
                    WHERE session_duration IS NOT NULL
                """)
                avg_session_duration = cur.fetchone()[0]
                
                # Mobile vs desktop
                cur.execute("""
                    SELECT 
                        COUNT(CASE WHEN is_mobile THEN 1 END) as mobile_sessions,
                        COUNT(CASE WHEN NOT is_mobile THEN 1 END) as desktop_sessions
                    FROM analytics.user_sessions 
                    WHERE DATE(created_at) = CURRENT_DATE
                """)
                mobile_desktop = cur.fetchone()
                
                return {
                    "total_sessions_today": total_sessions_today,
                    "avg_session_duration_seconds": round(avg_session_duration, 2) if avg_session_duration else 0,
                    "mobile_sessions": mobile_desktop[0],
                    "desktop_sessions": mobile_desktop[1]
                }
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get session metrics: {str(e)}")
