import React, { useState, useCallback, useRef, useEffect } from 'react';
import Piano from './piano';
import MusicStaff from './musicStaff';
import '../css/piano.css';
import ExerciseResults from './ExerciseResults';
import ExerciseConfig from './ExerciseConfig';
import { generateExercise } from './generateExercise';

const translations = {
  en: {
    status_message: 'Click "Start Exercise" to begin',
    midi_connected: 'MIDI device connected!',
    no_midi_found: 'No MIDI device found. Using virtual piano.',
    midi_failed: 'MIDI access failed. Using virtual piano.',
    device_virtual: 'Virtual Piano',
    device_midi: 'External MIDI Device',
    start_exercise: 'Start Exercise',
    accuracy: 'Accuracy',
    time: 'Time',
    notes: 'Notes'
  },
  es: {
    status_message: 'Haz clic en "Comenzar Ejercicio" para empezar',
    midi_connected: '¡Dispositivo MIDI conectado!',
    no_midi_found: 'No se encontró ningún dispositivo MIDI. Usando piano virtual.',
    midi_failed: 'Error de acceso MIDI. Usando piano virtual.',
    device_virtual: 'Piano Virtual',
    device_midi: 'Dispositivo MIDI Externo',
    start_exercise: 'Comenzar Ejercicio',
    accuracy: 'Precisión',
    time: 'Tiempo',
    notes: 'Notas'
  },
  fr: {
    status_message: 'Cliquez sur "Commencer l\'Exercice" pour débuter',
    midi_connected: 'Dispositif MIDI connecté !',
    no_midi_found: 'Aucun périphérique MIDI trouvé. Utilisation du piano virtuel.',
    midi_failed: 'Échec de l\'accès MIDI. Utilisation du piano virtuel.',
    device_virtual: 'Piano Virtuel',
    device_midi: 'Appareil MIDI Externe',
    start_exercise: 'Commencer l\'Exercice',
    accuracy: 'Précision',
    time: 'Temps',
    notes: 'Notes'
  },
  de: {
    status_message: 'Klicken Sie auf "Übung starten", um zu beginnen',
    midi_connected: 'MIDI-Gerät verbunden!',
    no_midi_found: 'Kein MIDI-Gerät gefunden. Virtuelles Klavier wird verwendet.',
    midi_failed: 'MIDI-Zugriff fehlschlagen. Virtuelles Klavier wird verwendet.',
    device_virtual: 'Virtuelles Klavier',
    device_midi: 'Externes MIDI-Gerät',
    start_exercise: 'Übung Starten',
    accuracy: 'Genauigkeit',
    time: 'Zeit',
    notes: 'Noten'
  },
  it: {
    status_message: 'Clicca su "Inizia esercizio" per cominciare',
    midi_connected: 'Dispositivo MIDI connesso!',
    no_midi_found: 'Nessun dispositivo MIDI trovato. Uso del pianoforte virtuale.',
    midi_failed: 'Accesso MIDI fallito. Uso del pianoforte virtuale.',
    device_virtual: 'Pianoforte Virtuale',
    device_midi: 'Dispositivo MIDI Esterno',
    start_exercise: 'Inizia Esercizio',
    accuracy: 'Precisione',
    time: 'Tempo',
    notes: 'Note'
  },
  pt: {
    status_message: 'Clique em "Iniciar Exercício" para começar',
    midi_connected: 'Dispositivo MIDI conectado!',
    no_midi_found: 'Nenhum dispositivo MIDI encontrado. Usando piano virtual.',
    midi_failed: 'Falha no acesso MIDI. Usando piano virtual.',
    device_virtual: 'Piano Virtual',
    device_midi: 'Dispositivo MIDI Externo',
    start_exercise: 'Iniciar Exercício',
    accuracy: 'Precisão',
    time: 'Tempo',
    notes: 'Notas'
  },
  pl: {
    status_message: 'Kliknij "Rozpocznij ćwiczenie", aby rozpocząć',
    midi_connected: 'Urządzenie MIDI podłączone!',
    no_midi_found: 'Nie znaleziono urządzenia MIDI. Używanie wirtualnego pianina.',
    midi_failed: 'Brak dostępu do MIDI. Używanie wirtualnego pianina.',
    device_virtual: 'Wirtualne Pianino',
    device_midi: 'Zewnętrzne Urządzenie MIDI',
    start_exercise: 'Rozpocznij Ćwiczenie',
    accuracy: 'Dokładność',
    time: 'Czas',
    notes: 'Nuty'
  },
  ro: {
    status_message: 'Apasă pe "Începe exercițiul" pentru a începe',
    midi_connected: 'Dispozitiv MIDI conectat!',
    no_midi_found: 'Nu s-a găsit niciun dispozitiv MIDI. Se folosește pianul virtual.',
    midi_failed: 'Accesul MIDI a eșuat. Se folosește pianul virtual.',
    device_virtual: 'Pian Virtual',
    device_midi: 'Dispozitiv MIDI Extern',
    start_exercise: 'Începe Exercițiul',
    accuracy: 'Acuratețe',
    time: 'Timp',
    notes: 'Note'
  },
  hu: {
    status_message: 'Kattints a "Gyakorlat indítása" gombra a kezdéshez',
    midi_connected: 'MIDI eszköz csatlakoztatva!',
    no_midi_found: 'Nem található MIDI eszköz. Virtuális zongora használata.',
    midi_failed: 'MIDI hozzáférés sikertelen. Virtuális zongora használata.',
    device_virtual: 'Virtuális Zongora',
    device_midi: 'Külső MIDI Eszköz',
    start_exercise: 'Gyakorlat Indítása',
    accuracy: 'Pontosság',
    time: 'Idő',
    notes: 'Hangok'
  },
  ru: {
    status_message: 'Нажмите "Начать упражнение", чтобы начать',
    midi_connected: 'MIDI-устройство подключено!',
    no_midi_found: 'MIDI-устройство не найдено. Используется виртуальное пианино.',
    midi_failed: 'Ошибка доступа к MIDI. Используется виртуальное пианино.',
    device_virtual: 'Виртуальное Пианино',
    device_midi: 'Внешнее MIDI-устройство',
    start_exercise: 'Начать Упражнение',
    accuracy: 'Точность',
    time: 'Время',
    notes: 'Ноты'
  }
};

export default function Exercise({ onBack, currentLang = 'en' }) {
  const t = (key) => translations[currentLang]?.[key] || translations['en'][key];

  const [gameState, setGameState] = useState({
    exercise: [],
    index: 0,
    wrongIndex: -1,
    clef: "treble",
    attempted: 0,
    correct: 0
  });
  const [pressedKeys, setPressedKeys] = useState(new Set());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [status, setStatus] = useState('status_message');
  const [deviceName, setDeviceName] = useState('');
  const [results, setResults] = useState(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const accuracyOverTimeRef = useRef([]);
  const [pulseKey, setPulseKey] = useState(null);
  const wrongCountRef = useRef(0);
  const [mode, setMode] = useState('classic');
  
  // RESTORED: Difficulty selection tracking state
  const [difficulty, setDifficulty] = useState('easy');
  
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const stopAllRef = useRef(null);
  const timedTotalAttempted = useRef(0);
  const timedTotalCorrect = useRef(0);
  const scoreRef = useRef(0);

  useEffect(() => {
    let midiAccess = null;
    const onMIDIMessage = (event) => {
      const [status, note, velocity] = event.data;
      const type = status & 0xf0;
      if (type === 0x90 && velocity > 0) {
        handleNoteOnRef.current?.(note);
      } else if (type === 0x80 || (type === 0x90 && velocity === 0)) {
        handleNoteOffRef.current?.(note);
      }
    };

    const attachListeners = (access) => {
      access.inputs.forEach(input => { input.onmidimessage = onMIDIMessage; });
      access.onstatechange = (e) => {
        if (e.port.type === 'input' && e.port.state === 'connected') {
          e.port.onmidimessage = onMIDIMessage;
          setStatus('midi_connected');
          setDeviceName('device_midi');
        }
      };
    };

    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess().then((access) => {
        midiAccess = access;
        if (access.inputs.size > 0) {
          setStatus('midi_connected');
          setDeviceName('device_midi');
        } else {
          setStatus('no_midi_found');
          setDeviceName('device_virtual');
        }
        attachListeners(access);
      }).catch(() => {
        setStatus('midi_failed');
        setDeviceName('device_virtual');
      });
    } else {
      setStatus('no_midi_found');
      setDeviceName('device_virtual');
    }

    return () => {
      if (midiAccess) {
        midiAccess.inputs.forEach(input => { input.onmidimessage = null; });
      }
    };
  }, []);

  const startExercise = () => {
    // RULE CHANGE: If difficulty is easy, force treble. Otherwise, pick randomly between treble and bass.
    const clef = difficulty === 'easy' ? 'treble' : (Math.random() < 0.5 ? 'treble' : 'bass');
    const notes = generateExercise(difficulty, clef);

    if (timerRef.current) clearInterval(timerRef.current);
    startTimeRef.current = Date.now();
    setElapsedTime(0);
    setStatus('');
    accuracyOverTimeRef.current = [];
    scoreRef.current = 0; 
    
    if (mode === 'timed') {
      setTimeLeft(60);
      setScore(0);
      timedTotalAttempted.current = 0;
      timedTotalCorrect.current = 0;
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            setPressedKeys(new Set());
            stopAllRef.current?.();
            setGameState(prev => ({ ...prev, exercise: [] }));

            setTimeout(() => {
              setResults({
                accuracy: timedTotalAttempted.current > 0
                ? (timedTotalCorrect.current / timedTotalAttempted.current) * 100
                : 0,
                timeTaken: 60,
                totalNotes: score,
                correctNotes: score,
                wrongAttempts: 0,
                notesPerMinute: scoreRef.current,
                clef,
                accuracyOverTime: accuracyOverTimeRef.current,
              });
            }, 0);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      timerRef.current = setInterval(() => {
        setElapsedTime(((Date.now() - startTimeRef.current) / 1000).toFixed(1));
      }, 100);
    }

    setGameState({
      exercise: notes,
      index: 0,
      wrongIndex: -1,
      clef,
      attempted: 0,
      correct: 0
    });
  };

  const handleNoteOn = useCallback((midi) => {
    setPressedKeys(new Set([midi]));
    setGameState(prev => {
      if (prev.exercise.length === 0) return prev;
      const isCorrect = midi === prev.exercise[prev.index];
      const newAttempted = prev.attempted + 1;
      const newCorrect = isCorrect ? prev.correct + 1 : prev.correct;
      const newIndex = isCorrect ? prev.index + 1 : prev.index;

      if (isCorrect) {
        wrongCountRef.current = 0;
      } else {
        wrongCountRef.current += 1;
        if (wrongCountRef.current >= 3) {
          const correctNote = prev.exercise[prev.index];
          setTimeout(() => {
            setPulseKey(correctNote);
            setTimeout(() => setPulseKey(null), 1200);
          }, 0);
          wrongCountRef.current = 0;
        }
      }

      setTimeout(() => {
        if (mode === 'timed') {
          timedTotalAttempted.current += 1;
          if (isCorrect) timedTotalCorrect.current += 1;
          const cumulativeAcc = Math.round((timedTotalCorrect.current / timedTotalAttempted.current) * 100);
          accuracyOverTimeRef.current.push(cumulativeAcc);
        } else {
          accuracyOverTimeRef.current.push(Math.round((newCorrect / newAttempted) * 100));
        }
      }, 0);

      return {
        ...prev,
        attempted: newAttempted,
        correct: newCorrect,
        index: newIndex,
        wrongIndex: isCorrect ? -1 : prev.index
      };
    });
  }, [mode]);

  const handleNoteOff = useCallback((midi, isMidi = false) => {
    setPressedKeys(new Set());
    setGameState(prev => {
      if (prev.index >= prev.exercise.length && prev.exercise.length > 0) {
        if (mode === 'timed') {
          setScore(s => {
            const next = s + prev.exercise.length;
            scoreRef.current = next;
            return next;
          });
          
          // RULE CHANGE: Re-apply rule for next automatic generation blocks in timed mode too
          const newClef = difficulty === 'easy' ? 'treble' : (Math.random() < 0.5 ? 'treble' : 'bass');
          const newNotes = generateExercise(difficulty, newClef);
          
          setTimeout(() => {
            setGameState({
              exercise: newNotes,
              index: 0,
              wrongIndex: -1,
              clef: newClef,
              attempted: 0,
              correct: 0,
            });
          }, 0);
        } else {
          setTimeout(() => {
            const timeTaken = parseFloat(((Date.now() - startTimeRef.current) / 1000).toFixed(1));
            const acc = (prev.correct / prev.attempted) * 100;
            const npm = (prev.exercise.length / timeTaken) * 60;
            setResults({
              accuracy: acc,
              timeTaken,
              totalNotes: prev.exercise.length,
              correctNotes: prev.correct,
              wrongAttempts: prev.attempted - prev.correct,
              notesPerMinute: npm,
              clef: prev.clef,
              accuracyOverTime: [...accuracyOverTimeRef.current],
            });
          }, 0);
        }
      }
      return prev;
    });
  }, [mode, difficulty]);

  const handleNoteChange = useCallback((prevMidi, newMidi) => {
    setPressedKeys(prev => {
      const next = new Set(prev);
      if (prevMidi !== null) next.delete(prevMidi);
      if (newMidi !== null) next.add(newMidi);
      return next;
    });
  }, []);

  const handleNoteOnRef = useRef(null);
  const handleNoteOffRef = useRef(null);
  useEffect(() => { handleNoteOnRef.current = handleNoteOn; }, [handleNoteOn]);
  useEffect(() => { handleNoteOffRef.current = handleNoteOff; }, [handleNoteOff]);

  const accuracy = mode === 'timed'
    ? timedTotalAttempted.current > 0 ? Math.round((timedTotalCorrect.current / timedTotalAttempted.current) * 100) : 0
    : gameState.attempted > 0 ? Math.round((gameState.correct / gameState.attempted) * 100) : 0;

  if (results) return (
    <ExerciseResults
      results={results}
      onNext={() => { setResults(null); startExercise(); }}
      onBack={onBack}
      currentLang={currentLang}
    />
  );

  return (
    <div className="app-container">
      <div className="main-content">
        <h1>Muziko</h1>
        <ExerciseConfig
          mode={mode} setMode={setMode}
          difficulty={difficulty} setDifficulty={setDifficulty}
          currentLang={currentLang}
        />
        
        <div className="controls">
          <button id="start" onClick={startExercise}>
            {t('start_exercise')}
          </button>
        </div>
        
        <div id="status" style={{ marginTop: '12px' }}>
          {status ? t(status) : ''}
        </div>
        
        {deviceName && (
          <div id="device-name">
            {t(deviceName)}
          </div>
        )}

        <div className="staff-container">
          <MusicStaff
            exercise={gameState.exercise}
            currentIndex={gameState.index}
            wrongIndex={gameState.wrongIndex}
            clef={gameState.clef}
          />
        </div>

        <div id="stats">
          {mode === 'timed'
            ? gameState.exercise.length > 0
              ? `⏱ ${timeLeft}s | ${t('notes')}: ${score}`
              : `${t('accuracy')}: 0% | ${t('time')}: 0.0s`
            : `${t('accuracy')}: ${accuracy}% | ${t('time')}: ${elapsedTime}s`
          }
        </div>
      </div>

      <Piano
        pressedKeys={pressedKeys}
        pulseKey={pulseKey}
        onNoteOn={handleNoteOn}
        onNoteOff={handleNoteOff}
        onNoteChange={handleNoteChange}
        stopAllRef={stopAllRef}
      />
    </div>
  );
}