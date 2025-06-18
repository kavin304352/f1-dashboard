import React from 'react';
import { useNavigate } from 'react-router-dom';

function MainMenu() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: 'center', marginTop: '5rem' }}>
      <h1 style={{ fontFamily: 'Exo 2, sans-serif' }}>F1 Data Dashboard</h1>

      <img
        src="/redbull.jpg"  
        style={{
          width: '80%',
          maxWidth: '900px',
          borderRadius: '12px',
          marginTop: '2rem',
          boxShadow: '0 0 30px rgba(0,0,0,0.15)'
        }}
      />
      <div style={{ marginTop: '3rem' }}>
        <button onClick={() => navigate('/fastest-laps')} style={btnStyle}>Fastest Laps</button>
        <button onClick={() => navigate('/compare-drivers')} style={btnStyle}>Compare Drivers</button>
        <button onClick={() => navigate('/visualize-tracks')} style={btnStyle}>Visualize Tracks</button>
      </div>
    </div>
  );
}

const btnStyle = {
  fontSize: '1.2rem',
  padding: '1rem 2rem',
  margin: '1rem',
  borderRadius: '10px',
  border: 'none',
  backgroundColor: '#e10600',
  color: 'white',
  cursor: 'pointer',
  fontFamily: 'Exo 2, sans-serif'
};

export default MainMenu;
