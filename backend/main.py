import os

import psycopg
from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from analytics import router as analytics_router
from auth_dependencies import AccessContext, get_access_context

app = FastAPI()

# Configure CORS (production is same-origin via nginx; this is a safe fallback)
allowed_origins_env = os.getenv('ALLOWED_ORIGINS', '*')
allowed_origins = (
    ['*'] if allowed_origins_env.strip() == '*' else [o.strip() for o in allowed_origins_env.split(',') if o.strip()]
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False if '*' in allowed_origins else True,
    allow_methods=['*'],
    allow_headers=['*'],
)

# Include analytics router
app.include_router(analytics_router)

DATABASE_URL = os.environ['DATABASE_URL']


@app.get('/recommend-average/')
def get_recommendations_by_average(
    song_ids: list[str] = Query(..., description='List of song IDs'),
    limit: int = Query(10, gt=0, description='Number of recommendations to return'),
    context: AccessContext = Depends(get_access_context)
):
    """
    Get song recommendations based on the average embedding of multiple songs.
    Enforces per-plan quotas based on the Supabase session (guest vs. authenticated).
    """
    max_limit = context.max_recommendations
    if limit > max_limit:
        detail: dict[str, object] = {
            'message': f'You can request up to {max_limit} recommendations per call.',
            'max_limit': max_limit,
            'is_authenticated': context.is_authenticated,
        }
        if not context.is_authenticated:
            detail['hint'] = 'Sign in with Google to unlock higher limits.'
        raise HTTPException(status_code=403, detail=detail)

    effective_limit = min(limit, max_limit)

    with psycopg.connect(DATABASE_URL) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT track_id,
                       track_name,
                       artist_name,
                       track_external_urls,
                       embedding <-> (
                           SELECT AVG(embedding)
                           FROM b25.songs
                           WHERE track_id = ANY(%s::text[])
                       ) AS distance
                FROM b25.songs
                WHERE track_id != ALL(%s::text[])
                ORDER BY distance
                LIMIT %s
                """,
                (song_ids, song_ids, effective_limit)
            )

            rows = cur.fetchall()
            result = [
                {
                    'track_id': r[0],
                    'track_name': r[1],
                    'artist_name': r[2],
                    'track_external_urls': r[3],
                    'distance': r[4]
                }
                for r in rows
            ]
            response = JSONResponse(content=result)
            response.headers['X-Recommendation-Limit'] = str(max_limit)
            response.headers['X-Recommendation-Plan'] = (
                'authenticated' if context.is_authenticated else 'anonymous'
            )
            if context.user:
                response.headers['X-Recommendation-User'] = context.user.id
            return response


@app.get('/search-advanced/')
def search_songs_advanced(query: str, limit: int = 50):
    """
    Advanced search using PostgreSQL full-text search capabilities.
    Provides better ranking and relevance scoring.
    """
    with psycopg.connect(DATABASE_URL) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                    SELECT
                        track_id,
                        track_name,
                        artist_name,
                        track_external_urls
                    FROM b25.songs
                    WHERE
                        to_tsvector('english', track_name || ' ' || artist_name) @@ plainto_tsquery('english', %s)
                        OR track_name ILIKE %s
                    ORDER BY track_name
                    LIMIT %s;
                """,
                (query, f'%{query}%', limit)
            )

            rows = cur.fetchall()
            columns = [desc[0] for desc in cur.description]

            results = [
                dict(zip(columns, row))
                for row in rows
            ]
            return results


@app.get('/')
def root():
    return {'status': 'running'}
