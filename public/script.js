import { Renderer, Stave, StaveNote, Voice, Formatter, Accidental } from "https://esm.sh/vexflow";

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

let currentExercise = [];
let currentIndex = 0;
let currentClef = "treble"; // or "bass"

let correctNotesCount = 0;
let attemptedNotesCount = 0;
let exerciseStartTime = 0;

const dingSound = new Audio('ding.mp3');
const buzzSound = new Audio('buzz.mp3');

function noteToString(noteNumber) {
  const name = NOTE_NAMES[noteNumber % 12];
  const octave = Math.floor(noteNumber / 12) - 1;
  return `${name}${octave}`;
}

function getVexflowKey(noteNumber) {
  const noteIndex = noteNumber % 12;
  const octave = Math.floor(noteNumber / 12) - 1;
  const noteMap = {
    0: 'c', 1: 'c#', 2: 'd', 3: 'd#', 4: 'e',
    5: 'f', 6: 'f#', 7: 'g', 8: 'g#', 9: 'a',
    10: 'a#', 11: 'b'
  };
  return `${noteMap[noteIndex]}/${octave}`;
}

function generateRandomExercise() {
    startTimer()
  currentClef = Math.random() < 0.5 ? "treble" : "bass";

  const range = currentClef === "treble" ? [60, 72] : [36, 48];
  const notes = new Set();

  while (notes.size < 4) {
    const n = Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
    notes.add(n);
  }

  const exercise = Array.from(notes);
  exercise.sort((a, b) => a - b);

  correctNotesCount = 0;
  attemptedNotesCount = 0;
  updateStats();

  exerciseStartTime = performance.now();

  console.log(`Clef: ${currentClef.toUpperCase()}`);
  console.log("Exercise Notes:", exercise.map(noteToString).join(", "));
  return exercise;
}

function updateStats(timeElapsed = 0) {
  const accuracy = attemptedNotesCount === 0 ? 0 : (correctNotesCount / attemptedNotesCount) * 100;
  console.log(`Updating stats: Correct: ${correctNotesCount}, Attempted: ${attemptedNotesCount}, Accuracy: ${accuracy.toFixed(1)}%`);
  document.getElementById("accuracy").textContent = `${accuracy.toFixed(1)}%`;
  document.getElementById("time").textContent = `${(timeElapsed / 1000).toFixed(1)}s`;
}


let timerInterval = null;

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function startTimer() {
  exerciseStartTime = performance.now();
  if (timerInterval) clearInterval(timerInterval); // clear existing if any

  timerInterval = setInterval(() => {
    const timeElapsed = performance.now() - exerciseStartTime;
    updateStats(timeElapsed);
  }, 100);
}
function drawNotes(notes, correctCount = 0, wrongIndex = -1) {
  const container = document.getElementById("staff");
  container.innerHTML = "";

  const renderer = new Renderer(container, Renderer.Backends.SVG);
  renderer.resize(500, 200);
  const context = renderer.getContext();
  const stave = new Stave(10, 40, 400);
  stave.addClef(currentClef).setContext(context).draw();

  if (!notes.length) return;

  const staveNotes = notes.map((note, i) => {
    const key = getVexflowKey(note);
    const vfNote = new StaveNote({ keys: [key], duration: "q", clef: currentClef });

    if (key.includes("#")) {
      vfNote.addModifier(new Accidental("#"), 0);
    }

    if (i < correctCount) {
      vfNote.setStyle({ fillStyle: "green", strokeStyle: "green" });
    } else if (i === wrongIndex) {
      vfNote.setStyle({ fillStyle: "red", strokeStyle: "red" });
    }

    return vfNote;
  });

  const voice = new Voice({ num_beats: notes.length, beat_value: 4 });
  voice.addTickables(staveNotes);
  new Formatter().joinVoices([voice]).format([voice], 350);
  voice.draw(context, stave);
}

document.getElementById("start").onclick = async () => {
  try {
    const midiAccess = await navigator.requestMIDIAccess();
    const statusDiv = document.getElementById("status");

    if (midiAccess.inputs.size > 0) {
      statusDiv.textContent = "MIDI device connected!";
      statusDiv.className = "connected";

      currentExercise = generateRandomExercise();
      currentIndex = 0;
      drawNotes(currentExercise);

      for (const input of midiAccess.inputs.values()) {
        document.getElementById("device-name").textContent = input.name;

        input.onmidimessage = (event) => {
        const [status, note, velocity] = event.data;
        const isNoteOn = (status & 0xf0) === 0x90 && velocity > 0;

        if (isNoteOn) {
            console.log("You played:", noteToString(note));

            attemptedNotesCount++;

            if (note === currentExercise[currentIndex]) {
            correctNotesCount++;
            currentIndex++;
            drawNotes(currentExercise, currentIndex);

            updateStats();  // accuracy updates live, time updated by timer

            if (currentIndex === currentExercise.length) {
                dingSound.play();
                stopTimer(); // stop timer when exercise finishes
                updateStats(performance.now() - exerciseStartTime); // final time update

                currentExercise = generateRandomExercise();
                currentIndex = 0;
                setTimeout(() => drawNotes(currentExercise), 600);
            }
            } else {
            buzzSound.play();
            drawNotes(currentExercise, currentIndex, currentIndex);
            currentIndex = 0;
            stopTimer(); // stop timer on error/reset
            updateStats(0); // reset stats display (time 0)
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
