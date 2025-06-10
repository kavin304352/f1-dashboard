#Kavin Ilanchezhian

from flask import Flask, jsonify
from flask_cors import CORS
from f1_data import get_fastest_laps
from fastf1 import get_event_schedule
import pandas as pd
import datetime

app = Flask(__name__)
CORS(app)

@app.route("/api/fastest-laps/<int:year>/<string:gp>")
def fastest_laps(year, gp):
    try:
        #get the data of the fastest lap
        data = get_fastest_laps(year, gp)
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/tracks")
def get_available_tracks():
    current_year = datetime.datetime.now().year
    schedule = get_event_schedule(current_year)

    # Only up to date grand prix's
    today = datetime.datetime.now().date()
    past = schedule[schedule['EventDate'] < pd.Timestamp(today)]

    
    result = [
        {"name": row["EventName"], "year": current_year}
        for _, row in past.iterrows()
    ]
    return jsonify(result)
if __name__ == "__main__":
    app.run(debug = True)
