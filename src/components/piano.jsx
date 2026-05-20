import React, { useRef, useEffect, useState } from 'react';
import '../css/piano.css';

const PIANO_NOTE_NAMES = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
const WHITE_NOTES = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

// Relative semitone offsets from the base C note of the selected octave
const WHITE_KEY_OFFSETS = {
  'a': 0,   // C
  's': 2,   // D
  'd': 4,   // E
  'f': 5,   // F
  'g': 7,   // G
  'h': 9,   // A
  'j': 11,  // B
  'k': 12,  // C (Next Octave)
  'l': 14,  // D
  ';': 16,  // E
  "'": 17   // F
};

const BLACK_KEY_OFFSETS = {
  'q': 1,   // C#
  'w': 3,   // D#
  'e': 6,   // F#
  'r': 8,   // G#
  't': 10,  // A#
  'y': 13,  // C# (Next Octave)
  'u': 15,  // D#
  'i': 18,  // F#
  'o': 20,  // G#
  'p': 22   // A#
};

function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export default function Piano({ pressedKeys, pulseKey, onNoteOn, onNoteOff, onNoteChange, stopAllRef }) {
  const wrapperRef = useRef(null);
  const audioCtxRef = useRef(null);
  
  const activeNodes = useRef({});
  const isMouseDown = useRef(false);
  const currentNote = useRef(null);

  // Octave shifting state (Defaults to Octave 4 / Middle C)
  const [currentOctave, setCurrentOctave] = useState(4);
  
  // Maps active computer keys to their triggered MIDI notes to prevent stuck notes when shifting octaves mid-press
  const pressedComputerKeys = useRef(new Map());

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (wrapper) {
      wrapper.scrollLeft = (wrapper.scrollWidth - wrapper.clientWidth) / 2;
    }

    if (stopAllRef) {
      stopAllRef.current = () => {
        const ctx = audioCtxRef.current;
        if (!ctx) return;
        Object.keys(activeNodes.current).forEach(midi => {
          try {
            const { osc, osc2, gainNode } = activeNodes.current[midi];
            gainNode.gain.cancelScheduledValues(ctx.currentTime);
            gainNode.gain.setValueAtTime(0, ctx.currentTime);
            osc.stop(ctx.currentTime);
            osc2.stop(ctx.currentTime);
          } catch(e) {}
        });
        activeNodes.current = {};
      };
    }

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
  }, [onNoteOff, stopAllRef]);

  // Computer Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const key = e.key.toLowerCase();

      // Octave switching keys (2 to 6)
      if (['2', '3', '4', '5', '6'].includes(key)) {
        setCurrentOctave(parseInt(key, 10));
        return;
      }

      if (pressedComputerKeys.current.has(key)) return;

      let offset = undefined;
      if (WHITE_KEY_OFFSETS[key] !== undefined) {
        offset = WHITE_KEY_OFFSETS[key];
      } else if (BLACK_KEY_OFFSETS[key] !== undefined) {
        offset = BLACK_KEY_OFFSETS[key];
      }

      if (offset !== undefined) {
        // Calculate absolute MIDI value based on the current selected octave
        const baseMidi = currentOctave * 12 + 12; // Octave 2 -> 36, Octave 4 -> 60, etc.
        const midi = baseMidi + offset;

        // Restrict to the piano's rendering bounds (C2 to B6)
        if (midi >= 36 && midi <= 95) {
          pressedComputerKeys.current.set(key, midi);
          playNote(midi);
          onNoteOn(midi);
        }
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (pressedComputerKeys.current.has(key)) {
        const midi = pressedComputerKeys.current.get(key);
        pressedComputerKeys.current.delete(key);
        stopNote(midi);
        onNoteOff(midi);
      }
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

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc2.connect(gainNode2);
    gainNode2.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc2.start(ctx.currentTime);

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
    } catch (e) {
      console.warn("Audio node cleanup bypass:", e);
    }
    delete activeNodes.current[midi];
  };

  const handleMouseDown = (midi) => {
    isMouseDown.current = true;
    currentNote.current = midi;
    playNote(midi);
    onNoteOn(midi);
  };

  const handleMouseEnter = (midi) => {
    if (!isMouseDown.current) return;
    const prev = currentNote.current;
    if (prev !== null && prev !== midi) {
      stopNote(prev);
      onNoteChange(prev, midi);
      onNoteOn(midi);
    }
    currentNote.current = midi;
    playNote(midi);
  };

  const handleMouseUp = (midi) => {
    isMouseDown.current = false;
    stopNote(midi);
    onNoteOff(midi);
    currentNote.current = null;
  };

  const handleMouseLeave = (midi) => {
    if (!isMouseDown.current && activeNodes.current[midi]) {
      stopNote(midi);
      onNoteOff(midi);
    }
  };

  const renderKeys = () => {
    const keys = [];
    let whiteKeyCount = 0;
    const whiteKeyWidth = 40;

    for (let midi = 36; midi <= 95; midi++) {
      const noteIndex = (midi - 21) % 12;
      const noteName = PIANO_NOTE_NAMES[noteIndex];
      const isWhite = WHITE_NOTES.includes(noteName);
      
      const isPressed = pressedKeys instanceof Set ? pressedKeys.has(midi) : pressedKeys === midi;

      if (isWhite) {
        whiteKeyCount++;
        keys.push(
          <div
            key={midi}
            className={`piano-key ${isPressed ? 'pressed' : ''} ${pulseKey === midi ? 'hint-pulse' : ''}`}
            onMouseDown={() => handleMouseDown(midi)}
            onMouseEnter={() => handleMouseEnter(midi)}
            onMouseUp={() => handleMouseUp(midi)}
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
            className={`piano-key black ${isPressed ? 'pressed' : ''} ${pulseKey === midi ? 'hint-pulse' : ''}`}
            style={{ left: `${offset}px`, position: 'absolute' }}
            onMouseDown={() => handleMouseDown(midi)}
            onMouseEnter={() => handleMouseEnter(midi)}
            onMouseUp={() => handleMouseUp(midi)}
          />
        );
      }
    }
    return keys;
  };

  return (
    <div id="virtual-piano-wrapper" ref={wrapperRef}>
      {/* Visual floating badge indicating what octave range your keyboard is currently controlling */}
      <div style={{
        textAlign: 'center',
        padding: '6px',
        fontSize: '13px',
        fontWeight: 'bold',
        color: '#475569',
        backgroundColor: '#f1f5f9',
        borderBottom: '1px solid #e2e8f0'
      }}>
        Current Controls: Octave {currentOctave} (Press 2-6 to shift octaves)
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