import React, { useState, useCallback } from 'react';
import Piano from './piano';
import MusicStaff from './musicStaff';

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

  const startExercise = () => {
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

  const handleNoteOn = (midi) => {
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
  };

  const handleNoteOff = (midi) => {
    setPressedKeys(prev => {
      const next = new Set(prev);
      next.delete(midi);
      return next;
    });
  };

  return (
    <div className="app-container">
      <h1>Muziko</h1>
      <div className="controls">
        <button onClick={onBack}>Back</button>
        <button onClick={startExercise}>Start Training</button>
      </div>
      
      <MusicStaff 
        exercise={gameState.exercise} 
        currentIndex={gameState.index} 
        wrongIndex={gameState.wrongIndex}
        clef={gameState.clef}
      />

      <Piano 
        pressedKeys={pressedKeys} 
        onNoteOn={handleNoteOn} 
        onNoteOff={handleNoteOff} 
      />
    </div>
  );
}