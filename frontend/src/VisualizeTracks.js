import React, { useEffect, useState } from 'react';
import { Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Title,
  LineElement,
} from 'chart.js';
import driverData from './driverData';

ChartJS.register(LinearScale, PointElement, Tooltip, Title, LineElement);

function VisualizeTracks() {
  const [comparisonPoints, setComparisonPoints] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('VER');
  const [secondDriver, setSecondDriver] = useState('');

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/tracks")
      .then(res => res.json())
      .then(data => {
        const filtered = data.filter(track =>
          track.year === 2025 &&
          !track.name.toLowerCase().includes("testing")
        );
        setTracks(filtered);
        if (filtered.length > 0) {
          setSelectedTrack(filtered[0].name);
        }
      })
      .catch(err => console.error("Failed to load track list", err));
  }, []);

  useEffect(() => {
    if (selectedTrack && selectedDriver && secondDriver) {
      fetch(`http://127.0.0.1:5000/api/compare-lines/2025/${selectedTrack}/${selectedDriver}/${secondDriver}`)
        .then((res) => res.json())
        .then((data) => setComparisonPoints(data))
        .catch((err) => console.error("Failed to load comparison data", err));
    } else if (selectedTrack && selectedDriver) {
      fetch(`http://127.0.0.1:5000/api/track-position/2025/${selectedTrack}/${selectedDriver}`)
        .then((res) => res.json())
        .then((data) => setComparisonPoints(data))
        .catch((err) => console.error("Failed to load track position data", err));
    } else {
      setComparisonPoints([]);
    }
  }, [selectedTrack, selectedDriver, secondDriver]);

  const chartData = {
    datasets: secondDriver
      ? comparisonPoints.slice(1).map((point, i) => {
          const prev = comparisonPoints[i];
          const faster = point.faster;
          return {
            label: '',
            data: [
              { x: prev.x, y: prev.y },
              { x: point.x, y: point.y }
            ],
            borderColor: faster === selectedDriver ? '#e10600' : '#004CFF',
            borderWidth: 2,
            showLine: true,
            pointRadius: 0,
          };
        })
      : [
          {
            label: `${selectedDriver} Racing Line`,
            data: comparisonPoints,
            backgroundColor: '#e10600',
            pointRadius: 1.5,
          },
        ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: { enabled: true },
      title: {
        display: true,
        text: `Track Position – ${selectedTrack} 2025`,
        font: { size: 18 },
      },
      legend: { display: false }
    },
    scales: {
      x: {
        type: 'linear',
        title: { display: true, text: 'X Position' },
      },
      y: {
        type: 'linear',
        title: { display: true, text: 'Y Position' },
      },
    },
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Track Position Plot</h2>

      <div style={{ marginBottom: '1.5rem' }}>
        <select value={selectedTrack} onChange={e => setSelectedTrack(e.target.value)}>
          {tracks.map((track, idx) => (
            <option key={idx} value={track.name}>{track.name}</option>
          ))}
        </select>

        <select value={selectedDriver} onChange={e => setSelectedDriver(e.target.value)} style={{ marginLeft: '1rem' }}>
          {Object.keys(driverData).map((code, idx) => (
            <option key={idx} value={code}>{code} - {driverData[code].name}</option>
          ))}
        </select>

        <select value={secondDriver} onChange={e => setSecondDriver(e.target.value)} style={{ marginLeft: '1rem' }}>
          <option value="">None</option>
          {Object.keys(driverData).map((code, idx) => (
            <option key={idx} value={code}>{code} - {driverData[code].name}</option>
          ))}
        </select>
      </div>

      <div style={{ height: '600px', width: '100%' }}>
        <Scatter data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}

export default VisualizeTracks;
