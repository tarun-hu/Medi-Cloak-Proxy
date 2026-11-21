"""
PostgreSQL connection and table creation for MediCloak.
Uses psycopg2 with a connection pool.
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

import psycopg2
from psycopg2 import pool, extras
from contextlib import contextmanager

from urllib.parse import urlparse, parse_qs

def _normalize_db_url(url: str) -> str:
    """Normalize Render and Cloud Postgres connection strings."""
    if not url:
        return url
    if url.startswith("postgres://"):
        url = "postgresql://" + url[len("postgres://"):]
    if "localhost" not in url and "127.0.0.1" not in url and "sslmode" not in url:
        sep = "&" if "?" in url else "?"
        url = f"{url}{sep}sslmode=require"
    return url

DATABASE_URL = _normalize_db_url(os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/medicloak",
))

# Parse DATABASE_URL into components
def _parse_dsn(url: str) -> dict:
    url = _normalize_db_url(url)
    parsed = urlparse(url)
    dbname = parsed.path.lstrip("/")
    params = {
        "user": parsed.username or "postgres",
        "password": parsed.password or "",
        "host": parsed.hostname or "localhost",
        "port": parsed.port or 5432,
        "dbname": dbname,
    }
    qs = parse_qs(parsed.query)
    if "sslmode" in qs:
        params["sslmode"] = qs["sslmode"][0]
    elif "localhost" not in params["host"] and "127.0.0.1" not in params["host"]:
        params["sslmode"] = "require"
    return params


_pool: pool.SimpleConnectionPool | None = None


def get_pool() -> pool.SimpleConnectionPool:
    global _pool
    if _pool is None:
        try:
            _pool = pool.SimpleConnectionPool(minconn=2, maxconn=10, dsn=DATABASE_URL)
        except Exception:
            params = _parse_dsn(DATABASE_URL)
            _pool = pool.SimpleConnectionPool(minconn=2, maxconn=10, **params)
    return _pool


@contextmanager
def get_connection():
    """Get a connection from the pool, auto-return on exit."""
    p = get_pool()
    conn = p.getconn()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        p.putconn(conn)


@contextmanager
def get_cursor(cursor_factory=None):
    """Get a cursor with auto-commit/rollback."""
    with get_connection() as conn:
        kwargs = {}
        if cursor_factory:
            kwargs["cursor_factory"] = cursor_factory
        cur = conn.cursor(**kwargs)
        try:
            yield cur
        finally:
            cur.close()


def dict_cursor():
    """Return RealDictCursor factory for dict-like rows."""
    return extras.RealDictCursor


def init_db():
    """Create the events table if it doesn't exist."""
    with get_cursor() as cur:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS events (
                id              SERIAL PRIMARY KEY,
                event_id        UUID DEFAULT gen_random_uuid(),
                timestamp       TIMESTAMPTZ DEFAULT NOW(),
                source_ip       TEXT,
                user_agent      TEXT,
                ai_service      TEXT,
                request_method  TEXT,
                request_path    TEXT,
                risk_score      INTEGER,
                severity        TEXT,
                phi_detected    BOOLEAN DEFAULT FALSE,
                phi_count       INTEGER DEFAULT 0,
                phi_types       JSONB,
                phi_findings    JSONB,
                original_text   TEXT,
                redacted_text   TEXT,
                action          TEXT,
                status          TEXT DEFAULT 'active',
                engine          TEXT,
                response_time_ms INTEGER,
                department      TEXT DEFAULT 'OPD / General Medicine',
                sha256_hash     TEXT,
                rehydration_map JSONB DEFAULT '{}'::jsonb,
                clinical_terms_preserved JSONB DEFAULT '[]'::jsonb,
                dpdp_score      FLOAT DEFAULT 99.8,
                created_at      TIMESTAMPTZ DEFAULT NOW()
            );
        """)

        # Auto-migration for existing tables
        cur.execute("""
            ALTER TABLE events ADD COLUMN IF NOT EXISTS department TEXT DEFAULT 'OPD / General Medicine';
            ALTER TABLE events ADD COLUMN IF NOT EXISTS sha256_hash TEXT;
            ALTER TABLE events ADD COLUMN IF NOT EXISTS rehydration_map JSONB DEFAULT '{}'::jsonb;
            ALTER TABLE events ADD COLUMN IF NOT EXISTS clinical_terms_preserved JSONB DEFAULT '[]'::jsonb;
            ALTER TABLE events ADD COLUMN IF NOT EXISTS dpdp_score FLOAT DEFAULT 99.8;
        """)

        # Create indexes
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_events_event_id ON events(event_id);
        """)
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp DESC);
        """)
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_events_severity ON events(severity);
        """)
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_events_department ON events(department);
        """)

        # VAPI voice calls table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS vapi_calls (
                id              SERIAL PRIMARY KEY,
                call_id         TEXT,
                event_id        UUID NOT NULL,
                source_ip       TEXT,
                phone_number    TEXT,
                status          TEXT DEFAULT 'initiated',
                created_at      TIMESTAMPTZ DEFAULT NOW(),
                ended_at        TIMESTAMPTZ,
                duration_seconds INTEGER,
                error_message   TEXT
            );
        """)
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_vapi_calls_event_id ON vapi_calls(event_id);
        """)
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_vapi_calls_source_ip_created
            ON vapi_calls(source_ip, created_at DESC);
        """)


def close_pool():
    """Close all connections in the pool."""
    global _pool
    if _pool:
        _pool.closeall()
        _pool = None
