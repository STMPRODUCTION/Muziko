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

const WHITE_MIDIS = [60,62,64,65,67,69,71,72,74,76,77];
const BLACK_KEYS = [
  { midi: 61, afterWhiteIndex: 0 },
  { midi: 63, afterWhiteIndex: 1 },
  { midi: 66, afterWhiteIndex: 3 },
  { midi: 68, afterWhiteIndex: 4 },
  { midi: 70, afterWhiteIndex: 5 },
  { midi: 73, afterWhiteIndex: 7 },
  { midi: 75, afterWhiteIndex: 8 },
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
  const [noteColor, setNoteColor] = useState('black'); // 'black' | 'green' | 'red'
  const autoPlayingRef = useRef(false);

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

  // Auto-cycle
  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setNoteColor('black');
      setTimeout(() => {
        setCurrentIndex(i => {
          const next = (i + 1) % NOTES.length;
          autoPlayingRef.current = true;
          playMidi(NOTES[next].midi);
          setPressedMidi(NOTES[next].midi);
          setTimeout(() => {
            setPressedMidi(null);
            autoPlayingRef.current = false;
          }, 600);
          return next;
        });
        setFade(true);
      }, 400);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  // Draw staff
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

    const color = noteColor === 'green' ? '#00CC58' : noteColor === 'red' ? '#ff4444' : '#222222';
    vfNote.setStyle({ fillStyle: color, strokeStyle: color });

    const voice = new Voice({ num_beats: 1, beat_value: 4 }).setStrict(false);
    voice.addTickables([vfNote]);
    new Formatter().joinVoices([voice]).format([voice], 180);
    voice.draw(ctx, stave);
  }, [currentIndex, noteColor]);

  // Handle player pressing a key manually
  const handlePlayerPress = (midi) => {
    if (autoPlayingRef.current) return; // ignore if auto-playing
    playMidi(midi, 0.5);
    setPressedMidi(midi);
    const correctMidi = NOTES[currentIndex].midi;
    if (midi === correctMidi) {
      setNoteColor('green');
    } else {
      setNoteColor('red');
    }
    setTimeout(() => {
      setPressedMidi(null);
      setNoteColor('black');
    }, 700);
  };

  const totalWhiteWidth = WHITE_MIDIS.length * WHITE_KEY_W;

  return (
    <div style={{
      width: '100%',
      maxWidth: '700px',
      margin: '48px auto 0',
      fontFamily: 'Courier New, monospace',
      color: 'var(--accent1, #00CC58)',
      padding: '1px',
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
          <div style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            letterSpacing: '3px',
            color: noteColor === 'green' ? '#00CC58' : noteColor === 'red' ? '#ff4444' : 'var(--bg, #00CC58)',
            transition: 'color 0.2s ease',
          }}>
            {NOTES[currentIndex].label}
          </div>
          <div style={{ fontSize: '0.75rem', opacity: 0.6, letterSpacing: '1px', color: '#444' }}>
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

        {/* Hint text */}
        <div style={{
          textAlign: 'center',
          fontSize: '0.72rem',
          color: '#888',
          marginTop: '4px',
          marginBottom: '8px',
          letterSpacing: '0.5px',
        }}>
          Try pressing the correct key on the piano below
        </div>

        {/* Mini Piano */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
          <div style={{
            position: 'relative',
            width: `${totalWhiteWidth}px`,
            height: `${WHITE_KEY_H}px`,
          }}>
            {/* White keys */}
            {WHITE_MIDIS.map((midi, i) => {
              const isAutoPressed = pressedMidi === midi && autoPlayingRef.current;
              const isPlayerPressed = pressedMidi === midi && !autoPlayingRef.current;
              const isCurrentNote = NOTES[currentIndex].midi === midi;
              return (
                <div
                  key={midi}
                  onMouseDown={() => handlePlayerPress(midi)}
                  onMouseUp={() => setPressedMidi(null)}
                  onMouseLeave={() => setPressedMidi(null)}
                  style={{
                    position: 'absolute',
                    left: `${i * WHITE_KEY_W}px`,
                    top: 0,
                    width: `${WHITE_KEY_W - 1}px`,
                    height: `${WHITE_KEY_H}px`,
                    background: isAutoPressed
                      ? '#00CC58'
                      : isPlayerPressed
                        ? (midi === NOTES[currentIndex].midi ? '#00CC58' : '#ff4444')
                        : isCurrentNote
                          ? 'rgba(0,204,88,0.1)'
                          : '#ffffff',
                    border: isCurrentNote ? '1px solid rgba(0,204,88,0.4)' : '1px solid #ccc',
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
                  <span style={{
                    fontSize: '8px',
                    color: isAutoPressed || isPlayerPressed ? '#fff' : '#aaa',
                    pointerEvents: 'none',
                  }}>
                    {isCurrentNote ? NOTES[currentIndex].label : ''}
                  </span>
                </div>
              );
            })}

            {/* Black keys */}
            {BLACK_KEYS.map(({ midi, afterWhiteIndex }) => {
              const isAutoPressed = pressedMidi === midi && autoPlayingRef.current;
              const isPlayerPressed = pressedMidi === midi && !autoPlayingRef.current;
              const leftPos = (afterWhiteIndex + 1) * WHITE_KEY_W - BLACK_KEY_W / 2 - 1;
              return (
                <div
                  key={midi}
                  onMouseDown={e => { e.stopPropagation(); handlePlayerPress(midi); }}
                  onMouseUp={e => { e.stopPropagation(); setPressedMidi(null); }}
                  onMouseLeave={e => { e.stopPropagation(); setPressedMidi(null); }}
                  style={{
                    position: 'absolute',
                    left: `${leftPos}px`,
                    top: 0,
                    width: `${BLACK_KEY_W}px`,
                    height: `${BLACK_KEY_H}px`,
                    background: isAutoPressed
                      ? '#00CC58'
                      : isPlayerPressed
                        ? (midi === NOTES[currentIndex].midi ? '#00CC58' : '#ff4444')
                        : '#222',
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
              onClick={() => {
                setCurrentIndex(i);
                setNoteColor('black');
                setFade(true);
                playMidi(NOTES[i].midi);
                autoPlayingRef.current = true;
                setPressedMidi(NOTES[i].midi);
                setTimeout(() => { setPressedMidi(null); autoPlayingRef.current = false; }, 600);
              }}
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
      <div style={{ fontSize: '1rem', lineHeight: '2', opacity: 1,textAlign: 'center', padding: '0 4px' ,}}>
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