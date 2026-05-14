import React, { useState, useCallback } from 'react';
import Piano from './piano';
import MusicStaff from './musicStaff';
import '../css/piano.css'; 

export default function Exercise({ onBack }) {
  const [gameState, setGameState] = useState({
    exercise: [],
    index: 0,
    wrongIndex: -1,
    clef: "treble",
    attempted: 0,
    correct: 0
  });
  const [pressedKeys, setPressedKeys] = useState(new Set());

  // FIXED: Renamed to match the button's onClick call
  const startTraining = () => {
    const isTreble = Math.random() < 0.5;
    const range = isTreble ? [57, 84] : [36, 64];
    const notes = Array.from({ length: 8 }, () => 
      Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0]
    );
    
    setGameState({
      exercise: notes,
      index: 0,
      wrongIndex: -1,
      clef: isTreble ? "treble" : "bass",
      attempted: 0,
      correct: 0
    });
  };

  const handleNoteOn = useCallback((midi) => {
    setPressedKeys(prev => new Set(prev).add(midi));
    if (gameState.exercise.length === 0) return;

    setGameState(prev => {
      const isCorrect = midi === prev.exercise[prev.index];
      const newIndex = isCorrect ? prev.index + 1 : prev.index;
      
      return {
        ...prev,
        attempted: prev.attempted + 1,
        correct: isCorrect ? prev.correct + 1 : prev.correct,
        index: newIndex,
        wrongIndex: isCorrect ? -1 : prev.index
      };
    });
  }, [gameState.exercise]);

  const handleNoteOff = useCallback((midi) => {
    setPressedKeys(prev => {
      const next = new Set(prev);
      next.delete(midi);
      return next;
    });
  }, []);

 return (
    <div className="exercise-layout">
    {/* Header section centered to match your request */}
    <div className="exercise-header" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        padding: '20px',
        width: '100%' 
    }}>
        <h1 className="exercise-logo" style={{ 
        color: '#00CC58', 
        margin: '0 0 15px 0', 
        fontSize: '2.5rem',
        textAlign: 'center' 
        }}>Muziko</h1>
        
        <div className="button-group" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: '10px' 
        }}>
        {/* Back button hidden for now */}
        {false && <button className="nav-btn back-btn" onClick={onBack}>Back</button>}
        
        <button className="nav-btn start-btn" onClick={startTraining}>Start Training</button>
        </div>
    </div>
      
      {/* Staff rendering within the light grey box container */}
      <div className="staff-container" style={{ background: '#e0e0e0', padding: '30px', borderRadius: '10px', margin: '20px auto', width: 'fit-content', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.2)' }}>
        <MusicStaff 
          exercise={gameState.exercise} 
          currentIndex={gameState.index} 
          wrongIndex={gameState.wrongIndex}
          clef={gameState.clef}
        />
      </div>

      {/* Horizontal piano at bottom */}
      <Piano 
        pressedKeys={pressedKeys} 
        onNoteOn={handleNoteOn} 
        onNoteOff={handleNoteOff} 
      />
    </div>
  );
  //new commit
}