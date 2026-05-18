import React, { useState, useEffect } from 'react';
import '../css/style.css'; // Points to your CSS folder at the project root

const translations = {
  en: {
    'welcome-title': 'Welcome to Muziko',
    'tagline': 'Practice. Play. Progress.',
    'description-1': 'Muziko is one of the best ways to sharpen your sight-reading skills and grow as a musician.',
    'description-2': 'It connects seamlessly to any MIDI-enabled digital instrument—like a piano or MIDI guitar—and generates real musical scores in real time.',
    'description-3': 'Simply play the notes you see, and Muziko will provide instant feedback on your accuracy, helping you improve note by note.',
    'start-btn': 'Start Training',
    'terms': 'Terms of Service',
    'privacy': 'Privacy Policy',
    'legal': 'Legal'
  },
  es: {
    'welcome-title': 'Bienvenido a Muziko',
    'tagline': 'Practica. Toca. Progresa.',
    'description-1': 'Muziko is one of the best ways to sharpen your sight-reading skills and grow as a musician.',
    'description-2': 'Se conecta perfectamente a cualquier instrumento digital habilitado para MIDI, como un piano o guitarra MIDI, и genera partituras musicales reales en tiempo real.',
    'description-3': 'Simplemente toca las notas que ves, y Muziko te proporcionará comentarios instantáneos sobre tu precisión, ayudándote a mejorar nota por nota.',
    'start-btn': 'Comenzar Entrenamiento',
    'terms': 'Términos de Servicio',
    'privacy': 'Política de Privacidad',
    'legal': 'Legal'
  },
  fr: {
    'welcome-title': 'Bienvenue sur Muziko',
    'tagline': 'Pratiquez. Jouez. Progressez.',
    'description-1': "Muziko est l'un des meilleurs moyens d'améliorer vos compétences de lecture à vue et de grandir en tant que musicien.",
    'description-2': 'Il se connecte parfaitement à tout instrument numérique compatible MIDI - comme un piano ou une guitare MIDI - et génère de vraies partitions musicales en temps réel.',
    'description-3': 'Jouez simplement les notes que vous voyez, et Muziko vous fournira des commentaires instantanés sur votre précision, vous aidant à vous améliorer note par note.',
    'start-btn': "Commencer l'Entraînement",
    'terms': 'Conditions de Service',
    'privacy': 'Politique de Confidentialité',
    'legal': 'Légal'
  },
  de: {
    'welcome-title': 'Willkommen bei Muziko',
    'tagline': 'Üben. Spielen. Fortschreiten.',
    'description-1': 'Muziko ist einer der besten Wege, um Ihre Vom-Blatt-Spiel-Fähigkeiten zu schärfen und als Musiker zu wachsen.',
    'description-2': 'Es verbindet sich nahtlos mit jedem MIDI-fähigen digitalen Instrument - wie einem Klavier oder einer MIDI-Gitarre - und erzeugt echte Musiknoten in Echtzeit.',
    'description-3': 'Spielen Sie einfach die Noten, die Sie sehen, und Muziko wird Ihnen sofortiges Feedback zu Ihrer Genauigkeit geben und Ihnen helfen, Note für Note besser zu werden.',
    'start-btn': 'Training Starten',
    'terms': 'Nutzungsbedingungen',
    'privacy': 'Datenschutzrichtlinie',
    'legal': 'Rechtliches'
  },
  it: {
    'welcome-title': 'Benvenuto su Muziko',
    'tagline': 'Esercitati. Suona. Progredisci.',
    'description-1': 'Muziko è uno dei modi migliori per migliorare le tue abilità di lettura a prima vista e crescere come cantante o musicista.',
    'description-2': 'Si collega perfettamente a qualsiasi strumento digitale abilitato per MIDI, como un pianoforte o una chitarra MIDI, e genera spartiti musicali reali in tempo real.',
    'description-3': 'Suona semplicemente le notes che vedi e Muziko ti fornirà un feedback immediato sulla tua precisione, aiutandoti a migliorare nota dopo nota.',
    'start-btn': "Inizia l'allenamento",
    'terms': 'Termini di Servizio',
    'privacy': 'Politica sulla Privacy',
    'legal': 'Legale'
  },
  pt: {
    'welcome-title': 'Bem-vindo ao Muziko',
    'tagline': 'Pratique. Toque. Progrida.',
    'description-1': 'Muziko é uma das melhores maneiras de aprimorar suas habilidades de leitura à primeira vista e crescer como músico.',
    'description-2': 'Ele se conecta perfeitamente a qualquer instrumento digital compatível com MIDI - como um piano ou guitarra MIDI - e gera partituras reais em tempo real.',
    'description-3': 'Basta tocar as notas que você vê e o Muziko fornecerá feedback instantâneo sobre sua precisão, ajudando você a melhorar nota por nota.',
    'start-btn': 'Iniciar Treinamento',
    'terms': 'Termos de Serviço',
    'privacy': 'Política de Privacidade',
    'legal': 'Legal'
  },
  pl: {
    'welcome-title': 'Witamy w Muziko',
    'tagline': 'Ćwicz. Graj. Postępuj.',
    'description-1': 'Muziko to jeden z najlepszych sposobów na poprawę umiejętności czytania nut a vista i rozwój jako muzyk.',
    'description-2': 'Łączy się bezproblemowo z każdym cyfrowym instrumentem MIDI, takim jak pianino lub gitara MIDI, i generuje prawdziwe nuty w czasie rzeczywistym.',
    'description-3': 'Wystarczy, że zagrasz nuty, które widzisz, a Muziko natychmiast oceni Twoją dokładność, pomagając Ci poprawiać się nuta po nucie.',
    'start-btn': 'Rozpocznij trening',
    'terms': 'Regulamin',
    'privacy': 'Polityka prywatności',
    'legal': 'Informacje prawne'
  },
  ro: {
    'welcome-title': 'Bun venit la Muziko',
    'tagline': 'Exersează. Cântă. Progresează.',
    'description-1': 'Muziko este una dintre cele mai bune metode de a-ți îmbunătăți abilitățile de citire la prima vedere și de a te dezvolta ca muzician.',
    'description-2': 'Se conectează perfect la orice instrument digital compatibil MIDI – cum ar fi un pian sau o chitară MIDI – și generează partituri reale în timp real.',
    'description-3': 'Cântă notele pe care le vezi, iar Muziko îți va oferi feedback instantaneu despre acuratețea ta, ajutându-te să progresezi notă cu notă.',
    'start-btn': 'Începe antrenamentul',
    'terms': 'Termeni și condiții',
    'privacy': 'Politica de confidențialitate',
    'legal': 'Legal'
  },
  hu: {
    'welcome-title': 'Üdvözlünk a Muzikóban',
    'tagline': 'Gyakorolj. Játssz. Fejlődj.',
    'description-1': 'A Muziko az egyik legjobb módja annak, hogy fejleszd a kottaolvasási képességeidet és zenészként fejlődj.',
    'description-2': 'Zökkenőmentesen csatlakozik bármilyen MIDI-kompatibilis digitális hangszerhez, például MIDI-zongorához vagy -gitárhoz, és valós időben generál valódi kottát.',
    'description-3': 'Egyszerűen játszd le a látott hangokat, a Muziko azonnali visszajelzést ad a pontosságodról, segítve a fejlődésed hangról hangra.',
    'start-btn': 'Edzés indítása',
    'terms': 'Felhasználási feltételek',
    'privacy': 'Adatvédelmi irányelvek',
    'legal': 'Jogi információk'
  },
  ru: {
    'welcome-title': 'Добро пожаловать в Muziko',
    'tagline': 'Тренируйся. Играй. Развивайся.',
    'description-1': 'Muziko — один из лучших способов улучшить навыки чтения с листа и развиваться как музыкант.',
    'description-2': 'Он беспрепятственно подключается к любому цифровому инструменту с поддержкой MIDI, например, к MIDI-фортепиано или гитаре, и в реальном времени генерирует настоящие ноты.',
    'description-3': 'Просто играйте ноты, которые вы видите, и Muziko сразу оценит точность, помогая вам совершенствоваться шаг за шагом.',
    'start-btn': 'Начать тренировку',
    'terms': 'Условия использования',
    'privacy': 'Политика конфиденциальности',
    'legal': 'Правовая информация'
  }
};

const languageOptionsList = [
  { lang: 'en', code: 'EN' }, { lang: 'es', code: 'ES' }, { lang: 'fr', code: 'FR' },
  { lang: 'de', code: 'DE' }, { lang: 'it', code: 'IT' }, { lang: 'ro', code: 'RO' },
  { lang: 'pt', code: 'PT' }, { lang: 'pl', code: 'PL' }, { lang: 'hu', code: 'HU' },
  { lang: 'ru', code: 'RU' }
];

export default function Home({ onStartTraining }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage && translations[savedLanguage]) {
      setCurrentLang(savedLanguage);
    }
  }, []);

  const t = (key) => translations[currentLang]?.[key] || translations['en'][key];

  const handleLanguageChange = (lang) => {
    if (lang === currentLang) { setDropdownOpen(false); return; }
    setIsTranslating(true);
    setDropdownOpen(false);
    setTimeout(() => {
      setCurrentLang(lang);
      localStorage.setItem('selectedLanguage', lang);
      setIsTranslating(false);
    }, 500);
  };

  useEffect(() => {
    const handleOutsideClick = () => setDropdownOpen(false);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  return (
    <div className="home-wrapper">
      <div className="container">
        <h1>{t('welcome-title')}</h1>
        <div className="tagline">{t('tagline')}</div>
        <div className="description">
          <p><strong>{t('description-1')}</strong></p>
          <p>{t('description-2')}</p>
          <p>{t('description-3')}</p>
        </div>
        <button className="start-btn" onClick={onStartTraining}>
          {t('start-btn')}
        </button>
      </div>

      <div className="footer">
        <div className="footer-left">
          <span><a href="#">{t('terms')}</a></span>
          <span><a href="#">{t('privacy')}</a></span>
          <span><a href="#">{t('legal')}</a></span>
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