import React from 'react';
import '../css/exerciseConfig.css';

export default function ExerciseConfig({ mode, setMode, difficulty, setDifficulty }) {
  return (
    <div className="config-bar-wrapper">
      {/* Mode selector */}
      <div className="config-pill">
        <button
          className={`config-option ${mode === 'classic' ? 'active' : ''}`}
          onClick={() => setMode('classic')}
        >
          <span className="config-icon">♩</span> classic
        </button>
        <button
          className={`config-option ${mode === 'timed' ? 'active' : ''}`}
          onClick={() => setMode('timed')}
        >
          <span className="config-icon">⏱</span> time
        </button>
      </div>

      {/* Difficulty selector */}
      <div className="config-pill">
        <button
          className={`config-option ${difficulty === 'easy' ? 'active' : ''}`}
          onClick={() => setDifficulty('easy')}
        >
          easy
        </button>
        <button
          className={`config-option ${difficulty === 'medium' ? 'active' : ''}`}
          onClick={() => setDifficulty('medium')}
        >
          medium
        </button>
        <button
          className={`config-option ${difficulty === 'hard' ? 'active' : ''}`}
          onClick={() => setDifficulty('hard')}
        >
          hard
        </button>
        <button
          className={`config-option ${difficulty === 'random' ? 'active' : ''}`}
          onClick={() => setDifficulty('random')}
        >
          <span className="config-icon">⚄</span> random
        </button>
      </div>
    </div>
  );
}