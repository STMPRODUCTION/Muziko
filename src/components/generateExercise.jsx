// White notes only (no sharps/flats) in MIDI
const WHITE_NOTES = [
  36,38,40,41,43,45,47, // C2-B2
  48,50,52,53,55,57,59, // C3-B3
  60,62,64,65,67,69,71, // C4-B4
  72,74,76,77,79,81,83, // C5-B5
  84,86,88,89,91,93,95, // C6-B6
];

// Major scale intervals (semitones)
const MAJOR = [0,2,4,5,7,9,11,12];
// Minor scale intervals
const MINOR = [0,2,3,5,7,8,10,12];
// Arpeggio (major triad up + down)
const ARPEGGIO_MAJOR = [0,4,7,12,7,4,0,4];
const ARPEGGIO_MINOR = [0,3,7,12,7,3,0,3];

function randomRoot(minMidi, maxMidi) {
  return Math.floor(Math.random() * (maxMidi - minMidi + 1)) + minMidi;
}

function applyIntervals(root, intervals) {
  return intervals.map(i => root + i);
}

export function generateExercise(difficulty, clef) {

  const isTreble = clef === 'treble';
  
  if (difficulty === 'easy') {
    // Simple ascending or descending scale (white notes only)
    const range = isTreble ? [60, 72] : [36, 48];
    const start = randomRoot(range[0], range[1] - 7);
    // Pick white notes from start ascending or descending
    const whites = WHITE_NOTES.filter(n => n >= start && n <= start + 12).slice(0, 8);
    const ascending = Math.random() < 0.5;
    return ascending ? whites : [...whites].reverse();
  }

  if (difficulty === 'medium') {
    const range = isTreble ? [60, 72] : [36, 48];
    const root = randomRoot(range[0], range[1] - 12);
    const type = Math.floor(Math.random() * 4);

    let notes = [];
    if (type === 0) {
      const whites = WHITE_NOTES.filter(n => n >= root && n <= root + 12).slice(0, 5);
      notes = [...whites, ...whites.slice(0, 3).reverse()];
    } else if (type === 1) {
      notes = applyIntervals(root, MAJOR);
    } else if (type === 2) {
      notes = applyIntervals(root, MINOR);
    } else {
      notes = applyIntervals(root, ARPEGGIO_MAJOR);
    }

    // Pick a random middle note and duplicate it
    const dupIndex = Math.floor(Math.random() * (notes.length - 2)) + 1;
    notes.splice(dupIndex, 0, notes[dupIndex]);

    // Keep to 8 notes
    return notes.slice(0, 8);
  }
    if (difficulty === 'hard') {
      const range = isTreble ? [57, 84] : [36, 64];
      const root = randomRoot(range[0], range[1] - 14);
      const musicalJumps = [2, 3, 4, 5, 7, 8, 9, 12, -2, -3, -4, -5, -7, -8, -9, -12];
      const goodIntervals = [2, 3, 4, 5, 7, 9, 12]; // consonant intervals

      const buildMelody = (startNote, length) => {
        const melody = [startNote];
        for (let i = 1; i < length; i++) {
          const prev = melody[i - 1];
          const valid = musicalJumps.filter(j => {
            const next = prev + j;
            return next >= range[0] && next <= range[1];
          });
          melody.push(prev + valid[Math.floor(Math.random() * valid.length)]);
        }
        return melody;
      };

      const pickGoodNote = (fromNote) => {
        const valid = goodIntervals
          .flatMap(i => [fromNote + i, fromNote - i])
          .filter(n => n >= range[0] && n <= range[1]);
        return valid[Math.floor(Math.random() * valid.length)];
      };

      const type = Math.floor(Math.random() * 9);

      if (type === 0) return applyIntervals(root, MAJOR);
      if (type === 1) return applyIntervals(root, MINOR);
      if (type === 2) return applyIntervals(root, ARPEGGIO_MAJOR);
      if (type === 3) return applyIntervals(root, ARPEGGIO_MINOR);
      if (type === 4) return applyIntervals(root, [0,2,3,5,7,9,11,12]); // melodic minor

      if (type === 5) {
        // Repeated interval pairs sliding up by step: [C4,D4, C4,D4, D4,E4, D4,E4]
        const interval = goodIntervals[Math.floor(Math.random() * 4)]; // 2,3,4,5
        const second = root + interval;
        return [root, second, root, second, root+2, second+2, root+2, second+2]
          .filter(n => n >= range[0] && n <= range[1]);
      }

      if (type === 6) {
        // Offset second note pattern: [C4,E4, C4,F4, C4,G4, C4,A4]
        const offsets = goodIntervals.slice(0, 4);
        return offsets.flatMap(i => {
          const n = root + i;
          return n >= range[0] && n <= range[1] ? [root, n] : [];
        }).slice(0, 8);
      }

      if (type === 7) {
        // 4 roots each paired with a musically good note
        return Array.from({ length: 4 }, () => {
          const r = randomRoot(range[0], range[1] - 12);
          return [r, pickGoodNote(r)];
        }).flat();
      }

      // type 8: 2 roots alternating with good companion notes
      const root2 = randomRoot(range[0], range[1] - 12);
      return [
        root, pickGoodNote(root),
        root, pickGoodNote(root),
        root2, pickGoodNote(root2),
        root2, pickGoodNote(root2),
      ];
    }
  if (difficulty === 'random') {
    const range = isTreble ? [57, 84] : [36, 64];
    return Array.from({ length: 8 }, () =>
      Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0]
    );
  }
}