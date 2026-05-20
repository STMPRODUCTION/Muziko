import React, { useRef, useEffect, useState } from 'react';
import '../css/piano.css';

const PIANO_NOTE_NAMES = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
const WHITE_NOTES = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

// Computer keyboard mappings to semitone offsets from the root C of the active octave
const WHITE_KEY_MAP = {
  'a': 0,  // C
  's': 2,  // D
  'd': 4,  // E
  'f': 5,  // F
  'g': 7,  // G
  'h': 9,  // A
  'j': 11, // B
  'k': 12, // C (+1 Oct)
  'l': 14, // D (+1 Oct)
  ';': 16, // E (+1 Oct)
  "'": 17  // F (+1 Oct)
};

const BLACK_KEY_MAP = {
  'q': 1,  // C#
  'w': 3,  // D#
  'e': 6,  // F#
  'r': 8,  // G#
  't': 10, // A#
  'y': 13, // C# (+1 Oct)
  'u': 15, // D# (+1 Oct)
  'i': 18, // F# (+1 Oct)
  'o': 20, // G# (+1 Oct)
  'p': 22  // A# (+1 Oct)
};

function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export default function KeyboardPiano() {
  const wrapperRef = useRef(null);
  const audioCtxRef = useRef(null);
  
  const activeNodes = useRef({});
  const pressedComputerKeys = useRef(new Set()); // Prevents OS key-repeat stacking
  
  const [currentOctave, setCurrentOctave] = useState(4); // Default to Middle C octave (C4)
  const [livePressedKeys, setLivePressedKeys] = useState(new Set());

  // Safe boundaries requested: C2 (36) to B6 (95)
  const MIN_MIDI = 36;
  const MAX_MIDI = 95;

  const getAudioCtx = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtxRef.current;
  };

  const playNote = (midi) => {
    if (midi < MIN_MIDI || midi > MAX_MIDI || activeNodes.current[midi]) return;

    const ctx = getAudioCtx();
    const freq = midiToFreq(midi);

    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, ctx.currentTime);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.3);

    const gainNode2 = ctx.createGain();
    gainNode2.gain.setValueAtTime(0.08, ctx.currentTime);
    gainNode2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc2.connect(gainNode2);
    gainNode2.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc2.start(ctx.currentTime);

    activeNodes.current[midi] = { osc, osc2, gainNode };
    
    setLivePressedKeys(prev => {
      const next = new Set(prev);
      next.add(midi);
      return next;
    });
  };

  const stopNote = (midi) => {
    const ctx = audioCtxRef.current;
    if (!ctx || !activeNodes.current[midi]) return;
    
    const { osc, osc2, gainNode } = activeNodes.current[midi];
    try {
      gainNode.gain.cancelScheduledValues(ctx.currentTime);
      gainNode.gain.setValueAtTime(gainNode.gain.value, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.stop(ctx.currentTime + 0.05);
      osc2.stop(ctx.currentTime + 0.05);
    } catch (e) {}
    
    delete activeNodes.current[midi];
    
    setLivePressedKeys(prev => {
      const next = new Set(prev);
      next.delete(midi);
      return next;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();

      // Octave switching triggers (Keys 2 - 6)
      if (['2', '3', '4', '5', '6'].includes(key)) {
        setCurrentOctave(Number(key));
        return;
      }

      if (pressedComputerKeys.current.has(key)) return;
      pressedComputerKeys.current.add(key);

      let offset = null;
      if (WHITE_KEY_MAP[key] !== undefined) offset = WHITE_KEY_MAP[key];
      if (BLACK_KEY_MAP[key] !== undefined) offset = BLACK_KEY_MAP[key];

      if (offset !== null) {
        const targetMidi = (currentOctave + 1) * 12 + offset;
        playNote(targetMidi);
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      pressedComputerKeys.current.delete(key);

      let offset = null;
      if (WHITE_KEY_MAP[key] !== undefined) offset = WHITE_KEY_MAP[key];
      if (BLACK_KEY_MAP[key] !== undefined) offset = BLACK_KEY_MAP[key];

      if (offset !== null) {
        const targetMidi = (currentOctave + 1) * 12 + offset;
        stopNote(targetMidi);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [currentOctave]);

  const renderKeys = () => {
    const keys = [];
    let whiteKeyCount = 0;
    
    const whiteKeyWidth = 44;
    const blackKeyWidth = 26;

    for (let midi = MIN_MIDI; midi <= MAX_MIDI; midi++) {
      const noteIndex = (midi - 21) % 12;
      const noteName = PIANO_NOTE_NAMES[noteIndex];
      const isWhite = WHITE_NOTES.includes(noteName);
      const isPressed = livePressedKeys.has(midi);

      if (isWhite) {
        whiteKeyCount++;
        keys.push(
          <div
            key={midi}
            className={`piano-key white ${isPressed ? 'pressed' : ''}`}
            onMouseDown={() => playNote(midi)}
            onMouseUp={() => stopNote(midi)}
            onMouseLeave={() => stopNote(midi)}
          >
            {noteName === 'C' && (
              <span className="note-label">{`C${Math.floor(midi / 12) - 1}`}</span>
            )}
          </div>
        );
      } else {
        const offset = (whiteKeyCount * whiteKeyWidth) - (blackKeyWidth / 2);
        keys.push(
          <div
            key={midi}
            className={`piano-key black ${isPressed ? 'pressed' : ''}`}
            style={{ left: `${offset}px` }}
            onMouseDown={() => playNote(midi)}
            onMouseUp={() => stopNote(midi)}
            onMouseLeave={() => stopNote(midi)}
          />
        );
      }
    }
    return keys;
  };

  return (
    <div id="virtual-piano-wrapper" ref={wrapperRef}>
      {/* Octave controller display dashboard */}
      <div className="octave-badge-container">
        <span className="octave-label-text">Active Octave:</span>
        {[2, 3, 4, 5, 6].map((oct) => (
          <button
            key={oct}
            onClick={() => setCurrentOctave(oct)}
            className={`octave-btn ${currentOctave === oct ? 'active' : ''}`}
          >
            {oct}
          </button>
        ))}
      </div>

      <div className="piano-scroll-container">
        <div id="virtual-piano">
          {renderKeys()}
        </div>
      </div>
    </div>
  );
}