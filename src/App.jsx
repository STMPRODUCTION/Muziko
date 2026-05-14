import React, { useState } from 'react';
import Home from './components/home';
import Exercise from './components/exercise';

export default function App() {
  // This state remembers what page the user is currently looking at
  const [currentView, setCurrentView] = useState('home');

  return (
    <>
      {/* If currentView is 'home', render the Home component */}
      {currentView === 'home' && (
        <Home onStartTraining={() => setCurrentView('exercise')} />
      )}

      {/* If currentView is 'exercise', render the Piano/MIDI component */}
      {currentView === 'exercise' && (
        <Exercise onBack={() => setCurrentView('home')} />
      )}
    </>
  );
}