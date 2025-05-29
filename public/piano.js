function createPiano() {
  const piano = document.getElementById('virtual-piano');

  const noteNames = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
  const whiteNotes = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

  let whiteKeyCount = 0;

  for (let midi = 36; midi <= 95; midi++) {
    const noteIndex = (midi - 21) % 12;
    const noteName = noteNames[noteIndex];
    const isWhite = whiteNotes.includes(noteName);

    const key = document.createElement('div');
    key.classList.add('piano-key');
    key.dataset.midi = midi;
    key.dataset.note = noteName;

    key.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      sendMIDINoteOn(midi, 100);
      key.classList.add('pressed');
    });

    key.addEventListener('mouseup', (e) => {
      e.stopPropagation();
      sendMIDINoteOff(midi);
      key.classList.remove('pressed');
    });

    key.addEventListener('mouseleave', (e) => {
      sendMIDINoteOff(midi);
      key.classList.remove('pressed');
    });

    if (isWhite) {
      if (noteName === 'C') {
        const octave = Math.floor(midi / 12) - 1;
        const label = document.createElement('span');
        label.textContent = `C${octave}`;
        label.classList.add('note-label');
        key.appendChild(label);
      }
      piano.appendChild(key);
      whiteKeyCount++;
    } else {
      key.classList.add('black');
      const blackKeyOffset = getBlackKeyOffset(noteName, whiteKeyCount);
      key.style.left = `${blackKeyOffset}px`;
      piano.appendChild(key);
    }
  }
}

function getBlackKeyOffset(noteName, whiteKeyCount) {
  const whiteKeyWidth = 40;
  let offset = 0;

  switch (noteName) {
    case 'A#':
    case 'C#':
    case 'D#':
    case 'F#':
    case 'G#':
      offset = (whiteKeyCount - 1) * whiteKeyWidth + whiteKeyWidth - 14;
      break;
  }

  return offset;
}

function sendMIDINoteOn(note, velocity = 100) {
  const midiEvent = new CustomEvent('virtualMIDI', {
    detail: {
      type: 'noteon',
      note: note,
      velocity: velocity,
      timestamp: performance.now()
    }
  });
  window.dispatchEvent(midiEvent);
  console.log("Virtual MIDI Note On:", note, "Velocity:", velocity);
}

function sendMIDINoteOff(note) {
  const midiEvent = new CustomEvent('virtualMIDI', {
    detail: {
      type: 'noteoff',
      note: note,
      velocity: 0,
      timestamp: performance.now()
    }
  });
  window.dispatchEvent(midiEvent);
  console.log("Virtual MIDI Note Off:", note);
}

function highlightVirtualKey(midiNote, pressed) {
  const key = document.querySelector(`.piano-key[data-midi='${midiNote}']`);
  if (key) {
    key.classList.toggle('pressed', pressed);
  }
}

window.virtualMIDI = {
  sendNoteOn: sendMIDINoteOn,
  sendNoteOff: sendMIDINoteOff
};

createPiano();
