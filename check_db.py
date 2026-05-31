import sqlite3
conn = sqlite3.connect('schoolsync.db')
cursor = conn.execute('SELECT email, is_verified, is_active, password_hash FROM users WHERE email="admin@schoolsync.com"')
for row in cursor:
    print(row)
