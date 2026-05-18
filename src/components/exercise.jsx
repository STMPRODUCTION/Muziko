import React, { useState, useCallback, useRef, useEffect } from 'react';
import Piano from './piano';
import MusicStaff from './musicStaff';
import '../css/piano.css';
import ExerciseResults from './ExerciseResults';

const t = {
  status_message: 'Click "Start Exercise" to begin',
  midi_connected: 'MIDI device connected!',
  no_midi_found: 'No MIDI device found. Using virtual piano.',
  midi_failed: 'MIDI access failed. Using virtual piano.',
  device_virtual: 'Virtual Piano',
  device_midi: 'External MIDI Device',
};

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
  const [elapsedTime, setElapsedTime] = useState(0);
  const [accuracyHistory, setAccuracyHistory] = useState([]);
  const [timeHistory, setTimeHistory] = useState([]);
  const [status, setStatus] = useState(t.status_message);
  const [deviceName, setDeviceName] = useState('');
  const [results, setResults] = useState(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const accuracyCanvasRef = useRef(null);
  const timeCanvasRef = useRef(null);
  const handleNoteOnRef = useRef(null);
  const handleNoteOffRef = useRef(null);
  const accuracyOverTimeRef = useRef([]);

  // MIDI detection and input listening
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
      access.inputs.forEach(input => {
        input.onmidimessage = onMIDIMessage;
      });
      access.onstatechange = (e) => {
        if (e.port.type === 'input' && e.port.state === 'connected') {
          e.port.onmidimessage = onMIDIMessage;
          setStatus(t.midi_connected);
          setDeviceName(t.device_midi);
        }
      };
    };

    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess().then((access) => {
        midiAccess = access;
        if (access.inputs.size > 0) {
          setStatus(t.midi_connected);
          setDeviceName(t.device_midi);
        } else {
          setStatus(t.no_midi_found);
          setDeviceName(t.device_virtual);
        }
        attachListeners(access);
      }).catch(() => {
        setStatus(t.midi_failed);
        setDeviceName(t.device_virtual);
      });
    } else {
      setStatus(t.no_midi_found);
      setDeviceName(t.device_virtual);
    }

    return () => {
      if (midiAccess) {
        midiAccess.inputs.forEach(input => {
          input.onmidimessage = null;
        });
      }
    };
  }, []);

  const startExercise = () => {
    accuracyOverTimeRef.current = [];
    const isTreble = Math.random() < 0.5;
    const range = isTreble ? [57, 84] : [36, 64];
    const notes = Array.from({ length: 8 }, () =>
      Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0]
    );

    if (timerRef.current) clearInterval(timerRef.current);
    startTimeRef.current = Date.now();
    setElapsedTime(0);
    timerRef.current = setInterval(() => {
      setElapsedTime(((Date.now() - startTimeRef.current) / 1000).toFixed(1));
    }, 100);

    setStatus('');
    setGameState({
      exercise: notes,
      index: 0,
      wrongIndex: -1,
      clef: isTreble ? "treble" : "bass",
      attempted: 0,
      correct: 0
    });
  };

  const onMIDIMessage = (event) => {
  const [status, note, velocity] = event.data;
  const type = status & 0xf0;
  if (type === 0x90 && velocity > 0) {
    handleNoteOnRef.current?.(note, true);  // ← isMidi = true
  } else if (type === 0x80 || (type === 0x90 && velocity === 0)) {
    handleNoteOffRef.current?.(note, true); // ← isMidi = true
  }
};

  const handleNoteOn = useCallback((midi) => {
    setPressedKeys(new Set([midi]));

    setGameState(prev => {
      if (prev.exercise.length === 0) return prev;
      const isCorrect = midi === prev.exercise[prev.index];
      const newAttempted = prev.attempted + 1;
      const newCorrect = isCorrect ? prev.correct + 1 : prev.correct;
      accuracyOverTimeRef.current.push(Math.round((newCorrect / newAttempted) * 100));
      const newIndex = isCorrect ? prev.index + 1 : prev.index;
        return {
        ...prev,
        attempted: newAttempted,
        correct: newCorrect,
        index: newIndex,
        wrongIndex: isCorrect ? -1 : prev.index
      };
    });
  }, []);

   const handleNoteOff = useCallback((midi) => {
  setPressedKeys(new Set());

  setGameState(prev => {
    if (prev.index >= prev.exercise.length && prev.exercise.length > 0) {
      // exercise was just completed, show results
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
    return prev;
  });
}, []);

    const handleNoteChange = useCallback((prevMidi, newMidi) => {
      setPressedKeys(prev => {
        const next = new Set(prev);
        if (prevMidi !== null) next.delete(prevMidi);
        if (newMidi !== null) next.add(newMidi);
        return next;
      });
    }, []);

  // Keep refs updated so MIDI handler always calls latest version
  useEffect(() => { handleNoteOnRef.current = handleNoteOn; }, [handleNoteOn]);
  useEffect(() => { handleNoteOffRef.current = handleNoteOff; }, [handleNoteOff]);

  // Draw accuracy chart
  useEffect(() => {
    const canvas = accuracyCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = '#00CC58';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, W, H);

    if (accuracyHistory.length === 0) {
      ctx.fillStyle = '#00CC58';
      ctx.font = '12px Courier New';
      ctx.textAlign = 'center';
      ctx.fillText('No data available', W / 2, H / 2);
      return;
    }

    const pad = 20;
    ctx.beginPath();
    ctx.strokeStyle = '#00CC58';
    ctx.lineWidth = 2;
    accuracyHistory.forEach((v, i) => {
      const x = pad + (i / (accuracyHistory.length - 1 || 1)) * (W - pad * 2);
      const y = H - pad - (v / 100) * (H - pad * 2);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
  }, [accuracyHistory]);

  // Draw time chart
  useEffect(() => {
    const canvas = timeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = '#00CC58';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, W, H);

    if (timeHistory.length === 0) {
      ctx.fillStyle = '#00CC58';
      ctx.font = '12px Courier New';
      ctx.textAlign = 'center';
      ctx.fillText('No data available', W / 2, H / 2);
      return;
    }

    const pad = 20;
    const maxT = Math.max(...timeHistory);
    ctx.beginPath();
    ctx.strokeStyle = '#00CC58';
    ctx.lineWidth = 2;
    timeHistory.forEach((v, i) => {
      const x = pad + (i / (timeHistory.length - 1 || 1)) * (W - pad * 2);
      const y = H - pad - (v / maxT) * (H - pad * 2);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
  }, [timeHistory]);

  const accuracy = gameState.attempted > 0
    ? Math.round((gameState.correct / gameState.attempted) * 100)
    : 0;

  if (results) return (
    <ExerciseResults
      results={results}
      onNext={() => { setResults(null); startExercise(); }}
      onBack={onBack}
    />
  );
  return (
    <div className="app-container">
      <div className="main-content">
        <h1>Muziko</h1>

        <div className="controls">
          <button id="start" onClick={startExercise}>Start Exercise</button>
        </div>
        <div id="status" style={{ marginTop: '12px' }}>{status}</div>
        {deviceName && <div id="device-name">{deviceName}</div>}

        <div className="staff-container">
          <MusicStaff
            exercise={gameState.exercise}
            currentIndex={gameState.index}
            wrongIndex={gameState.wrongIndex}
            clef={gameState.clef}
          />
        </div>

        <div id="stats">
          Accuracy: {accuracy}% | Time: {elapsedTime}s
        </div>
      </div>

      <Piano
      pressedKeys={pressedKeys}
      onNoteOn={handleNoteOn}
      onNoteOff={handleNoteOff}
      onNoteChange={handleNoteChange}
    />
    </div>
  );
}