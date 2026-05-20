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
            display: 'flex', 
            alignItems: 'center',
            cursor: currentView === 'exercise' ? 'pointer' : 'default',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => { if (currentView === 'exercise') e.currentTarget.style.opacity = '0.7'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
        >
          {/* Inlined SVG */}
          <svg 
            version="1.0" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 500 500"
            style={{ height: '28px', width: 'auto', marginRight: '10px' }}
          >
            <g 
              transform="translate(0.000000,500.000000) scale(0.100000,-0.100000)"
              fill="var(--accent1)" 
              stroke="none"
            >
              <path d="M2708 3843 l-208 -3 -13 -28 c-8 -15 -137 -317 -288 -670 -227 -535
              -275 -641 -285 -627 -6 8 -141 307 -299 663 -159 356 -293 651 -299 655 -6 5
              -130 6 -276 3 -248 -6 -268 -8 -310 -29 -63 -31 -90 -75 -90 -147 0 -95 52
              -152 156 -172 l62 -11 7 -933 c4 -512 4 -937 1 -943 -4 -6 -31 -11 -59 -11
              -163 -1 -254 -161 -159 -279 54 -68 77 -71 497 -68 408 3 415 4 468 66 57 69
              58 158 0 222 -49 54 -86 64 -238 62 -72 -1 -136 1 -142 5 -12 8 -75 1771 -64
              1784 4 4 132 -293 286 -660 153 -367 287 -684 297 -705 l19 -38 157 3 157 3
              275 683 c151 375 280 690 287 700 10 13 11 -37 7 -243 -3 -143 -11 -540 -19
              -882 -7 -342 -16 -626 -19 -632 -5 -7 -54 -11 -134 -11 -143 0 -188 -9 -232
              -47 -42 -35 -60 -73 -60 -128 0 -55 18 -93 60 -129 53 -44 86 -47 483 -44 412
              3 403 2 464 72 37 42 49 99 32 154 -15 52 -52 88 -115 111 l-49 19 -3 217 -2
              218 37 33 c21 18 44 33 51 34 13 0 532 -477 532 -489 0 -3 -19 -15 -42 -26
              -59 -29 -88 -75 -88 -140 0 -66 29 -112 90 -142 43 -22 54 -23 326 -23 297 0
              367 7 415 41 89 63 82 207 -13 264 -27 16 -56 20 -149 23 l-116 4 -354 354
              c-349 349 -353 354 -334 372 23 22 346 299 448 385 l67 57 103 0 c87 0 110 4
              147 23 117 59 115 224 -4 278 -37 17 -70 19 -341 19 -179 0 -315 -4 -338 -11
              -83 -23 -136 -104 -121 -185 7 -40 54 -99 85 -109 10 -4 19 -12 18 -18 0 -14
              -389 -300 -413 -305 -15 -3 -16 44 -16 506 l0 509 47 24 c123 64 122 235 -2
              299 -55 28 -63 28 -387 23z"/>
            </g>
            <g 
              transform="translate(0.000000,500.000000) scale(0.100000,-0.100000)"
              fill="var(--bg)" 
              stroke="none"
            >
              <path d="M780 4985 c-189 -41 -361 -135 -496 -269 -118 -119 -207 -271 -256
              -441 l-23 -80 0 -1700 0 -1700 28 -88 c104 -333 341 -570 674 -674 l88 -28
              1705 0 1705 0 88 28 c166 52 307 135 423 251 116 116 199 257 251 423 l28 88
              0 1700 0 1700 -23 80 c-84 290 -271 512 -536 636 -44 20 -115 48 -156 61 l-75
              23 -1680 2 c-1409 1 -1690 -1 -1745 -12z m2315 -1165 c124 -64 125 -235 2
              -299 l-47 -24 0 -509 c0 -462 1 -509 16 -506 24 5 413 291 413 305 1 6 -8 14
              -18 18 -31 10 -78 69 -85 109 -15 81 38 162 121 185 23 7 159 11 338 11 271 0
              304 -2 341 -19 119 -54 121 -219 4 -278 -37 -19 -60 -23 -147 -23 l-103 0 -67
              -57 c-102 -86 -425 -363 -448 -385 -19 -18 -15 -23 334 -372 l354 -354 116 -4
              c93 -3 122 -7 149 -23 95 -57 102 -201 13 -264 -48 -34 -118 -41 -415 -41
              -272 0 -283 1 -326 23 -61 30 -90 76 -90 142 0 65 29 111 88 140 23 11 42 23
              42 26 0 12 -519 489 -532 489 -7 -1 -30 -16 -51 -34 l-37 -33 2 -218 3 -217
              49 -19 c63 -23 100 -59 115 -111 17 -55 5 -112 -32 -154 -61 -70 -52 -69 -464
              -72 -397 -3 -430 0 -483 44 -42 36 -60 74 -60 129 0 55 18 93 60 128 44 38 89
              47 232 47 80 0 129 4 134 11 3 6 12 290 19 632 8 342 16 739 19 882 4 206 3
              256 -7 243 -7 -10 -136 -325 -287 -700 l-275 -683 -157 -3 -157 -3 -19 38
              c-10 21 -144 338 -297 705 -154 367 -282 664 -286 660 -11 -13 52 -1776 64
              -1784 6 -4 70 -6 142 -5 152 2 189 -8 238 -62 58 -64 57 -153 0 -222 -53 -62
              -60 -63 -468 -66 -420 -3 -443 0 -497 68 -95 118 -4 278 159 279 28 0 55 5 59
              11 3 6 3 431 -1 943 l-7 933 -62 11 c-104 20 -156 77 -156 172 0 72 27 116 90
              147 42 21 62 23 310 29 146 3 270 2 276 -3 6 -4 140 -299 299 -655 158 -356
              293 -655 299 -663 10 -14 58 92 285 627 151 353 280 655 288 670 l13 28 208 3
              c324 5 332 5 387 -23z"/>
            </g>
          </svg>
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