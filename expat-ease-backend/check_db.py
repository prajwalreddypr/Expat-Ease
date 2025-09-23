import sqlite3

def check_db():
    conn = sqlite3.connect('dev.db')
    cursor = conn.cursor()

    # Get table names
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    print('Tables:', tables)

    # Get user count
    cursor.execute('SELECT COUNT(*) FROM users')
    count = cursor.fetchone()[0]
    print(f'Users count: {count}')

    # Get all users
    cursor.execute('SELECT id, email, full_name, country FROM users')
    users = cursor.fetchall()
    print('Users:')
    for user in users:
        print(f'  ID: {user[0]}, Email: {user[1]}, Name: {user[2]}, Country: {user[3]}')

    conn.close()

if __name__ == "__main__":
    check_db()
