import React, { useState, useEffect } from 'react';
import Home from './components/home';
import Exercise from './components/exercise';

const schemes = {
  classic: {
    name: 'Classic',
    bg: '#414231',
    accent1: '#00CC58',
    accent2: '#a0dca3',
  },
  night: {
    name: 'Night',
    bg: '#1a1a2e',
    accent1: '#e94560',
    accent2: '#f5a623',
  },
  ocean: {
    name: 'Ocean',
    bg: '#0d2137',
    accent1: '#00b4d8',
    accent2: '#90e0ef',
  },
  slate: {
    name: 'Slate',
    bg: '#2b2d42',
    accent1: '#ef233c',
    accent2: '#8d99ae',
  },
  forest: {
    name: 'Forest',
    bg: '#1b2d1e',
    accent1: '#95d5b2',
    accent2: '#52b788',
  },
};

const languageOptionsList = [
  { lang: 'en', code: 'EN' }, { lang: 'es', code: 'ES' }, { lang: 'fr', code: 'FR' },
  { lang: 'de', code: 'DE' }, { lang: 'it', code: 'IT' }, { lang: 'ro', code: 'RO' },
  { lang: 'pt', code: 'PT' }, { lang: 'pl', code: 'PL' }, { lang: 'hu', code: 'HU' },
  { lang: 'ru', code: 'RU' }
];

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [scheme, setScheme] = useState('classic');
  const [schemeOpen, setSchemeOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('colorScheme');
    if (saved && schemes[saved]) setScheme(saved);
    const savedLang = localStorage.getItem('selectedLanguage');
    if (savedLang) setCurrentLang(savedLang);
  }, []);



  useEffect(() => {
    const s = schemes[scheme];
    document.documentElement.style.setProperty('--bg', s.bg);
    document.documentElement.style.setProperty('--accent1', s.accent1);
    document.documentElement.style.setProperty('--accent2', s.accent2);
    localStorage.setItem('colorScheme', scheme);

    // Update SVG favicon colors
    const svgElements = document.querySelectorAll('img[src*=".svg"]');
    svgElements.forEach(el => {
      fetch(el.src)
        .then(r => r.text())
        .then(svgText => {
          const updated = svgText
            .replace(/#00CC58/gi, s.accent1)
            .replace(/#414231/gi, s.bg);
          const blob = new Blob([updated], { type: 'image/svg+xml' });
          el.src = URL.createObjectURL(blob);
        });
    });

  }, [scheme]);

  const handleLangChange = (lang) => {
    setCurrentLang(lang);
    localStorage.setItem('selectedLanguage', lang);
    setLangOpen(false);
  };

  return (
    <>
      <header style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 20px',
        background: 'var(--bg, #414231)',
        backdropFilter: 'blur(6px)',
        borderBottom: '1px solid var(--accent1, #414231)',
      }}>
        {/* Logo */}
        <div
          onClick={() => setCurrentView('home')}
          style={{
            display: 'flex', alignItems: 'center',
            cursor: currentView === 'exercise' ? 'pointer' : 'default',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => { if (currentView === 'exercise') e.currentTarget.style.opacity = '0.7'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
        >
          <img src="/favicon.svg" alt="Muziko" style={{ height: '28px', marginRight: '10px' }} />
          <span style={{
            color: 'var(--accent1)',
            fontFamily: 'Courier New, monospace',
            fontWeight: 'bold',
            fontSize: '1.2rem',
            letterSpacing: '2px',
          }}>Muziko</span>
        </div>

        {/* Right side controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} onClick={e => e.stopPropagation()}>
          
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => { setLangOpen(o => !o); setSchemeOpen(false); }}
              className="language-btn"
            >
              <span>{currentLang.toUpperCase()}</span>
              <svg className="language-dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6,9 12,15 18,9"></polyline>
              </svg>
            </button>
            {langOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                background: '#414231',
                border: '2px solid #EFF7F8',
                borderRadius: '6px',
                minWidth: '110px',
                maxHeight: '150px',
                overflowY: 'auto',
                zIndex: 1001,
              }}>
                {languageOptionsList.map(opt => (
                  <button
                    key={opt.lang}
                    className={`language-option ${currentLang === opt.lang ? 'selected' : ''}`}
                    onClick={() => handleLangChange(opt.lang)}
                  >
                    <span>{opt.code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Color scheme picker */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => { setSchemeOpen(o => !o); setLangOpen(false); }}
              style={{
                background: 'none',
                border: '1px solid var(--accent1)',
                borderRadius: '6px',
                padding: '4px 10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'Courier New, monospace',
                fontSize: '0.75rem',
                color: 'var(--accent1)',
              }}
            >
              <span style={{
                width: '12px', height: '12px', borderRadius: '50%',
                background: schemes[scheme].accent1, display: 'inline-block'
              }} />
              {schemes[scheme].name}
            </button>
            {schemeOpen && (
              <div style={{
                position: 'absolute', top: '110%', right: 0,
                background: 'var(--bg)',
                border: '1px solid var(--accent1)',
                borderRadius: '6px',
                overflow: 'hidden',
                minWidth: '140px',
                zIndex: 1000,
              }}>
                {Object.entries(schemes).map(([key, s]) => (
                  <button
                    key={key}
                    onClick={() => { setScheme(key); setSchemeOpen(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      width: '100%', padding: '8px 12px',
                      background: scheme === key ? 'rgba(255,255,255,0.1)' : 'none',
                      border: 'none', cursor: 'pointer',
                      fontFamily: 'Courier New, monospace',
                      fontSize: '0.75rem',
                      color: s.accent1,
                    }}
                  >
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: s.accent1, flexShrink: 0 }} />
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: s.bg, border: '1px solid rgba(255,255,255,0.2)', flexShrink: 0 }} />
                    {s.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {currentView === 'home' && (
        <Home onStartTraining={() => setCurrentView('exercise')} currentLang={currentLang} />
      )}
      {currentView === 'exercise' && (
        <Exercise onBack={() => setCurrentView('home')} />
      )}
    </>
  );
}