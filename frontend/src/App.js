import React, { useEffect, useState } from 'react';

function App() {
  const [laps, setLaps] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/fastest-laps/2025/Monaco")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch data");
        return res.json();
      })
      .then((data) => setLaps(data))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>Fastest Laps - Monaco 2025</h1>

      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {laps.length === 0 && !error && <p>Loading...</p>}

      <ul>
        {laps.map((lap, index) => (
          <li key={index}>
            <strong>{lap.Driver}</strong>: {lap.LapTime.replace('0 days ', '')}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
