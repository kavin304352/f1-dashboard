import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import driverData from './driverData';
import circuitData from './circuitData';

function TrackPage() {
  const { trackName } = useParams();
  const { state: selectedTrack } = useLocation();
  const [laps, setLaps] = useState([]);

  useEffect(() => {
    if (selectedTrack) {
      fetch(`http://127.0.0.1:5000/api/fastest-laps/${selectedTrack.year}/${selectedTrack.name}`)
        .then(res => res.json())
        .then(data => {
          const sorted = [...data].sort((a, b) => {
            const toSeconds = (str) => {
              const [min, sec] = str.split(':');
              return parseInt(min) * 60 + parseFloat(sec);
            };
            return toSeconds(a.LapTime) - toSeconds(b.LapTime);
          });
          setLaps(sorted);
        });
    }
  }, [selectedTrack]);

  const circuit = circuitData[selectedTrack?.name];

  return (
    <div style={
        { maxWidth: "800px",
         margin: "0 auto",
         padding: "2rem",
         textAlign: "center"
         
         }
        }>
      <h1>{selectedTrack?.name} ({selectedTrack?.year})</h1>
      {circuit && (
        <img
         src={circuit.image}
         alt={circuit.name} 
         width={600} 
         style={{ marginBottom: "2rem" }} />
      )}

      <h2>Fastest Laps</h2>
      <ul style={{ 
            padding: 0, 
            listStyle: "none", 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center" 
      }}>
        {laps.map((lap, i) => {
          const driver = driverData[lap.Driver];
          return (
            <li key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              {driver && (
                <>
                  <img src={driver.driverImg} alt={driver.name} width={60} style={{ marginRight: '1rem', borderRadius: '50%',}} />
                  <div>
                    <strong>{i + 1}. {driver.name}</strong> ({lap.Driver})<br />
                    <span>{lap.LapTime}</span><br />
                    <img src={driver.flagImg} alt={driver.name} width={30} />
                  </div>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default TrackPage;
