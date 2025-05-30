// Function to create a virtual piano in the DOM
function createPiano() {
  const piano = document.getElementById('virtual-piano'); // Get the container element

  const noteNames = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#']; // Chromatic scale
  const whiteNotes = ['A', 'B', 'C', 'D', 'E', 'F', 'G']; // Only white keys

  let whiteKeyCount = 0; // Track the number of white keys for positioning

  // Loop through MIDI note numbers from 36 to 95 (piano range)
  for (let midi = 36; midi <= 95; midi++) {
    const noteIndex = (midi - 21) % 12; // Calculate index in the noteNames array
    const noteName = noteNames[noteIndex]; // Get the note name
    const isWhite = whiteNotes.includes(noteName); // Determine if it's a white key

    const key = document.createElement('div'); // Create key element
    key.classList.add('piano-key'); // Common class for all keys
    key.dataset.midi = midi; // Store MIDI note
    key.dataset.note = noteName; // Store note name

    // Add event listener for pressing the key (mousedown)
    key.addEventListener('mousedown', (e) => {
      e.stopPropagation(); // Prevent event bubbling
      sendMIDINoteOn(midi, 100); // Send MIDI "note on"
      key.classList.add('pressed'); // Visually mark key as pressed
    });

    // Event for mouse release
    key.addEventListener('mouseup', (e) => {
      e.stopPropagation();
      sendMIDINoteOff(midi); // Send MIDI "note off"
      key.classList.remove('pressed'); // Remove pressed visual
    });

    // Handle mouse leaving the key while pressed
    key.addEventListener('mouseleave', (e) => {
      sendMIDINoteOff(midi);
      key.classList.remove('pressed');
    });

    if (isWhite) {
      // If it's a C note, label it with the octave (e.g., C4)
      if (noteName === 'C') {
        const octave = Math.floor(midi / 12) - 1; // MIDI to octave conversion
        const label = document.createElement('span');
        label.textContent = `C${octave}`;
        label.classList.add('note-label'); // Add label class
        key.appendChild(label);
      }
      piano.appendChild(key); // Add white key to piano
      whiteKeyCount++; // Increment white key count
    } else {
      // Handle black keys
      key.classList.add('black'); // Add black key class
      const blackKeyOffset = getBlackKeyOffset(noteName, whiteKeyCount); // Calculate positioning
      key.style.left = `${blackKeyOffset}px`; // Position black key over white keys
      piano.appendChild(key); // Add black key to piano
    }
  }
}

// Calculate horizontal position of black keys based on their order and white key count
function getBlackKeyOffset(noteName, whiteKeyCount) {
  const whiteKeyWidth = 40; // Width of each white key in pixels
  let offset = 0;

  switch (noteName) {
    case 'A#':
    case 'C#':
    case 'D#':
    case 'F#':
    case 'G#':
      // Position black key slightly to the left of the next white key
      offset = (whiteKeyCount - 1) * whiteKeyWidth + whiteKeyWidth - 14;
      break;
  }

  return offset;
}

// Send a custom event to simulate a "note on" MIDI message
function sendMIDINoteOn(note, velocity = 100) {
  const midiEvent = new CustomEvent('virtualMIDI', {
    detail: {
      type: 'noteon',
      note: note,
      velocity: velocity,
      timestamp: performance.now()
    }
  });
  window.dispatchEvent(midiEvent); // Emit the event
  console.log("Virtual MIDI Note On:", note, "Velocity:", velocity);
}

// Send a custom event to simulate a "note off" MIDI message
function sendMIDINoteOff(note) {
  const midiEvent = new CustomEvent('virtualMIDI', {
    detail: {
      type: 'noteoff',
      note: note,
      velocity: 0,
      timestamp: performance.now()
    }
  });
  window.dispatchEvent(midiEvent); // Emit the event
  console.log("Virtual MIDI Note Off:", note);
}

// Highlight or unhighlight a key programmatically (used for external control)
function highlightVirtualKey(midiNote, pressed) {
  const key = document.querySelector(`.piano-key[data-midi='${midiNote}']`);
  if (key) {
    key.classList.toggle('pressed', pressed); // Add or remove "pressed" class
  }
}

// Expose MIDI control functions to the global scope for external use
window.virtualMIDI = {
  sendNoteOn: sendMIDINoteOn,
  sendNoteOff: sendMIDINoteOff
};

// Initialize and render the piano on page load
createPiano();
