#!/usr/bin/env python3
"""
Database migration script to add moderation tables.
This adds tables for reports, moderator actions, and user moderation status.
"""

import sqlite3
import os
from pathlib import Path

def add_moderation_tables():
    """Add moderation tables to the database"""
    
    # Get database path
    db_path = Path(__file__).parent / "dev.db"
    
    if not db_path.exists():
        print("Database not found. Please run the application first to create the database.")
        return False
    
    try:
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        
        # Create reports table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                reporter_id INTEGER NOT NULL,
                reported_user_id INTEGER NOT NULL,
                content_type VARCHAR(20) NOT NULL,
                content_id INTEGER NOT NULL,
                reason VARCHAR(30) NOT NULL,
                description VARCHAR(500),
                status VARCHAR(20) DEFAULT 'pending',
                moderator_id INTEGER,
                moderator_notes VARCHAR(500),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP,
                resolved_at TIMESTAMP,
                FOREIGN KEY (reporter_id) REFERENCES users (id),
                FOREIGN KEY (reported_user_id) REFERENCES users (id),
                FOREIGN KEY (moderator_id) REFERENCES users (id)
            )
        """)
        print("✅ Created reports table")
        
        # Create moderator_actions table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS moderator_actions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                moderator_id INTEGER NOT NULL,
                action_type VARCHAR(30) NOT NULL,
                target_type VARCHAR(20) NOT NULL,
                target_id INTEGER NOT NULL,
                reason VARCHAR(200) NOT NULL,
                description VARCHAR(500),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (moderator_id) REFERENCES users (id)
            )
        """)
        print("✅ Created moderator_actions table")
        
        # Create user_moderation_status table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_moderation_status (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER UNIQUE NOT NULL,
                is_banned BOOLEAN DEFAULT FALSE,
                ban_reason VARCHAR(200),
                ban_expires_at TIMESTAMP,
                warning_count INTEGER DEFAULT 0,
                last_warning_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        """)
        print("✅ Created user_moderation_status table")
        
        # Add indexes for performance
        try:
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_reports_status 
                ON reports (status)
            """)
            print("✅ Added index on reports.status")
        except sqlite3.Error as e:
            print(f"⚠️  Warning: Could not add reports status index: {e}")
        
        try:
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_reports_created_at 
                ON reports (created_at)
            """)
            print("✅ Added index on reports.created_at")
        except sqlite3.Error as e:
            print(f"⚠️  Warning: Could not add reports created_at index: {e}")
        
        try:
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_moderator_actions_moderator_id 
                ON moderator_actions (moderator_id)
            """)
            print("✅ Added index on moderator_actions.moderator_id")
        except sqlite3.Error as e:
            print(f"⚠️  Warning: Could not add moderator_actions moderator_id index: {e}")
        
        try:
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_user_moderation_status_user_id 
                ON user_moderation_status (user_id)
            """)
            print("✅ Added index on user_moderation_status.user_id")
        except sqlite3.Error as e:
            print(f"⚠️  Warning: Could not add user_moderation_status user_id index: {e}")
        
        try:
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_user_moderation_status_is_banned 
                ON user_moderation_status (is_banned)
            """)
            print("✅ Added index on user_moderation_status.is_banned")
        except sqlite3.Error as e:
            print(f"⚠️  Warning: Could not add user_moderation_status is_banned index: {e}")
        
        conn.commit()
        print("\n🎉 Moderation tables and indexes added successfully!")
        return True
        
    except sqlite3.Error as e:
        print(f"❌ Error: {e}")
        return False
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    print("🔧 Adding moderation tables and indexes...")
    success = add_moderation_tables()
    if success:
        print("\n✅ Migration completed successfully!")
    else:
        print("\n❌ Migration failed!")
        exit(1)
