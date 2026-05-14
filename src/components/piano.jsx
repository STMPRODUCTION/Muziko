import React from 'react';
import '../css/piano.css'; 

const PIANO_NOTE_NAMES = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
const WHITE_NOTES = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

export default function Piano({ pressedKeys, onNoteOn, onNoteOff }) {
  const renderKeys = () => {
    const keys = [];
    let whiteKeyCount = 0;
    const whiteKeyWidth = 40;

    for (let midi = 36; midi <= 95; midi++) {
      const noteIndex = (midi - 21) % 12;
      const noteName = PIANO_NOTE_NAMES[noteIndex];
      const isWhite = WHITE_NOTES.includes(noteName);
      const isPressed = pressedKeys.has(midi);

      if (isWhite) {
        whiteKeyCount++;
        keys.push(
          <div 
            key={midi} 
            className={`piano-key ${isPressed ? 'pressed' : ''}`}
            onMouseDown={() => onNoteOn(midi)}
            onMouseUp={() => onNoteOff(midi)}
            onMouseLeave={() => onNoteOff(midi)}
          >
            {noteName === 'C' && (
              <span className="note-label">{`C${Math.floor(midi / 12) - 1}`}</span>
            )}
          </div>
        );
      } else {
        // Apply the positioning formula: (w-1) * 40 + 40 - 14
        const offset = (whiteKeyCount - 1) * whiteKeyWidth + whiteKeyWidth - 14;
        keys.push(
          <div 
            key={midi} 
            className={`piano-key black ${isPressed ? 'pressed' : ''}`}
            style={{ left: `${offset}px`, position: 'absolute' }}
            onMouseDown={() => onNoteOn(midi)}
            onMouseUp={() => onNoteOff(midi)}
            onMouseLeave={() => onNoteOff(midi)}
          />
        );
      }
    }
    return keys;
  };

  return (
    <div id="virtual-piano-wrapper">
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