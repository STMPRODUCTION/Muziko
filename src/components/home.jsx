import React from 'react';
import '@/css/style.css'; 
export default function Home({ onStartTraining }) {
  return (
    <div className="home-wrapper">
      {/* Custom Language Selector */}
      <div className="language-selector">
        <div className="language-dropdown" id="languageDropdown">
          <button className="language-btn" id="languageBtn">
            <span className="language-text">EN</span>
            <svg className="language-dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6,9 12,15 18,9"></polyline>
            </svg>
          </button>
          <div className="language-options" id="languageOptions">
            <button className="language-option selected" data-lang="en" data-code="EN"><span>EN</span></button>
            <button className="language-option" data-lang="es" data-code="ES"><span>ES</span></button>
            <button className="language-option" data-lang="fr" data-code="FR"><span>FR</span></button>
            <button className="language-option" data-lang="de" data-code="DE"><span>DE</span></button>
            <button className="language-option" data-lang="it" data-code="IT"><span>IT</span></button>
            <button className="language-option" data-lang="ro" data-code="RO"><span>RO</span></button>
            <button className="language-option" data-lang="pt" data-code="PT"><span>PT</span></button>
            <button className="language-option" data-lang="pl" data-code="PL"><span>PL</span></button>
            <button className="language-option" data-lang="hu" data-code="HU"><span>HU</span></button>
            <button className="language-option" data-lang="ru" data-code="RU"><span>RU</span></button>
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      <div className="translate-loading" id="translateLoading">
        <div className="spinner"></div>
        Translating...
      </div>
      
      <div className="container">
        <h1 data-translate="welcome-title">Welcome to Muziko</h1>
        <div className="tagline" data-translate="tagline">Practice. Play. Progress.</div>
        <div className="description">
          <p data-translate="description-1"><strong>Muziko is one of the best ways to sharpen your sight-reading skills and grow as a musician.</strong></p>
          <p data-translate="description-2">It connects seamlessly to any MIDI-enabled digital instrument—like a piano or MIDI guitar—and generates real musical scores in real time.</p>
          <p data-translate="description-3">Simply play the notes you see, and Muziko will provide instant feedback on your accuracy, helping you improve note by note.</p>
        </div>
        {/* Instead of a standard link that reloads the page, we use a button click to trigger React */}
        <button className="start-btn" onClick={onStartTraining} data-translate="start-btn">
          Start Training
        </button>
      </div>

      <div className="footer">
        <div className="footer-left">
          <span><a href="#" data-translate="terms">Terms of Service</a></span>
          <span><a href="#" data-translate="privacy">Privacy Policy</a></span>
          <span><a href="#" data-translate="legal">Legal</a></span>
        </div>
        <div className="footer-right">
          <a href="https://github.com/STMPRODUCTION/Muziko" target="_blank" rel="noreferrer">
            <img src="/github.png" alt="GitHub" />
          </a>
        </div>
      </div>
    </div>
  );
}