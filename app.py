# ==============================================
# app.py — Flask Backend for Recipe Finder
# ==============================================
# This Flask app works as a proxy between the frontend and
# TheMealDB API to fetch, search, and display recipes.
# ----------------------------------------------

from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)

# ---------- External API Base URLs ----------
SEARCH_API_URL = "https://www.themealdb.com/api/json/v1/1/search.php"
RANDOM_API_URL = "https://www.themealdb.com/api/json/v1/1/random.php"
LOOKUP_API_URL = "https://www.themealdb.com/api/json/v1/1/lookup.php"

# ---------- Homepage ----------
@app.route("/")
def index():
    """Render the main Recipe Finder homepage."""
    return render_template("index.html")


# ---------- API Endpoints (Proxy Routes) ----------

@app.route("/api/search", methods=["GET"])
def search_recipes_proxy():
    """
    Proxy route to search recipes by name.
    Example: /api/search?s=pizza
    """
    query = request.args.get("s")

    # Handle missing query
    if not query:
        return jsonify({"error": "Missing search term"}), 400

    try:
        response = requests.get(SEARCH_API_URL, params={"s": query})
        response.raise_for_status()
        return jsonify(response.json())
    except requests.RequestException as e:
        app.logger.error(f"TheMealDB Search Error: {e}")
        return jsonify({"error": "External API error"}), 500


@app.route("/api/random", methods=["GET"])
def random_recipe_proxy():
    """
    Proxy route to fetch a random recipe.
    Example: /api/random
    """
    try:
        response = requests.get(RANDOM_API_URL)
        response.raise_for_status()
        return jsonify(response.json())
    except requests.RequestException as e:
        app.logger.error(f"TheMealDB Random Error: {e}")
        return jsonify({"error": "External API error"}), 500


@app.route("/api/lookup", methods=["GET"])
def lookup_recipe_proxy():
    """
    Proxy route to get recipe details using its meal ID.
    Example: /api/lookup?i=52772
    """
    meal_id = request.args.get("i")

    # Validate ID
    if not meal_id:
        return jsonify({"error": "Missing recipe ID"}), 400

    try:
        response = requests.get(LOOKUP_API_URL, params={"i": meal_id})
        response.raise_for_status()
        return jsonify(response.json())
    except requests.RequestException as e:
        app.logger.error(f"TheMealDB Lookup Error: {e}")
        return jsonify({"error": "External API error"}), 500


# ---------- Main Entry ----------
if __name__ == "__main__":
    # Run Flask app in debug mode
    app.run(debug=True)
