import React, { useState } from 'react';
import Home from './components/home';
import Exercise from './components/exercise';

export default function App() {
  const [currentView, setCurrentView] = useState('home');

  return (
    <>
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 500,
        display: 'flex',
        alignItems: 'center',
        padding: '10px 20px',
        background: 'rgba(65, 66, 49, 0.9)',
        backdropFilter: 'blur(6px)',
        borderBottom: '1px solid rgba(0, 204, 88, 0.2)',
      }}>
      <div
      onClick={() => setCurrentView('home')}
      style={{
        display: 'flex',
        alignItems: 'center',
        cursor: currentView === 'exercise' ? 'pointer' : 'default',
        opacity: currentView === 'exercise' ? 1 : 1,
        transition: 'opacity 0.2s',
      }}
      onMouseEnter={e => { if (currentView === 'exercise') e.currentTarget.style.opacity = '0.7'; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
    >
      <img src="/favicon.png" alt="Muziko" style={{ height: '32px', marginRight: '10px' }} />
      <span style={{
        color: '#00CC58',
        fontFamily: 'Courier New, monospace',
        fontWeight: 'bold',
        fontSize: '2.4rem',
        letterSpacing: '2px',
      }}>Muziko</span>
      </div>
    </header>

      {currentView === 'home' && (
        <Home onStartTraining={() => setCurrentView('exercise')} />
      )}
      {currentView === 'exercise' && (
        <Exercise onBack={() => setCurrentView('home')} />
      )}
    </>
  );
}