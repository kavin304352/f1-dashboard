import React, { useState, useEffect } from 'react';
import driverData from './driverData';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Title);

function CompareDrivers() {
  const [selectedOne, setSelectedOne] = useState(null);
  const [selectedTwo, setSelectedTwo] = useState(null);
  const [comparisonStats, setComparisonStats] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState('');
  const [lapData, setLapData] = useState({});
  const [deltaMode, setDeltaMode] = useState(false);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/tracks")
      .then(res => res.json())
      .then(data => {
        const filtered = data.filter(track => track.year === 2025 && !track.name.toLowerCase().includes("testing"));
        setTracks(filtered);
        if (filtered.length > 0) {
          setSelectedTrack(filtered[0].name);
        }
      });
  }, []);

  useEffect(() => {
    if (selectedOne && selectedTwo && selectedTrack) {
      fetch(`http://127.0.0.1:5000/api/compare-head-to-head/2025/${selectedTrack}/${selectedOne.code}/${selectedTwo.code}`)
        .then(res => res.json())
        .then(data => setComparisonStats(data))
        .catch(err => console.error("Failed to fetch comparison data", err));

      fetch(`http://127.0.0.1:5000/api/lap-times/2025/${selectedTrack}/${selectedOne.code}`)
        .then(res => res.json())
        .then(data => setLapData(prev => ({ ...prev, [selectedOne.code]: data })));

      fetch(`http://127.0.0.1:5000/api/lap-times/2025/${selectedTrack}/${selectedTwo.code}`)
        .then(res => res.json())
        .then(data => setLapData(prev => ({ ...prev, [selectedTwo.code]: data })));
    }
  }, [selectedOne, selectedTwo, selectedTrack]);

  const teams = {};
  for (const code in driverData) {
    const driver = driverData[code];
    const teamName = driver.team || "Unknown";
    if (!teams[teamName]) {
      teams[teamName] = [];
    }
    teams[teamName].push({ code, ...driver });
  }

  const handleSelect = (driver) => {
    if (!selectedOne || selectedTwo) {
      setSelectedOne(driver);
      setSelectedTwo(null);
      setComparisonStats(null);
      setLapData({});
    } else {
      setSelectedTwo(driver);
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "N/A";
    return timeStr.replace("0 days ", "").replace(/^00:/, "");
  };

  const getColor = (s1, s2, sector) => {
    const val1 = parseFloat(s1?.[sector]?.split(':').pop());
    const val2 = parseFloat(s2?.[sector]?.split(':').pop());
    if (!isNaN(val1) && !isNaN(val2)) {
      if (val1 < val2) return ['green', '#cc8400'];
      if (val1 > val2) return ['#cc8400', 'green'];
      return ['green', 'green'];
    }
    return ['black', 'black'];
  };

  const renderLapChart = () => {
    if (!selectedOne || !selectedTwo || !lapData[selectedOne.code] || !lapData[selectedTwo.code]) return null;

    const laps1 = lapData[selectedOne.code];
    const laps2 = lapData[selectedTwo.code];
    const labels = laps1.map(l => l.lap);

    const dataset1 = laps1.map(l => l.time);
    const dataset2 = laps2.map(l => l.time);

    const deltaData = dataset1.map((val, i) => parseFloat((val - dataset2[i]).toFixed(3)));

    return (
      <div style={{ width: '90%', marginTop: '2rem' }}>
        <h3 style={{ textAlign: 'center' }}>Lap Time Comparison</h3>
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <label>
            <input type="checkbox" checked={deltaMode} onChange={() => setDeltaMode(!deltaMode)} /> Show Time Delta
          </label>
        </div>
        <Line
          data={{
            labels,
            datasets: deltaMode ? [
              {
                label: `${selectedOne.code} - ${selectedTwo.code} Δ (s)`,
                data: deltaData,
                borderColor: '#9b59b6',
                backgroundColor: 'transparent',
                tension: 0.3,
              }
            ] : [
              {
                label: selectedOne.code,
                data: dataset1,
                borderColor: '#e39a06',
                backgroundColor: 'transparent',
                tension: 0.3,
              },
              {
                label: selectedTwo.code,
                data: dataset2,
                borderColor: '#0366d6',
                backgroundColor: 'transparent',
                tension: 0.3,
              }
            ]
          }}
          options={{
            responsive: true,
            plugins: {
              legend: { position: 'top' },
              tooltip: { enabled: true },
              title: { display: false }
            },
            scales: {
              y: {
                title: { display: true, text: deltaMode ? 'Time Δ (s)' : 'Lap Time (s)' }
              },
              x: {
                title: { display: true, text: 'Lap Number' }
              }
            }
          }}
        />
      </div>
    );
  };

  const renderDriverCard = (driver, stats, otherStats) => {
    // eslint-disable-next-line
    const [s1Color, _] = getColor(stats, otherStats, 'sector1');
    // eslint-disable-next-line
    const [s2Color, __] = getColor(stats, otherStats, 'sector2');
    // eslint-disable-next-line
    const [s3Color, ___] = getColor(stats, otherStats, 'sector3');

    return (
      <div style={{ textAlign: 'center', width: '100%' }}>
        <img src={driver.driverImg} alt={driver.name} style={{ width: '40%', borderRadius: '10px' }} />
        <h3 style={{ marginTop: '1rem' }}>{driver.name}</h3>
        <p><strong>Team:</strong> {driver.team}</p>
        <p><strong>Nationality:</strong> {driver.nationality}</p>
        {driver.flagImg && (
          <img src={driver.flagImg} alt={driver.nationality} style={{ width: 30, marginTop: '0.5rem' }} />
        )}
        {stats && (
          <div style={{ marginTop: '1rem' }}>
            <p><strong>Sector 1:</strong> <span style={{ color: s1Color }}>{formatTime(stats.sector1)}</span></p>
            <p><strong>Sector 2:</strong> <span style={{ color: s2Color }}>{formatTime(stats.sector2)}</span></p>
            <p><strong>Sector 3:</strong> <span style={{ color: s3Color }}>{formatTime(stats.sector3)}</span></p>
            <p><strong>Pit Stops:</strong> {stats.pitStops}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '200%', fontFamily: 'Exo 2, sans-serif' }}>
      <div style={{ display: 'flex', flex: 1 }}>
        <div style={{ flex: 1, padding: '2rem', overflowY: 'scroll' }}>
          <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Compare Drivers</h1>
          <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
            <label htmlFor="track">Select Track: </label>
            <select id="track" value={selectedTrack} onChange={e => setSelectedTrack(e.target.value)}>
              {tracks.map((track, idx) => (
                <option key={idx} value={track.name}>{track.name}</option>
              ))}
            </select>
          </div>
          {Object.entries(teams).sort(([a], [b]) => a.localeCompare(b)).map(([team, drivers], idx) => (
            <div key={idx} style={{ marginBottom: '2rem' }}>
              <h2 style={{ marginBottom: '1rem' }}>{team}</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                {drivers.map((driver) => (
                  <button
                    key={driver.code}
                    style={{
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                    onClick={() => handleSelect(driver)}
                  >
                    <img
                      src={driver.driverImg}
                      alt={driver.name}
                      width={70}
                      height={70}
                      style={{ borderRadius: '50%', objectFit: 'cover', display: 'block', marginBottom: '0.3rem' }}
                    />
                    <span>{driver.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ flex: 1, padding: '2rem' }}>
          {selectedOne ? renderDriverCard(selectedOne, comparisonStats?.[selectedOne.code], comparisonStats?.[selectedTwo?.code]) : <p>Select a driver</p>}
          {renderLapChart()}
        </div>
        <div style={{ flex: 1, padding: '2rem' }}>
          {selectedTwo ? renderDriverCard(selectedTwo, comparisonStats?.[selectedTwo.code], comparisonStats?.[selectedOne?.code]) : <p>Select a second driver</p>}
        </div>
      </div>
    </div>
  );
}

export default CompareDrivers;
