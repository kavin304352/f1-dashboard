#Kavin Ilanchezhian

from flask import Flask, jsonify
from flask_cors import CORS
from f1_data import get_fastest_laps

app = Flask(__name__)
CORS(app)

@app.route("/api/fastest-laps/<int:year>/<string:gp>")
def fastest_laps(year, gp):
    try:
        data = get_fastest_laps(year, gp)
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug = True)
