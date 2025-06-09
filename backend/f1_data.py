import fastf1
import pandas as pd

def get_fastest_laps(year, gp):
    # gp stands for grand prix, essentially the name of the race
    session = fastf1.get_session(year, gp, 'R')
    session.load()

    laps = session.laps.pick_quicklaps()
    fastest = laps.groupby("Driver")["LapTime"].min().reset_index()
    fastest["LapTime"] = fastest["LapTime"].apply( lambda x: f"{int(x.total_seconds() // 60)}:{x.total_seconds() % 60:.3f}".zfill(8))

    return fastest.to_dict(orient = "records")
