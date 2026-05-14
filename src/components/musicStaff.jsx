import React, { useEffect, useRef } from 'react';
import { Renderer, Stave, StaveNote, Voice, Formatter, Accidental } from 'vexflow';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export default function MusicStaff({ exercise, currentIndex, wrongIndex, clef }) {
  const staffRef = useRef(null);

  useEffect(() => {
    if (!staffRef.current) return;
    const div = staffRef.current;
    while (div.firstChild) div.removeChild(div.firstChild);

    const renderer = new Renderer(div, Renderer.Backends.SVG);
    renderer.resize(700, 150);
    const context = renderer.getContext();
    const stave = new Stave(50, 20, 600);
    stave.addClef(clef).setContext(context).draw();

    if (exercise.length > 0) {
      const notes = exercise.map((midi, i) => {
        const name = NOTE_NAMES[midi % 12].toLowerCase();
        const octave = Math.floor(midi / 12) - 1;
        const vfNote = new StaveNote({ keys: [`${name}/${octave}`], duration: "q", clef });

        if (name.includes('#')) vfNote.addModifier(new Accidental("#"), 0);
        if (i < currentIndex) vfNote.setStyle({ fillStyle: "#00CC58", strokeStyle: "#00CC58" });
        if (i === wrongIndex) vfNote.setStyle({ fillStyle: "red", strokeStyle: "red" });
        
        return vfNote;
      });

      const voice = new Voice({ num_beats: notes.length, beat_value: 4 }).setStrict(false);
      voice.addTickables(notes);
      new Formatter().joinVoices([voice]).format([voice], 500);
      voice.draw(context, stave);
    }
  }, [exercise, currentIndex, wrongIndex, clef]);

  return (
    <div id="staff-container" style={{ background: '#f0f0f0', padding: '10px', borderRadius: '8px' }}>
      <div ref={staffRef} id="staff"></div>
    </div>
  );
}