#!/usr/bin/env python3
"""
Analytics Database Setup Script for MyNewPlaylist

This script sets up the analytics database schema and provides
initial configuration for the analytics system.
"""

import os
import sys
import psycopg
from pathlib import Path

def get_database_connection():
    """Get database connection from environment variables"""
    database_url = os.environ.get("DATABASE_URL")
    if not database_url:
        print("❌ Error: DATABASE_URL environment variable not set")
        print("Please set DATABASE_URL before running this script")
        sys.exit(1)
    
    try:
        conn = psycopg.connect(database_url)
        return conn
    except Exception as e:
        print(f"❌ Error connecting to database: {e}")
        sys.exit(1)

def setup_analytics_schema(conn):
    """Set up the analytics schema and tables"""
    try:
        with conn.cursor() as cur:
            print("🔧 Setting up analytics schema...")
            
            # Read and execute the analytics tables DDL
            ddl_file = Path(__file__).parent / "analytics_tables.ddl"
            if not ddl_file.exists():
                print(f"❌ Error: Analytics DDL file not found at {ddl_file}")
                return False
            
            with open(ddl_file, 'r') as f:
                ddl_content = f.read()
            
            # Split and execute DDL statements
            statements = ddl_content.split(';')
            for statement in statements:
                statement = statement.strip()
                if statement and not statement.startswith('--'):
                    try:
                        cur.execute(statement)
                        print(f"✅ Executed: {statement[:50]}...")
                    except Exception as e:
                        if "already exists" not in str(e).lower():
                            print(f"⚠️  Warning executing statement: {e}")
                            print(f"Statement: {statement[:100]}...")
            
            conn.commit()
            print("✅ Analytics schema setup completed successfully!")
            return True
            
    except Exception as e:
        print(f"❌ Error setting up analytics schema: {e}")
        conn.rollback()
        return False

def verify_analytics_setup(conn):
    """Verify that analytics tables were created correctly"""
    try:
        with conn.cursor() as cur:
            print("\n🔍 Verifying analytics setup...")
            
            # Check if analytics schema exists
            cur.execute("""
                SELECT schema_name 
                FROM information_schema.schemata 
                WHERE schema_name = 'analytics'
            """)
            
            if not cur.fetchone():
                print("❌ Analytics schema not found")
                return False
            
            # Check if key tables exist
            required_tables = [
                'user_sessions',
                'page_views', 
                'playlists',
                'song_interactions',
                'search_queries',
                'recommendations',
                'user_engagement',
                'errors',
                'performance'
            ]
            
            for table in required_tables:
                cur.execute("""
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = 'analytics' AND table_name = %s
                """, (table,))
                
                if not cur.fetchone():
                    print(f"❌ Table 'analytics.{table}' not found")
                    return False
                else:
                    print(f"✅ Table 'analytics.{table}' exists")
            
            # Check if views exist
            required_views = [
                'daily_stats',
                'popular_songs',
                'search_trends'
            ]
            
            for view in required_views:
                cur.execute("""
                    SELECT table_name 
                    FROM information_schema.views 
                    WHERE table_schema = 'analytics' AND table_name = %s
                """, (view,))
                
                if not cur.fetchone():
                    print(f"❌ View 'analytics.{view}' not found")
                    return False
                else:
                    print(f"✅ View 'analytics.{view}' exists")
            
            print("✅ All analytics tables and views verified successfully!")
            return True
            
    except Exception as e:
        print(f"❌ Error verifying analytics setup: {e}")
        return False

def create_sample_data(conn):
    """Create sample data for testing analytics"""
    try:
        with conn.cursor() as cur:
            print("\n📊 Creating sample analytics data...")
            
            # Insert sample session
            cur.execute("""
                INSERT INTO analytics.user_sessions 
                (user_id, ip_address, user_agent, is_mobile, country_code)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING session_id
            """, (
                'sample_user_001',
                '127.0.0.1',
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                False,
                'US'
            ))
            
            session_id = cur.fetchone()[0]
            
            # Insert sample page view
            cur.execute("""
                INSERT INTO analytics.page_views 
                (session_id, page_path, page_title)
                VALUES (%s, %s, %s)
            """, (
                session_id,
                '/',
                'MyNewPlaylist - Home'
            ))
            
            # Insert sample playlist
            cur.execute("""
                INSERT INTO analytics.playlists 
                (session_id, song_count, is_public)
                VALUES (%s, %s, %s)
                RETURNING playlist_id
            """, (
                session_id,
                5,
                True
            ))
            
            playlist_id = cur.fetchone()[0]
            
            # Insert sample song interaction
            cur.execute("""
                INSERT INTO analytics.song_interactions 
                (session_id, playlist_id, track_id, interaction_type)
                VALUES (%s, %s, %s, %s)
            """, (
                session_id,
                playlist_id,
                'sample_track_001',
                'add'
            ))
            
            # Insert sample search query
            cur.execute("""
                INSERT INTO analytics.search_queries 
                (session_id, query_text, results_count, search_type)
                VALUES (%s, %s, %s, %s)
            """, (
                session_id,
                'rock music',
                25,
                'text'
            ))
            
            conn.commit()
            print("✅ Sample analytics data created successfully!")
            return True
            
    except Exception as e:
        print(f"❌ Error creating sample data: {e}")
        conn.rollback()
        return False

def show_analytics_info():
    """Display information about the analytics system"""
    print("\n" + "="*60)
    print("🎵 MyNewPlaylist Analytics System Setup Complete!")
    print("="*60)
    print("\n📊 What's been set up:")
    print("✅ Analytics database schema")
    print("✅ User session tracking tables")
    print("✅ Playlist analytics tables")
    print("✅ Song interaction tracking")
    print("✅ Search query analytics")
    print("✅ Recommendation tracking")
    print("✅ Performance monitoring")
    print("✅ Error tracking")
    print("✅ Analytics dashboard views")
    
    print("\n🔧 Next steps:")
    print("1. Restart your FastAPI backend to include analytics endpoints")
    print("2. Import analytics service in your frontend components")
    print("3. Start tracking user interactions")
    print("4. View analytics data in the dashboard")
    
    print("\n📚 Documentation:")
    print("- Frontend: frontend/ANALYTICS-README.md")
    print("- Database: database/setup/analytics_tables.ddl")
    print("- Backend: backend/analytics.py")
    
    print("\n🌐 Analytics Endpoints:")
    print("- POST /analytics/session/start - Start user session")
    print("- POST /analytics/pageview - Track page views")
    print("- POST /analytics/playlist/create - Track playlists")
    print("- POST /analytics/song/interaction - Track song actions")
    print("- GET /analytics/dashboard/* - View analytics data")
    
    print("\n" + "="*60)

def main():
    """Main setup function"""
    print("🚀 Setting up MyNewPlaylist Analytics System...")
    print("="*60)
    
    # Get database connection
    conn = get_database_connection()
    
    try:
        # Setup analytics schema
        if not setup_analytics_schema(conn):
            print("❌ Failed to setup analytics schema")
            return
        
        # Verify setup
        if not verify_analytics_setup(conn):
            print("❌ Analytics setup verification failed")
            return
        
        # Create sample data
        create_sample_data(conn)
        
        # Show completion info
        show_analytics_info()
        
    finally:
        conn.close()

if __name__ == "__main__":
    main()
