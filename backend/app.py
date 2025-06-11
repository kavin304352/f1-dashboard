#Kavin Ilanchezhian

from flask import Flask, jsonify
from flask_cors import CORS
from f1_data import get_fastest_laps

import os
import fastf1
import numpy as np
from scipy.interpolate import interp1d
from urllib.parse import unquote
import pandas as pd
import datetime


app = Flask(__name__)
CORS(app)

#os.makedirs('cache', exist_ok=True)
#fastf1.Cache.enable_cache('cache')

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

def enrich_with_distance_and_speed(df):
    df = df.sort_values('SessionTime').reset_index(drop=True)
    dx = df['X'].diff()
    dy = df['Y'].diff()
    dt = df['SessionTime'].diff().dt.total_seconds()

    df['Distance'] = np.sqrt(dx**2 + dy**2).fillna(0).cumsum()
    df['Speed'] = (np.sqrt(dx**2 + dy**2) / dt).fillna(0)
    return df


@app.route('/api/compare-lines/<int:year>/<path:gp>/<string:driver1>/<string:driver2>')
def compare_lines(year, gp, driver1, driver2):
    gp = unquote(gp)  # decode %20 to space
    session = fastf1.get_session(year, gp, 'R')
    session.load()

    try:
        lap1 = session.laps.pick_driver(driver1.upper()).pick_fastest()
        lap2 = session.laps.pick_driver(driver2.upper()).pick_fastest()
    except Exception as e:
        return jsonify({"error": str(e)}), 400

    tel1 = enrich_with_distance_and_speed(lap1.get_pos_data().copy())
    tel2 = enrich_with_distance_and_speed(lap2.get_pos_data().copy())

    # Create common distance array
    dist = np.linspace(0, min(tel1['Distance'].max(), tel2['Distance'].max()), 500)

    # Interpolation functions
    f1_speed = interp1d(tel1['Distance'], tel1['Speed'], bounds_error=False, fill_value="extrapolate")
    f2_speed = interp1d(tel2['Distance'], tel2['Speed'], bounds_error=False, fill_value="extrapolate")
    f1_x = interp1d(tel1['Distance'], tel1['X'], bounds_error=False, fill_value="extrapolate")
    f1_y = interp1d(tel1['Distance'], tel1['Y'], bounds_error=False, fill_value="extrapolate")

    speed1 = f1_speed(dist)
    speed2 = f2_speed(dist)
    x_vals = f1_x(dist)
    y_vals = f1_y(dist)

    result = []
    for i in range(len(dist)):
        result.append({
            "x": round(float(x_vals[i]), 2),
            "y": round(float(y_vals[i]), 2),
            "faster": driver1.upper() if speed1[i] > speed2[i] else driver2.upper()
        })

    return jsonify(result)


if __name__ == "__main__":
    app.run(debug = True)
