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

// Enharmonic spelling rules for each key signature
const ENHARMONIC_SPELLINGS = {
    "C": { 0: "c", 1: "c#", 2: "d", 3: "d#", 4: "e", 5: "f", 6: "f#", 7: "g", 8: "g#", 9: "a", 10: "a#", 11: "b" },
    "G": { 0: "c", 1: "c#", 2: "d", 3: "d#", 4: "e", 5: "f", 6: "f#", 7: "g", 8: "g#", 9: "a", 10: "a#", 11: "b" },
    "D": { 0: "c", 1: "c#", 2: "d", 3: "d#", 4: "e", 5: "f", 6: "f#", 7: "g", 8: "g#", 9: "a", 10: "a#", 11: "b" },
    "A": { 0: "c", 1: "c#", 2: "d", 3: "d#", 4: "e", 5: "f", 6: "f#", 7: "g", 8: "g#", 9: "a", 10: "a#", 11: "b" },
    "E": { 0: "c", 1: "c#", 2: "d", 3: "d#", 4: "e", 5: "f", 6: "f#", 7: "g", 8: "g#", 9: "a", 10: "a#", 11: "b" },
    "B": {0: "C", 1: "C#", 2: "D", 3: "D#", 4: "E", 5: "E#", 6: "F#", 7: "F##", 8: "G#", 9: "A", 10: "A#", 11: "B"},
    "F#": { 0: "b#", 1: "c#", 2: "d", 3: "d#", 4: "e", 5: "e#", 6: "f#", 7: "g", 8: "g#", 9: "a", 10: "a#", 11: "b" },
    "C#": { 0: "b#", 1: "c#", 2: "c##", 3: "d#", 4: "d##", 5: "e#", 6: "f#", 7: "f##", 8: "g#", 9: "g##", 10: "a#", 11: "a##" },
    "F": { 0: "c", 1: "db", 2: "d", 3: "eb", 4: "e", 5: "f", 6: "gb", 7: "g", 8: "ab", 9: "a", 10: "bb", 11: "b" },
    "Bb": { 0: "c", 1: "db", 2: "d", 3: "eb", 4: "e", 5: "f", 6: "gb", 7: "g", 8: "ab", 9: "a", 10: "bb", 11: "b" },
    "Eb": { 0: "c", 1: "db", 2: "d", 3: "eb", 4: "e", 5: "f", 6: "gb", 7: "g", 8: "ab", 9: "a", 10: "bb", 11: "b" },
    "Ab": { 0: "c", 1: "db", 2: "d", 3: "eb", 4: "e", 5: "f", 6: "gb", 7: "g", 8: "ab", 9: "a", 10: "bb", 11: "b" },
    "Db": { 0: "c", 1: "db", 2: "d", 3: "eb", 4: "e", 5: "f", 6: "gb", 7: "g", 8: "ab", 9: "a", 10: "bb", 11: "cb" },
    "Gb": { 0: "c", 1: "db", 2: "d", 3: "eb", 4: "fb", 5: "f", 6: "gb", 7: "g", 8: "ab", 9: "a", 10: "bb", 11: "cb" },
    "Cb": { 0: "cb", 1: "db", 2: "d", 3: "eb", 4: "fb", 5: "f", 6: "gb", 7: "g", 8: "ab", 9: "a", 10: "bb", 11: "cb" }
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

    const spellings = ENHARMONIC_SPELLINGS[keySignature];
    let noteName = spellings[pitchClass];

    if (!noteName) {
        console.warn(`Missing enharmonic spelling for pitch class ${pitchClass} in key ${keySignature}`);
        noteName = NOTE_NAMES[pitchClass]; // fallback
    }

    noteName = noteName.charAt(0).toUpperCase() + noteName.slice(1);
    return `${noteName}/${octave}`;
}

function buildEnharmonicSpelling(key) {
    const scale = buildScale(key); // e.g., B major
    const mapping = {};

    for (let i = 0; i < scale.length; i++) {
        const pitch = scale[i];
        const expectedLetter = "CDEFGAB"[i % 7];
        mapping[pitch % 12] = expectedLetter + getAccidental(pitch, expectedLetter);
    }

    return mapping;
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

function validateEnharmonicSpellings() {
    const keyNames = Object.keys(ENHARMONIC_SPELLINGS);
    const missingNotes = {};

    for (const key of keyNames) {
        const spellings = ENHARMONIC_SPELLINGS[key];
        for (let pitchClass = 0; pitchClass < 12; pitchClass++) {
            if (!spellings[pitchClass]) {
                if (!missingNotes[key]) missingNotes[key] = [];
                missingNotes[key].push(pitchClass);
            }
        }
    }

    console.table(missingNotes);
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

    const staveNotes = notes.map((noteObj, i) => {
        const key = noteObj.vexflow;
        if (!key || typeof key !== "string") {
            console.warn("Invalid VexFlow key string:", key);
            return null;
        }

        const vfNote = new StaveNote({ keys: [key], duration: "q", clef: currentClef });

        // Check if the note has an accidental and if it needs to be displayed
        const [notePart] = key.split('/');
        const hasAccidental = notePart.includes('#') || notePart.includes('b');
        
        if (hasAccidental) {
            const accidental = notePart.includes('#') ? '#' : 'b';
            const accidentalCount = (notePart.match(/#/g) || notePart.match(/b/g) || []).length;
            
            let accidentalSymbol = accidental;
            if (accidentalCount === 2) {
                accidentalSymbol = accidental === '#' ? '##' : 'bb';
            }
            
            // Determine if this accidental should be shown
            const noteWithoutAccidental = notePart.replace(/#/g, '').replace(/b/g, '');
            
            let shouldShowAccidental = true;
            
            // Define the order of sharps and flats as they appear in key signatures
            const sharpOrder = ['f', 'c', 'g', 'd', 'a', 'e', 'b'];
            const flatOrder = ['b', 'e', 'a', 'd', 'g', 'c', 'f'];
            
            // Map each key to its number of sharps or flats
            const keySignatureMap = {
                'C': { type: 'natural', count: 0 },
                'G': { type: 'sharp', count: 1 },
                'D': { type: 'sharp', count: 2 },
                'A': { type: 'sharp', count: 3 },
                'E': { type: 'sharp', count: 4 },
                'B': { type: 'sharp', count: 5 },
                'F#': { type: 'sharp', count: 6 },
                'C#': { type: 'sharp', count: 7 },
                'F': { type: 'flat', count: 1 },
                'Bb': { type: 'flat', count: 2 },
                'Eb': { type: 'flat', count: 3 },
                'Ab': { type: 'flat', count: 4 },
                'Db': { type: 'flat', count: 5 },
                'Gb': { type: 'flat', count: 6 },
                'Cb': { type: 'flat', count: 7 }
            };
            
            const keyInfo = keySignatureMap[currentKey];
            
            if (accidental === '#' && keyInfo.type === 'sharp') {
                // Check if this note letter is already sharped in the key signature
                const noteIndex = sharpOrder.indexOf(noteWithoutAccidental.toLowerCase());
                if (noteIndex !== -1 && noteIndex < keyInfo.count) {
                    shouldShowAccidental = false;
                }
            } else if (accidental === 'b' && keyInfo.type === 'flat') {
                // Check if this note letter is already flatted in the key signature
                const noteIndex = flatOrder.indexOf(noteWithoutAccidental.toLowerCase());
                if (noteIndex !== -1 && noteIndex < keyInfo.count) {
                    shouldShowAccidental = false;
                }
            }
            
            if (shouldShowAccidental) {
                vfNote.addModifier(new Accidental(accidentalSymbol), 0);
            }
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