#Kavin Ilanchezhian

from flask import Flask, jsonify
from flask_cors import CORS
from f1_data import get_fastest_laps

import os
import fastf1
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
    schedule = fastf1.get_event_schedule(current_year)

    # Only up to date grand prix's
    today = datetime.datetime.now().date()
    past = schedule[schedule['EventDate'] < pd.Timestamp(today)]

    
    result = [
        {"name": row["EventName"], "year": current_year}
        for _, row in past.iterrows()
    ]
    return jsonify(result)

@app.route('/api/track-position/<int:year>/<string:gp>/<string:driver>')
def get_track_position(year, gp, driver):
    session = fastf1.get_session(year, gp, 'R')
    session.load()

    # Get fastest lap for the given driver
    lap = session.laps.pick_driver(driver.upper()).pick_fastest()
    pos = lap.get_pos_data()

    # Convert to JSON-safe format
    data = [{"x": float(row.X), "y": float(row.Y)} for _, row in pos.iterrows()]

    return jsonify(data)

if __name__ == "__main__":
    app.run(debug = True)
