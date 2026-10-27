
import sqlite3
from pathlib import Path

# Database location:
# backend/instance/chaos_arena.db
BASE_DIR = Path(__file__).resolve().parent
INSTANCE_DIR = BASE_DIR / "instance"
DB_PATH = INSTANCE_DIR / "chaos_arena.db"


def get_db():
    """Open a database connection and enable foreign-key support."""
    INSTANCE_DIR.mkdir(parents=True, exist_ok=True)

    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")

    return connection


def init_db():
    """Create the CHAOS ARENA database tables if they do not exist."""
    connection = get_db()

    try:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE COLLATE NOCASE,
                email TEXT UNIQUE COLLATE NOCASE,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS game_scores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                game_name TEXT NOT NULL,
                score INTEGER NOT NULL DEFAULT 0,
                duration_seconds INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

                FOREIGN KEY (user_id)
                    REFERENCES users(id)
                    ON DELETE SET NULL,

                CHECK (score >= 0),
                CHECK (duration_seconds >= 0)
            );

            CREATE TABLE IF NOT EXISTS achievements (
                code TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS user_achievements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                achievement_code TEXT NOT NULL,
                unlocked_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

                FOREIGN KEY (user_id)
                    REFERENCES users(id)
                    ON DELETE CASCADE,

                FOREIGN KEY (achievement_code)
                    REFERENCES achievements(code),

                UNIQUE (user_id, achievement_code)
            );

            CREATE INDEX IF NOT EXISTS idx_scores_user
                ON game_scores(user_id);

            CREATE INDEX IF NOT EXISTS idx_scores_game
                ON game_scores(game_name);

            CREATE INDEX IF NOT EXISTS idx_scores_score
                ON game_scores(score DESC);

            CREATE INDEX IF NOT EXISTS idx_achievements_user
                ON user_achievements(user_id);
            """
        )

        # Add starter achievements without duplicating existing records.
        connection.executemany(
            """
            INSERT OR IGNORE INTO achievements
                (code, title, description)
            VALUES (?, ?, ?)
            """,
            [
                (
                    "first_event",
                    "First Steps",
                    "Trigger your first random event.",
                ),
                (
                    "event_10",
                    "Chaos Regular",
                    "Trigger 10 random events.",
                ),
                (
                    "score_100",
                    "Century Club",
                    "Reach a score of 100 in a game.",
                ),
            ],
        )

        connection.commit()

    except sqlite3.Error:
        connection.rollback()
        raise

    finally:
        connection.close()


if __name__ == "__main__":
    init_db()
    print("CHAOS ARENA database initialized successfully.")
    print(f"Database location: {DB_PATH}")
