import React, { useRef, useEffect, useState } from 'react';
import '../css/piano.css';

const PIANO_NOTE_NAMES = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
const WHITE_NOTES = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

// White keys map to C D E F G A B C D E F (11 keys = one octave + 4 extra)
const WHITE_KEY_OFFSETS = {
  'a': 0,   // C
  's': 2,   // D
  'd': 4,   // E
  'f': 5,   // F
  'g': 7,   // G
  'h': 9,   // A
  'j': 11,  // B
  'k': 12,  // C+1
  'l': 14,  // D+1
  ';': 16,  // E+1
  "'": 17,  // F+1
};

// Black keys map: Q W _ R T Y _ U I O P
// (gaps where E-F and B-C have no black key)
const BLACK_KEY_OFFSETS = {
  'q': 1,   // C#
  'w': 3,   // D#
  // e → no black key (E-F gap)
  'r': 6,   // F#
  't': 8,   // G#
  'y': 10,  // A#
  // u → no black key (B-C gap)
  'u': 13,  // C#+1
  'i': 15,  // D#+1
  // o → no black key
  'o': 18,  // F#+1
  'p': 20,  // G#+1
};

function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// Which MIDI notes are covered by keyboard at a given octave
function getKeyboardRange(octave) {
  const base = (octave + 1) * 12;
  return { min: base, max: base + 20 };
}

export default function Piano({ pressedKeys, pulseKey, onNoteOn, onNoteOff, onNoteChange, stopAllRef }) {
  const wrapperRef = useRef(null);
  const audioCtxRef = useRef(null);
  const activeNodes = useRef({});
  const isMouseDown = useRef(false);
  const currentNote = useRef(null);
  const [currentOctave, setCurrentOctave] = useState(4);
  const pressedComputerKeys = useRef(new Map());

  // Center scroll on mount
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (wrapper) {
      wrapper.scrollLeft = (wrapper.scrollWidth - wrapper.clientWidth) / 2;
    }
  }, []);

  // stopAllRef
  useEffect(() => {
    if (stopAllRef) {
      stopAllRef.current = () => {
        const ctx = audioCtxRef.current;
        if (!ctx) return;
        ctx.suspend();
        activeNodes.current = {};
      };
    }
  }, [stopAllRef]);

  // Global mouseup
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (!isMouseDown.current) return;
      isMouseDown.current = false;
      if (currentNote.current !== null) {
        stopNote(currentNote.current);
        onNoteOff(currentNote.current);
        currentNote.current = null;
      }
      Object.keys(activeNodes.current).forEach((midi) => {
        stopNote(Number(midi));
        onNoteOff(Number(midi));
      });
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [onNoteOff]);

  // Keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const key = e.key.toLowerCase();

      if (['2','3','4','5','6'].includes(key)) {
        setCurrentOctave(parseInt(key, 10));
        return;
      }

      if (pressedComputerKeys.current.has(key)) return;

      let offset = WHITE_KEY_OFFSETS[key] ?? BLACK_KEY_OFFSETS[key];
      if (offset === undefined) return;

      const base = (currentOctave + 1) * 12;
      const midi = base + offset;
      if (midi >= 36 && midi <= 95) {
        pressedComputerKeys.current.set(key, midi);
        playNote(midi);
        onNoteOn(midi);
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (!pressedComputerKeys.current.has(key)) return;
      const midi = pressedComputerKeys.current.get(key);
      pressedComputerKeys.current.delete(key);
      stopNote(midi);
      onNoteOff(midi);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [currentOctave, onNoteOn, onNoteOff]);

  const getAudioCtx = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Resume if suspended
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const playNote = (midi) => {
    if (activeNodes.current[midi]) return;
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
    osc.connect(gainNode); gainNode.connect(ctx.destination);
    osc2.connect(gainNode2); gainNode2.connect(ctx.destination);
    osc.start(ctx.currentTime); osc2.start(ctx.currentTime);
    activeNodes.current[midi] = { osc, osc2, gainNode };
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
    } catch(e) {}
    delete activeNodes.current[midi];
  };

  const handleMouseDown = (midi) => { isMouseDown.current = true; currentNote.current = midi; playNote(midi); onNoteOn(midi); };
  const handleMouseEnter = (midi) => {
    if (!isMouseDown.current) return;
    const prev = currentNote.current;
    if (prev !== null && prev !== midi) { stopNote(prev); onNoteChange(prev, midi); onNoteOn(midi); }
    currentNote.current = midi;
    playNote(midi);
  };
  const handleMouseUp = (midi) => { isMouseDown.current = false; stopNote(midi); onNoteOff(midi); currentNote.current = null; };
  const handleMouseLeave = (midi) => { if (!isMouseDown.current && activeNodes.current[midi]) { stopNote(midi); onNoteOff(midi); } };

  const { min: kbMin, max: kbMax } = getKeyboardRange(currentOctave);

  const renderKeys = () => {
    const keys = [];
    let whiteKeyCount = 0;
    const whiteKeyWidth = 40;

    for (let midi = 36; midi <= 95; midi++) {
      const noteIndex = (midi - 21) % 12;
      const noteName = PIANO_NOTE_NAMES[noteIndex];
      const isWhite = WHITE_NOTES.includes(noteName);
      const isPressed = pressedKeys instanceof Set ? pressedKeys.has(midi) : pressedKeys === midi;
      const isInKbRange = midi >= kbMin && midi <= kbMax;

      if (isWhite) {
        whiteKeyCount++;
        keys.push(
          <div
            key={midi}
            className={`piano-key ${isPressed ? 'pressed' : ''} ${pulseKey === midi ? 'hint-pulse' : ''} ${isInKbRange ? 'kb-range' : ''}`}
            onMouseDown={() => handleMouseDown(midi)}
            onMouseEnter={() => handleMouseEnter(midi)}
            onMouseUp={() => handleMouseUp(midi)}
            onMouseLeave={() => handleMouseLeave(midi)}
          >
            {noteName === 'C' && (
              <span className="note-label">{`C${Math.floor(midi / 12) - 1}`}</span>
            )}
          </div>
        );
      } else {
        const offset = (whiteKeyCount - 1) * whiteKeyWidth + whiteKeyWidth - 14;
        keys.push(
          <div
            key={midi}
            className={`piano-key black ${isPressed ? 'pressed' : ''} ${pulseKey === midi ? 'hint-pulse' : ''} ${isInKbRange ? 'kb-range' : ''}`}
            style={{ left: `${offset}px`, position: 'absolute' }}
            onMouseDown={() => handleMouseDown(midi)}
            onMouseEnter={() => handleMouseEnter(midi)}
            onMouseUp={() => handleMouseUp(midi)}
            onMouseLeave={() => handleMouseLeave(midi)}
          />
        );
      }
    }
    return keys;
  };

  return (
    <div id="virtual-piano-wrapper" ref={wrapperRef}>
      {/* Octave selector bar */}
      <div className="octave-bar">
        <span className="octave-label">keyboard octave</span>
        <div className="octave-btns">
          {[2,3,4,5,6].map(o => (
            <button
              key={o}
              className={`octave-btn ${currentOctave === o ? 'active' : ''}`}
              onClick={() => setCurrentOctave(o)}
            >
              {o}
            </button>
          ))}
        </div>
      </div>
      <div className="piano-scroll-container">
        <div className="piano-spacer-start"></div>
        <div id="virtual-piano" style={{ position: 'relative', display: 'flex' }}>
          {renderKeys()}
        </div>
        <div className="piano-spacer-end"></div>
      </div>
    </div>
  );
}