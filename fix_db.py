import sqlite3
conn = sqlite3.connect('schoolsync.db')
conn.execute('UPDATE users SET is_verified=1')
conn.commit()
print('Done')
