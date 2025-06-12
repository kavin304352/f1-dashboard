import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import circuitData from './circuitData';

function Home() {
  const [tracks, setTracks] = useState([]);
  const navigate = useNavigate();


  //Load all the available tracks 
  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/tracks")
      .then(res => res.json())
      .then(data => {
      console.log("TRACKS FROM API:", data); //  helps verify
      setTracks(data);
    })
      .catch(err => console.error("Error fetching tracks:", err));
  }, []);
 return (
    <div style={{ padding: "2rem"}}>
      <h1>F1 Fastest Laps Dashboard</h1>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {tracks
          .filter(track => !track.name.toLowerCase().includes("testing"))
          .map((track, idx) => {
            const circuit = circuitData[track.name];
            return (
              <li
                key={idx}
                onClick={() => navigate(`/track/${encodeURIComponent(track.name)}`, { state: track })}
                style={{
                  cursor: "pointer",
                  marginBottom: "1rem",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <span style={{ color: "red", textDecoration: "underline", marginRight: "1rem" }}>
                  {track.name} ({track.year})
                </span>
                {circuit && (
                  <img src={circuit.image} alt={track.name} width={100} />
                )}
              </li>
            );
          })}
      </ul>
    </div>
  );
}

export default Home;