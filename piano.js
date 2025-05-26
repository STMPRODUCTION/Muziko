    function createPiano() {
      const piano = document.getElementById('virtual-piano');
      
      // Start from A0 (MIDI 21) which is a white key
      // Pattern for a full octave starting from A: A, A#, B, C, C#, D, D#, E, F, F#, G, G#
      const noteNames = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
      const whiteNotes = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
      
      let whiteKeyCount = 0;
      
      for (let midi = 21; midi <= 108; midi++) {
        const noteIndex = (midi - 21) % 12;
        const noteName = noteNames[noteIndex];
        const isWhite = whiteNotes.includes(noteName);
        
        const key = document.createElement('div');
        key.classList.add('piano-key');
        key.dataset.midi = midi;
        key.dataset.note = noteName;
        
        // Add click event with proper event handling
        key.addEventListener('mousedown', (e) => {
          e.stopPropagation();
          sendMIDINoteOn(midi, 100); // velocity 100
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
          piano.appendChild(key);
          whiteKeyCount++;
        } else {
          key.classList.add('black');
          // Position black keys between white keys
          const blackKeyOffset = getBlackKeyOffset(noteName, whiteKeyCount);
          key.style.left = `${blackKeyOffset}px`;
          piano.appendChild(key);
        }
      }
    }

    function getBlackKeyOffset(noteName, whiteKeyCount) {
      // Calculate the position for black keys relative to white keys
      const whiteKeyWidth = 40;
      let offset = 0;
      
      switch(noteName) {
        case 'A#':
          offset = (whiteKeyCount - 1) * whiteKeyWidth + whiteKeyWidth - 14;
          break;
        case 'C#':
          offset = (whiteKeyCount - 1) * whiteKeyWidth + whiteKeyWidth - 14;
          break;
        case 'D#':
          offset = (whiteKeyCount - 1) * whiteKeyWidth + whiteKeyWidth - 14;
          break;
        case 'F#':
          offset = (whiteKeyCount - 1) * whiteKeyWidth + whiteKeyWidth - 14;
          break;
        case 'G#':
          offset = (whiteKeyCount - 1) * whiteKeyWidth + whiteKeyWidth - 14;
          break;
      }
      
      return offset;
    }

    // Function to send MIDI note on events
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

    // Function to send MIDI note off events
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

    // Make functions globally available for the main script
    window.virtualMIDI = {
      sendNoteOn: sendMIDINoteOn,
      sendNoteOff: sendMIDINoteOff
    };

    createPiano();