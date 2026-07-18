import React from 'react';
import { Routes, Route } from 'react-router-dom';
import POSApp from './pages/POSApp';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/*" element={<POSApp />} />
    </Routes>
  );
}

export default App;
