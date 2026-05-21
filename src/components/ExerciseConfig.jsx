import React from 'react';
import '../css/exerciseConfig.css';

const configTranslations = {
  en: { classic: 'classic', timed: 'time', easy: 'easy', medium: 'medium', hard: 'hard', random: 'random' },
  es: { classic: 'clásico', timed: 'tiempo', easy: 'fácil', medium: 'medio', hard: 'difícil', random: 'aleatorio' },
  fr: { classic: 'classique', timed: 'temps', easy: 'facile', medium: 'moyen', hard: 'difficile', random: 'aléatoire' },
  de: { classic: 'klassisch', timed: 'zeit', easy: 'einfach', medium: 'mittel', hard: 'schwer', random: 'zufällig' },
  it: { classic: 'classico', timed: 'tempo', easy: 'facile', medium: 'medio', hard: 'difficile', random: 'casuale' },
  pt: { classic: 'clássico', timed: 'tempo', easy: 'fácil', medium: 'médio', hard: 'difícil', random: 'aleatório' },
  pl: { classic: 'klasyczny', timed: 'czas', easy: 'łatwy', medium: 'średni', hard: 'trudny', random: 'losowy' },
  ro: { classic: 'clasic', timed: 'timp', easy: 'ușor', medium: 'mediu', hard: 'greu', random: 'aleatoriu' },
  hu: { classic: 'klasszikus', timed: 'idő', easy: 'könnyű', medium: 'közepes', hard: 'nehéz', random: 'véletlen' },
  ru: { classic: 'классика', timed: 'время', easy: 'лёгкий', medium: 'средний', hard: 'сложный', random: 'случайный' }
};

export default function ExerciseConfig({ mode, setMode, difficulty, setDifficulty, currentLang = 'en' }) {
  const t = (key) => configTranslations[currentLang]?.[key] || configTranslations['en'][key];

  return (
    <div className="config-bar-wrapper">
      {/* Mode selector */}
      <div className="config-pill">
        <button
          className={`config-option ${mode === 'classic' ? 'active' : ''}`}
          onClick={() => setMode('classic')}
        >
          <span className="config-icon">♩</span> {t('classic')}
        </button>
        <button
          className={`config-option ${mode === 'timed' ? 'active' : ''}`}
          onClick={() => setMode('timed')}
        >
          <span className="config-icon">⏱</span> {t('timed')}
        </button>
      </div>

      {/* Difficulty selector */}
      <div className="config-pill">
        <button
          className={`config-option ${difficulty === 'easy' ? 'active' : ''}`}
          onClick={() => setDifficulty('easy')}
        >
          {t('easy')}
        </button>
        <button
          className={`config-option ${difficulty === 'medium' ? 'active' : ''}`}
          onClick={() => setDifficulty('medium')}
        >
          {t('medium')}
        </button>
        <button
          className={`config-option ${difficulty === 'hard' ? 'active' : ''}`}
          onClick={() => setDifficulty('hard')}
        >
          {t('hard')}
        </button>
        <button
          className={`config-option ${difficulty === 'random' ? 'active' : ''}`}
          onClick={() => setDifficulty('random')}
        >
          <span className="config-icon">⚄</span> {t('random')}
        </button>
      </div>
    </div>
  );
}