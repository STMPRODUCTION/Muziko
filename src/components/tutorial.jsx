import React, { useEffect, useRef, useState } from 'react';
import { Renderer, Stave, StaveNote, Accidental, Voice, Formatter } from 'vexflow';

const NOTES = [
  { midi: 60, label: 'C4', key: 'c/4', annotation: 'Middle C' },
  { midi: 62, label: 'D4', key: 'd/4', annotation: 'D' },
  { midi: 64, label: 'E4', key: 'e/4', annotation: 'E' },
  { midi: 65, label: 'F4', key: 'f/4', annotation: 'F' },
  { midi: 67, label: 'G4', key: 'g/4', annotation: 'G' },
  { midi: 69, label: 'A4', key: 'a/4', annotation: 'A · 440Hz' },
  { midi: 71, label: 'B4', key: 'b/4', annotation: 'B' },
  { midi: 72, label: 'C5', key: 'c/5', annotation: 'C (octave up)' },
  { midi: 74, label: 'D5', key: 'd/5', annotation: 'D' },
  { midi: 76, label: 'E5', key: 'e/5', annotation: 'E' },
  { midi: 77, label: 'F5', key: 'f/5', annotation: 'F' },
];

// White key midi numbers in range C4-F5
const WHITE_MIDIS = [60,62,64,65,67,69,71,72,74,76,77];
// Black key midi numbers and their offset index (after which white key)
const BLACK_KEYS = [
  { midi: 61, afterWhiteIndex: 0 }, // C#4 after C4
  { midi: 63, afterWhiteIndex: 1 }, // D#4 after D4
  { midi: 66, afterWhiteIndex: 3 }, // F#4 after F4
  { midi: 68, afterWhiteIndex: 4 }, // G#4 after G4
  { midi: 70, afterWhiteIndex: 5 }, // A#4 after A4
  { midi: 73, afterWhiteIndex: 7 }, // C#5 after C5
  { midi: 75, afterWhiteIndex: 8 }, // D#5 after D5
];

const WHITE_KEY_W = 30;
const BLACK_KEY_W = 18;
const WHITE_KEY_H = 70;
const BLACK_KEY_H = 42;

function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export default function NotesTutorial() {
  const staffRef = useRef(null);
  const audioCtxRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [pressedMidi, setPressedMidi] = useState(null);

  const getAudio = () => {
    if (!audioCtxRef.current)
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtxRef.current;
  };

  const playMidi = (midi, duration = 0.6) => {
    const ctx = getAudio();
    const freq = midiToFreq(midi);
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc2.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc2.frequency.setValueAtTime(freq * 2, ctx.currentTime);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain); osc2.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime); osc2.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration); osc2.stop(ctx.currentTime + duration);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentIndex(i => {
          const next = (i + 1) % NOTES.length;
          playMidi(NOTES[next].midi);
          setPressedMidi(NOTES[next].midi);
          setTimeout(() => setPressedMidi(null), 600);
          return next;
        });
        setFade(true);
      }, 400);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!staffRef.current) return;
    const div = staffRef.current;
    while (div.firstChild) div.removeChild(div.firstChild);

    const renderer = new Renderer(div, Renderer.Backends.SVG);
    renderer.resize(280, 130);
    const ctx = renderer.getContext();

    const svg = div.querySelector('svg');
    if (svg) svg.style.background = 'transparent';

    const stave = new Stave(20, 15, 230);
    stave.addClef('treble');
    stave.setContext(ctx).draw();

    const note = NOTES[currentIndex];
    const vfNote = new StaveNote({ keys: [note.key], duration: 'q', clef: 'treble' });
    vfNote.setStyle({ fillStyle: '#00CC58', strokeStyle: '#00CC58' });

    const voice = new Voice({ num_beats: 1, beat_value: 4 }).setStrict(false);
    voice.addTickables([vfNote]);
    new Formatter().joinVoices([voice]).format([voice], 180);
    voice.draw(ctx, stave);
  }, [currentIndex]);

  const totalWhiteWidth = WHITE_MIDIS.length * WHITE_KEY_W;

  return (
    <div style={{
      width: '100%',
      maxWidth: '700px',
      margin: '48px auto 0',
      fontFamily: 'Courier New, monospace',
      color: 'var(--accent1, #00CC58)',
      padding: '1px'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.85)',
        borderRadius: '14px',
        padding: '28px 24px 20px',
        marginBottom: '24px',
      }}>

        {/* Note label + annotation */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '4px',
          opacity: fade ? 1 : 0,
          transition: 'opacity 0.4s ease',
          minHeight: '52px',
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', letterSpacing: '3px' }}>
            {NOTES[currentIndex].label}
          </div>
          <div style={{ fontSize: '0.75rem', opacity: 0.6, letterSpacing: '1px' }}>
            {NOTES[currentIndex].annotation}
          </div>
        </div>

        {/* Staff */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          opacity: fade ? 1 : 0,
          transition: 'opacity 0.4s ease',
        }}>
          <div ref={staffRef} />
        </div>

        {/* Mini Piano */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '20px',
        }}>
          <div style={{
            position: 'relative',
            width: `${totalWhiteWidth}px`,
            height: `${WHITE_KEY_H}px`,
          }}>
            {/* White keys */}
            {WHITE_MIDIS.map((midi, i) => {
              const isPressed = pressedMidi === midi;
              const isCurrentNote = NOTES[currentIndex].midi === midi;
              return (
                <div
                  key={midi}
                  onMouseDown={() => { playMidi(midi, 0.5); setPressedMidi(midi); }}
                  onMouseUp={() => setPressedMidi(null)}
                  onMouseLeave={() => setPressedMidi(null)}
                  style={{
                    position: 'absolute',
                    left: `${i * WHITE_KEY_W}px`,
                    top: 0,
                    width: `${WHITE_KEY_W - 1}px`,
                    height: `${WHITE_KEY_H}px`,
                    background: isPressed
                      ? 'var(--accent1, #00CC58)'
                      : isCurrentNote
                        ? 'rgba(0,204,88,0.15)'
                        : '#ffffff',
                    border: '1px solid #ccc',
                    borderRadius: '0 0 4px 4px',
                    cursor: 'pointer',
                    zIndex: 1,
                    transition: 'background 0.15s',
                    boxSizing: 'border-box',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    paddingBottom: '4px',
                  }}
                >
                  {/* Key label */}
                  <span style={{
                    fontSize: '8px',
                    color: isPressed ? '#fff' : '#999',
                    fontFamily: 'Courier New, monospace',
                    pointerEvents: 'none',
                  }}>
                    {isCurrentNote ? NOTES[currentIndex].label : ''}
                  </span>
                </div>
              );
            })}

            {/* Black keys */}
            {BLACK_KEYS.map(({ midi, afterWhiteIndex }) => {
              const isPressed = pressedMidi === midi;
              const leftPos = (afterWhiteIndex + 1) * WHITE_KEY_W - BLACK_KEY_W / 2 - 1;
              return (
                <div
                  key={midi}
                  onMouseDown={e => { e.stopPropagation(); playMidi(midi, 0.5); setPressedMidi(midi); }}
                  onMouseUp={e => { e.stopPropagation(); setPressedMidi(null); }}
                  onMouseLeave={e => { e.stopPropagation(); setPressedMidi(null); }}
                  style={{
                    position: 'absolute',
                    left: `${leftPos}px`,
                    top: 0,
                    width: `${BLACK_KEY_W}px`,
                    height: `${BLACK_KEY_H}px`,
                    background: isPressed ? 'var(--accent1, #00CC58)' : '#222',
                    borderRadius: '0 0 3px 3px',
                    cursor: 'pointer',
                    zIndex: 2,
                    transition: 'background 0.15s',
                    boxShadow: '0 3px 6px rgba(0,0,0,0.4)',
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '18px' }}>
          {NOTES.map((_, i) => (
            <div
              key={i}
              onClick={() => { setCurrentIndex(i); setFade(true); playMidi(NOTES[i].midi); setPressedMidi(NOTES[i].midi); setTimeout(() => setPressedMidi(null), 600); }}
              style={{
                width: i === currentIndex ? '18px' : '6px',
                height: '6px',
                borderRadius: '3px',
                background: 'var(--accent1, #00CC58)',
                opacity: i === currentIndex ? 1 : 0.3,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
      </div>

      {/* Explanation */}
      <div style={{ fontSize: '0.9rem', lineHeight: '1.9', opacity: 0.75, padding: '100px 4px' }}>
        <p style={{ margin: '0 0 10px' }}>
          <strong>Sheet music</strong> uses a staff — five horizontal lines — where each line and space represents a specific pitch. The higher a note sits on the staff, the higher it sounds.
        </p>
        <p style={{ margin: '0 0 10px' }}>
          The <strong>treble clef</strong> (the curly symbol) anchors the staff: the second line from the bottom is always G4. From there, notes go up: A, B, C... and down: F, E, D. Notes can also sit on <em>ledger lines</em> — short extra lines above or below the staff — like middle C (C4) which sits just below.
        </p>
        <p style={{ margin: 0, padding: '0 0 140px 4px' }}>
          Each note name runs <strong>A through G</strong>, then repeats in the next octave. The number tells you which octave: C4 is middle C, C5 is one octave higher. The animation above cycles C4 → F5 — watch the note climb the staff as the pitch rises, and listen for the pitch matching the highlighted piano key.
        </p>
      </div>
    </div>
  );
}