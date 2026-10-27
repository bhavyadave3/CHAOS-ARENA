
import sqlite3

from flask import Flask, jsonify, request

from database import get_db, init_db

app = Flask(__name__)

FRONTEND_ORIGINS = {
    "http://localhost:5173",
    "http://127.0.0.1:5173",
}

VALID_GAMES = {
    "Chaos Switch",
    "Chaos Floor",
    "Chaos Freeze",
    "Chaos Mind",
    "Chaos Stack",
    "Chaos Target",
    "Chaos Colors",
    "Chaos Gravity",
    "Chaos Mode",
}


@app.after_request
def add_cors_headers(response):
    origin = request.headers.get("Origin")

    if origin in FRONTEND_ORIGINS:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Vary"] = "Origin"
        response.headers["Access-Control-Allow-Headers"] = (
            "Content-Type, Authorization"
        )
        response.headers["Access-Control-Allow-Methods"] = (
            "GET, POST, OPTIONS"
        )

    return response


@app.get("/")
def home():
    return jsonify({
        "success": True,
        "message": "CHAOS ARENA backend is running!",
        "api": "/api/health",
    })


@app.get("/api/health")
def health_check():
    connection = None

    try:
        connection = get_db()
        connection.execute("SELECT 1").fetchone()

        return jsonify({
            "success": True,
            "status": "online",
            "database": "connected",
            "application": "CHAOS ARENA",
            "version": "1.0.0",
        })

    except sqlite3.Error:
        app.logger.exception("Database health check failed")

        return jsonify({
            "success": False,
            "status": "error",
            "database": "disconnected",
        }), 503

    finally:
        if connection is not None:
            connection.close()


@app.post("/api/scores")
def save_score():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "success": False,
            "message": "A valid JSON request body is required.",
        }), 400

    game_name = data.get("game_name")
    score = data.get("score")
    duration = data.get("duration_seconds", 0)

    if not isinstance(game_name, str) or game_name not in VALID_GAMES:
        return jsonify({
            "success": False,
            "message": "Please provide a valid CHAOS ARENA game name.",
        }), 400

    # bool is a subclass of int in Python, so reject it explicitly.
    if type(score) is not int or score < 0:
        return jsonify({
            "success": False,
            "message": "Score must be a non-negative integer.",
        }), 400

    if type(duration) is not int or duration < 0:
        return jsonify({
            "success": False,
            "message": "Duration must be a non-negative integer.",
        }), 400

    if score > 1_000_000_000 or duration > 86_400:
        return jsonify({
            "success": False,
            "message": "Score or duration exceeds the allowed limit.",
        }), 400

    connection = None

    try:
        connection = get_db()

        cursor = connection.execute(
            """
            INSERT INTO game_scores
                (user_id, game_name, score, duration_seconds)
            VALUES (?, ?, ?, ?)
            """,
            (None, game_name, score, duration),
        )

        connection.commit()

        saved_score = connection.execute(
            """
            SELECT id, game_name, score, duration_seconds, created_at
            FROM game_scores
            WHERE id = ?
            """,
            (cursor.lastrowid,),
        ).fetchone()

        return jsonify({
            "success": True,
            "message": "Score saved successfully.",
            "score": dict(saved_score),
        }), 201

    except sqlite3.Error:
        if connection is not None:
            connection.rollback()

        app.logger.exception("Unable to save game score")

        return jsonify({
            "success": False,
            "message": "Unable to save the score right now.",
        }), 500

    finally:
        if connection is not None:
            connection.close()


@app.get("/api/leaderboard")
def get_leaderboard():
    game_name = request.args.get("game_name")
    limit_value = request.args.get("limit", "10")

    if game_name and game_name not in VALID_GAMES:
        return jsonify({
            "success": False,
            "message": "Please provide a valid CHAOS ARENA game name.",
        }), 400

    try:
        limit = int(limit_value)
    except (TypeError, ValueError):
        return jsonify({
            "success": False,
            "message": "Limit must be a number between 1 and 100.",
        }), 400

    if not 1 <= limit <= 100:
        return jsonify({
            "success": False,
            "message": "Limit must be between 1 and 100.",
        }), 400

    connection = None

    try:
        connection = get_db()

        if game_name:
            rows = connection.execute(
                """
                SELECT id, game_name, score, duration_seconds, created_at
                FROM game_scores
                WHERE game_name = ?
                ORDER BY score DESC, duration_seconds ASC, id ASC
                LIMIT ?
                """,
                (game_name, limit),
            ).fetchall()
        else:
            rows = connection.execute(
                """
                SELECT id, game_name, score, duration_seconds, created_at
                FROM game_scores
                ORDER BY score DESC, duration_seconds ASC, id ASC
                LIMIT ?
                """,
                (limit,),
            ).fetchall()

        return jsonify({
            "success": True,
            "count": len(rows),
            "leaderboard": [dict(row) for row in rows],
        })

    except sqlite3.Error:
        app.logger.exception("Unable to retrieve leaderboard")

        return jsonify({
            "success": False,
            "message": "Unable to retrieve the leaderboard right now.",
        }), 500

    finally:
        if connection is not None:
            connection.close()


@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "success": False,
        "message": "API endpoint not found.",
    }), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        "success": False,
        "message": "An internal server error occurred.",
    }), 500


# Create any missing tables before the server starts.
init_db()


if __name__ == "__main__":
    print("Starting CHAOS ARENA backend...")
    print("Backend: http://127.0.0.1:5000")
    print("Health: http://127.0.0.1:5000/api/health")
    print("Scores: http://127.0.0.1:5000/api/scores")
    print("Leaderboard: http://127.0.0.1:5000/api/leaderboard")

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True,
    )
