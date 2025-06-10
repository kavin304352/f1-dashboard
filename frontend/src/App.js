import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import TrackPage from './TrackPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/track/:trackName" element={<TrackPage />} />
    </Routes>
  );
}

export default App;
