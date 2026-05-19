import React, { useRef, useEffect } from 'react';

import '../css/piano.css';

const PIANO_NOTE_NAMES = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
const WHITE_NOTES = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export default function Piano({ pressedKeys, pulseKey, onNoteOn, onNoteOff, onNoteChange, stopAllRef }) {
  const wrapperRef = useRef(null);
  const audioCtxRef = useRef(null);
  
  // FIXED: Using a Ref to store oscillators so re-renders never lose track of playing keys
  const activeNodes = useRef({});
  const isMouseDown = useRef(false);
  const currentNote = useRef(null);

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
          gainNode.gain.setValueAtTime(0, ctx.currentTime); // instant silence
          osc.stop(ctx.currentTime);
          osc2.stop(ctx.currentTime);
        } catch(e) {}
      });
      activeNodes.current = {};
    };
  }
    // FIXED: Global window mouse handling securely catches all releases to stop stuck notes
    const handleGlobalMouseUp = () => {
      if (!isMouseDown.current) return;
      isMouseDown.current = false;
      
      if (currentNote.current !== null) {
        stopNote(currentNote.current);
        onNoteOff(currentNote.current);
        currentNote.current = null;
      }
      
      // Safety flush: Stop absolutely everything currently playing
      Object.keys(activeNodes.current).forEach((midi) => {
        stopNote(Number(midi));
        onNoteOff(Number(midi));
      });
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [onNoteOff]);



  const getAudioCtx = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtxRef.current;
  };

  const playNote = (midi) => {
    // If this note is already singing, don't stack a duplicate synthesizer layer
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
      onNoteChange(prev, midi); // ← atomic swap, no race condition
      onNoteOn(midi);           // ← for game logic only
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
      
      // FIXED: Safely checking if the note is tracked inside our active collection
      const isPressed = pressedKeys instanceof Set ? pressedKeys.has(midi) : pressedKeys === midi;

      if (isWhite) {whiteKeyCount++;
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