import os
from dotenv import load_dotenv
load_dotenv()
import psycopg2

db_url = os.getenv('DATABASE_URL')
print('Testing DB URL:', db_url[:30] + '...')
try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    cur.execute('SELECT 1;')
    print('SUCCESS: Database connection verified!')
    cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';")
    tables = cur.fetchall()
    print('Tables in DB:', [t[0] for t in tables])
    cur.close()
    conn.close()
except Exception as e:
    print('DB Connection Error:', e)
