import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainMenu from './MainMenu';
import Home from './Home'; // Fastest laps list
import TrackPage from './TrackPage'; // Fastest lap detail view
import CompareDrivers from './CompareDrivers';
import VisualizeTracks from './VisualizeTracks';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainMenu />} />
      <Route path="/fastest-laps" element={<Home />} />
      <Route path="/track/:trackName" element={<TrackPage />} />
      <Route path="/compare-drivers" element={<CompareDrivers />} />
      <Route path="/visualize-tracks" element={<VisualizeTracks />} />
    </Routes>
  );
}

export default App;
