import {
    Renderer,
    Stave,
    StaveNote,
    Voice,
    Formatter,
    Accidental,
    KeyManager
} from "https://esm.sh/vexflow";

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const KEY_SIGNATURES = {
    "C": { notes: [0, 2, 4, 5, 7, 9, 11], accidentals: [] },
    "G": { notes: [0, 2, 4, 6, 7, 9, 11], accidentals: [6] },
    "D": { notes: [0, 1, 4, 6, 7, 9, 11], accidentals: [1, 6] },
    "A": { notes: [0, 1, 4, 6, 7, 8, 11], accidentals: [1, 6, 8] },
    "E": { notes: [0, 1, 3, 6, 7, 8, 11], accidentals: [1, 3, 6, 8] },
    "B": { notes: [0, 1, 3, 6, 7, 8, 10], accidentals: [1, 3, 6, 8, 10] },
    "F#": { notes: [1, 3, 5, 6, 8, 10, 0], accidentals: [1, 3, 5, 8, 10, 0] },
    "C#": { notes: [1, 3, 5, 6, 8, 10, 0], accidentals: [1, 3, 5, 6, 8, 10, 0] },
    "F": { notes: [0, 2, 4, 5, 7, 9, 10], accidentals: [10] },
    "Bb": { notes: [0, 2, 3, 5, 7, 9, 10], accidentals: [3, 10] },
    "Eb": { notes: [0, 2, 3, 5, 7, 8, 10], accidentals: [3, 8, 10] },
    "Ab": { notes: [0, 1, 3, 5, 7, 8, 10], accidentals: [1, 3, 8, 10] },
    "Db": { notes: [1, 3, 5, 6, 7, 8, 10], accidentals: [1, 3, 6, 8, 10] },
    "Gb": { notes: [1, 3, 5, 6, 8, 10, 0], accidentals: [1, 3, 6, 8, 10, 0] },
    "Cb": { notes: [1, 3, 5, 6, 8, 10, 0], accidentals: [1, 3, 5, 6, 8, 10, 0] }
};

let currentExercise = [];
let currentIndex = 0;
let currentClef = "treble";
let currentKey = "C";
let startTime = null;
let correctPlays = 0;
let wrongPlays = 0;

let dingSound = new Audio("ding.mp3");
let buzzSound = new Audio("buzz.mp3");

function noteToString(noteNumber) {
    const name = NOTE_NAMES[noteNumber % 12];
    const octave = Math.floor(noteNumber / 12) - 1;
    return `${name}${octave}`;
}

function getVexflowKey(midiNote, keySignature) {
    const pitchClass = midiNote % 12;
    const octave = Math.floor(midiNote / 12) - 1;

    const NOTE_LETTERS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const NATURAL_LETTERS = ['c', 'c', 'd', 'd', 'e', 'f', 'f', 'g', 'g', 'a', 'a', 'b'];

    const keyManager = new KeyManager(keySignature);
    const actualNote = NOTE_LETTERS[pitchClass];  // e.g., F#
    const baseNote = NATURAL_LETTERS[pitchClass]; // e.g., f

    const corrected = keyManager.selectNote(baseNote); // { note: 'f', accidental: '#' } for G major

    // Compute what the key signature expects for this note
    const expectedPitchClass = (NOTE_LETTERS.indexOf(corrected.note.toUpperCase()) +
        (corrected.accidental === '#' ? 1 :
         corrected.accidental === 'b' ? -1 : 0) + 12) % 12;

    // Only add accidental if actual pitch differs from expected
    let accidental = '';
    if (expectedPitchClass !== pitchClass) {
        const diff = (pitchClass - expectedPitchClass + 12) % 12;
        if (diff === 1) accidental = '#';
        else if (diff === 11) accidental = 'b';
    }

    const finalNote = corrected.note + accidental;
    return `${finalNote}/${octave}`;
}

function generateScaleNotes(keySignature, octaveStart, octaveEnd) {
    const keyInfo = KEY_SIGNATURES[keySignature];
    const scaleNotes = [];

    for (let octave = octaveStart; octave <= octaveEnd; octave++) {
        for (const noteIndex of keyInfo.notes) {
            const midiNote = (octave + 1) * 12 + noteIndex;
            scaleNotes.push(midiNote);
        }
    }

    return scaleNotes;
}

function generateRandomExercise() {
    const keyNames = Object.keys(KEY_SIGNATURES);
    currentClef = Math.random() < 0.5 ? "treble" : "bass";
    currentKey = keyNames[Math.floor(Math.random() * keyNames.length)];

    const octaveRange = currentClef === "treble" ? [4, 5] : [2, 3];
    const availableNotes = generateScaleNotes(currentKey, octaveRange[0], octaveRange[1]);

    const filteredNotes = availableNotes.filter(midi => {
        return currentClef === "treble"
            ? midi >= 60 && midi <= 81
            : midi >= 36 && midi <= 57;
    });

    const selectedNotes = [];
    const noteSet = new Set();

    while (selectedNotes.length < 4 && noteSet.size < filteredNotes.length) {
        const randomNote = filteredNotes[Math.floor(Math.random() * filteredNotes.length)];
        if (!noteSet.has(randomNote)) {
            noteSet.add(randomNote);
            selectedNotes.push(randomNote);
        }
    }

    selectedNotes.sort((a, b) => a - b);

    const exercise = selectedNotes.map(midi => ({
        midi,
        vexflow: getVexflowKey(midi, currentKey)
    }));

    document.getElementById("exercise-info").textContent =
        `Clef: ${currentClef.toUpperCase()} | Key: ${currentKey} | Play: ${exercise.map((n, i) => `${i + 1}.${noteToString(n.midi)}`).join(" → ")}`;

    console.log("Preparing to draw notes:", exercise.map(n => n.vexflow));
    console.table(exercise.map((n, i) => ({
    index: i + 1,
    midi: n.midi,
    playNoteInC: noteToString(n.midi),
    shownAs: n.vexflow
    })));

    exercise.forEach((n, i) => {
        if (!n.vexflow || typeof n.vexflow !== "string" || n.vexflow.startsWith("undefined")) {
            console.warn(`⚠️ Bad note at index ${i}:`, n);
        }
    });

    return exercise;
}

function drawNotes(notes, correctCount = 0, wrongIndex = -1) {
    const container = document.getElementById("staff");
    container.innerHTML = "";

    const renderer = new Renderer(container, Renderer.Backends.SVG);
    renderer.resize(500, 200);
    const context = renderer.getContext();

    const stave = new Stave(10, 40, 400);
    stave.addClef(currentClef).addKeySignature(currentKey).setContext(context).draw();

    if (!notes.length) return;

    const keyManager = new KeyManager(currentKey);

    const staveNotes = notes.map((noteObj, i) => {
        const key = noteObj.vexflow;
        if (!key || typeof key !== "string") {
            console.warn("Invalid VexFlow key string:", key);
            return null;
        }

        const [notePart, octavePart] = key.split('/');
        const { note, accidental } = keyManager.selectNote(notePart);

        const formattedKey = `${note}/${octavePart}`;
        const vfNote = new StaveNote({ keys: [formattedKey], duration: "q", clef: currentClef });

        // Only add the accidental if needed
        if (accidental) {
            vfNote.addModifier(new Accidental(accidental), 0);
        }

        if (i < correctCount) {
            vfNote.setStyle({ fillStyle: "green", strokeStyle: "green" });
        } else if (i === wrongIndex) {
            vfNote.setStyle({ fillStyle: "red", strokeStyle: "red" });
        }

        return vfNote;
    }).filter(n => n);

    const voice = new Voice({ num_beats: notes.length, beat_value: 4 });
    voice.addTickables(staveNotes);
    new Formatter().joinVoices([voice]).format([voice], 350);
    voice.draw(context, stave);
}



function showStats() {
    const stats = document.getElementById("stats");
    const accuracy = correctPlays + wrongPlays > 0
        ? (correctPlays / (correctPlays + wrongPlays)) * 100
        : 100;
    stats.textContent = `Accuracy: ${accuracy.toFixed(1)}% | Time: ${((performance.now() - startTime) / 1000).toFixed(2)}s | Correct: ${correctPlays} | Wrong: ${wrongPlays}`;
}

document.getElementById("start").onclick = async () => {
    try {
        const midiAccess = await navigator.requestMIDIAccess();
        const statusDiv = document.getElementById("status");

        if (midiAccess.inputs.size > 0) {
            statusDiv.textContent = "MIDI device connected!";
            statusDiv.className = "connected";

            correctPlays = 0;
            wrongPlays = 0;
            startTime = performance.now();

            currentExercise = generateRandomExercise();
            currentIndex = 0;
            drawNotes(currentExercise);
            showStats();

            for (const input of midiAccess.inputs.values()) {
                document.getElementById("device-name").textContent = input.name;

                input.onmidimessage = (event) => {
                    const [status, note, velocity] = event.data;
                    const isNoteOn = (status & 0xf0) === 0x90 && velocity > 0;

                    if (isNoteOn) {
                        const expectedNote = currentExercise[currentIndex];
                        if (!expectedNote) return;

                        const expectedMidi = expectedNote.midi;

                        if (note === expectedMidi) {
                            correctPlays++;
                            currentIndex++;
                            drawNotes(currentExercise, currentIndex);
                            showStats();

                            if (currentIndex === currentExercise.length) {
                                dingSound.play().catch(() => {});
                                setTimeout(() => {
                                    currentExercise = generateRandomExercise();
                                    currentIndex = 0;
                                    startTime = performance.now();
                                    drawNotes(currentExercise);
                                    showStats();
                                }, 600);
                            }
                        } else {
                            wrongPlays++;
                            buzzSound.play().catch(() => {});
                            drawNotes(currentExercise, currentIndex, currentIndex);
                            currentIndex = 0;
                            showStats();
                        }
                    }
                };
            }
        } else {
            statusDiv.textContent = "No MIDI inputs found. Please connect a MIDI device.";
            statusDiv.className = "disconnected";
        }
    } catch (err) {
        console.error("MIDI access failed:", err);
        document.getElementById("status").textContent =
            "Failed to access MIDI devices. Make sure your browser supports Web MIDI API.";
        document.getElementById("status").className = "disconnected";
    }
};

document.addEventListener("DOMContentLoaded", () => {
    drawNotes([]);
});
