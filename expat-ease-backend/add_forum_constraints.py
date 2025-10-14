#!/usr/bin/env python3
"""
Database migration script to add unique constraints for forum voting tables.
This prevents duplicate votes from the same user on the same question/answer.
"""

import sqlite3
import os
from pathlib import Path

def add_unique_constraints():
    """Add unique constraints to prevent duplicate votes"""
    
    # Get database path
    db_path = Path(__file__).parent / "dev.db"
    
    if not db_path.exists():
        print("Database not found. Please run the application first to create the database.")
        return False
    
    try:
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        
        # Add unique constraint to questionvote table
        try:
            cursor.execute("""
                CREATE UNIQUE INDEX IF NOT EXISTS idx_question_votes_unique 
                ON questionvote (question_id, user_id)
            """)
            print("✅ Added unique constraint to questionvote table")
        except sqlite3.Error as e:
            print(f"⚠️  Warning: Could not add unique constraint to questionvote: {e}")
        
        # Add unique constraint to answervote table
        try:
            cursor.execute("""
                CREATE UNIQUE INDEX IF NOT EXISTS idx_answer_votes_unique 
                ON answervote (answer_id, user_id)
            """)
            print("✅ Added unique constraint to answervote table")
        except sqlite3.Error as e:
            print(f"⚠️  Warning: Could not add unique constraint to answervote: {e}")
        
        # Add indexes for performance
        try:
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_questions_category 
                ON question (category)
            """)
            print("✅ Added index on question.category")
        except sqlite3.Error as e:
            print(f"⚠️  Warning: Could not add category index: {e}")
        
        try:
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_questions_created_at 
                ON question (created_at)
            """)
            print("✅ Added index on question.created_at")
        except sqlite3.Error as e:
            print(f"⚠️  Warning: Could not add created_at index: {e}")
        
        try:
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_answers_question_id 
                ON answer (question_id)
            """)
            print("✅ Added index on answer.question_id")
        except sqlite3.Error as e:
            print(f"⚠️  Warning: Could not add question_id index: {e}")
        
        try:
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_question_votes_question_id 
                ON questionvote (question_id)
            """)
            print("✅ Added index on questionvote.question_id")
        except sqlite3.Error as e:
            print(f"⚠️  Warning: Could not add questionvote index: {e}")
        
        try:
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_answer_votes_answer_id 
                ON answervote (answer_id)
            """)
            print("✅ Added index on answervote.answer_id")
        except sqlite3.Error as e:
            print(f"⚠️  Warning: Could not add answervote index: {e}")
        
        conn.commit()
        print("\n🎉 Database constraints and indexes added successfully!")
        return True
        
    except sqlite3.Error as e:
        print(f"❌ Error: {e}")
        return False
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    print("🔧 Adding forum database constraints and indexes...")
    success = add_unique_constraints()
    if success:
        print("\n✅ Migration completed successfully!")
    else:
        print("\n❌ Migration failed!")
        exit(1)
