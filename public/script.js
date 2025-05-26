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

// Handle note on events (from both real MIDI and virtual piano)
function handleNoteOn(note, velocity) {
  attemptedNotesCount++;

  if (note === currentExercise[currentIndex]) {
    correctNotesCount++;
    currentIndex++;
    drawNotes(currentExercise, currentIndex);

    updateStats();  // live accuracy update, time by timer

    if (currentIndex === currentExercise.length) {
      dingSound.play();
      stopTimer();

      const timeElapsed = performance.now() - exerciseStartTime;
      updateStats(timeElapsed);

      updateCharts(
        (correctNotesCount / attemptedNotesCount) * 100,
        timeElapsed / 1000
      );

      currentExercise = generateRandomExercise();
      currentIndex = 0;
      setTimeout(() => drawNotes(currentExercise), 600);
    }
  } else {
    buzzSound.play();
    drawNotes(currentExercise, currentIndex, currentIndex);
    currentIndex = 0;
    stopTimer();
    updateStats(0);
  }
}

// Handle note off events (if needed for future features)
function handleNoteOff(note) {
  // Currently not used, but available for future features
}

// Listen for virtual MIDI events from the virtual piano
window.addEventListener('virtualMIDI', (event) => {
  const { type, note, velocity, timestamp } = event.detail;
  
  if (type === 'noteon') {
    handleNoteOn(note, velocity);
  } else if (type === 'noteoff') {
    handleNoteOff(note);
  }
});

function generateRandomExercise() {
  startTimer();
  currentClef = Math.random() < 0.5 ? "treble" : "bass";

  const range = currentClef === "treble" ? [60, 72] : [36, 48];
  const notes = new Set();

  while (notes.size < 8) {
    const n = Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
    notes.add(n);
  }

  const exercise = Array.from(notes);
  //exercise.sort((a, b) => a - b);

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
  if (timerInterval) clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    const timeElapsed = performance.now() - exerciseStartTime;
    updateStats(timeElapsed);
  }, 100);
}

function drawNotes(notes, correctCount = 0, wrongIndex = -1) {
  const container = document.getElementById("staff");
  container.innerHTML = "";

  const renderer = new Renderer(container, Renderer.Backends.SVG);
  renderer.resize(750, 200);
  const context = renderer.getContext();
  const stave = new Stave(10, 40, 700);
  stave.addClef(currentClef).setContext(context).draw();

  if (!notes.length) return;

  const staveNotes = notes.map((note, i) => {
    const key = getVexflowKey(note);
    const vfNote = new StaveNote({ keys: [key], duration: "q", clef: currentClef });

    if (key.includes("#")) {
      vfNote.addModifier(new Accidental("#"), 0);
    }

    if (i < correctCount) {
      vfNote.setStyle({ fillStyle: "#00CC58", strokeStyle: "#00CC58" }); // green color
    } else if (i === wrongIndex) {
      vfNote.setStyle({ fillStyle: "red", strokeStyle: "red" });
    }

    return vfNote;
  });

  const voice = new Voice({ num_beats: notes.length, beat_value: 4 });
  voice.setStrict(false);
  voice.addTickables(staveNotes);
  new Formatter().joinVoices([voice]).format([voice], 700);
  voice.draw(context, stave);
}

document.getElementById("start").onclick = async () => {
  try {
    const midiAccess = await navigator.requestMIDIAccess();
    const statusDiv = document.getElementById("status");

    if (midiAccess.inputs.size > 0) {
      statusDiv.textContent = "MIDI device connected!";
      statusDiv.className = "connected";

      // Set up real MIDI input handlers
      for (const input of midiAccess.inputs.values()) {
        document.getElementById("device-name").textContent = input.name;

        input.onmidimessage = (event) => {
          const [status, note, velocity] = event.data;
          const isNoteOn = (status & 0xf0) === 0x90 && velocity > 0;

          if (isNoteOn) {
            handleNoteOn(note, velocity);
          }
        };
      }
    } else {
      statusDiv.textContent = "No MIDI device found. Using virtual piano.";
      statusDiv.className = "virtual";
      document.getElementById("device-name").textContent = "Virtual Piano";
    }

    // Start exercise regardless of MIDI device availability
    currentExercise = generateRandomExercise();
    currentIndex = 0;
    drawNotes(currentExercise);

  } catch (err) {
    console.error("MIDI access failed:", err);
    const statusDiv = document.getElementById("status");
    statusDiv.textContent = "MIDI access failed. Using virtual piano.";
    statusDiv.className = "virtual";
    document.getElementById("device-name").textContent = "Virtual Piano";
    
    // Start exercise with virtual piano only
    currentExercise = generateRandomExercise();
    currentIndex = 0;
    drawNotes(currentExercise);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  drawNotes([]);
});

// Arrays to track exercise data
const accuracyHistory = [];
const timeHistory = [];

// Get canvas contexts after DOM is ready
let accuracyCtx, timeCtx;

window.onload = () => {
  const accuracyCanvas = document.getElementById('accuracyChart');
  const timeCanvas = document.getElementById('timeChart');
  accuracyCtx = accuracyCanvas.getContext('2d');
  timeCtx = timeCanvas.getContext('2d');
  drawLineGraph(accuracyCtx, [], 'Accuracy (%) Over Exercises', 'Accuracy %', 100);
  drawLineGraph(timeCtx, [], 'Time (seconds) Per Exercise', 'Seconds');
};

// Function to draw a simple line graph
function drawLineGraph(ctx, data, label, yLabel, maxY) {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  ctx.clearRect(0, 0, width, height);

  // Draw axes
  ctx.strokeStyle = '#00CC58';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(40, 10);
  ctx.lineTo(40, height - 30);
  ctx.lineTo(width - 10, height - 30);
  ctx.stroke();

  ctx.font = '14px monospace';
  ctx.fillStyle = '#00CC58';
  ctx.fillText(label, width / 2 - ctx.measureText(label).width / 2, 10);

  // Y-axis label (rotated)
  ctx.save();
  ctx.translate(10, height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(yLabel, 0, 0);
  ctx.restore();

  if (data.length === 0) {
    ctx.fillText('No data yet', width / 2 - 40, height / 2);
    return;
  }

  // Draw points and lines
  const maxData = maxY || Math.max(...data) * 1.1;
  const paddingLeft = 40;
  const paddingBottom = 30;
  const graphWidth = width - paddingLeft - 10;
  const graphHeight = height - 40;

  // Scale data points
  const stepX = data.length > 1 ? graphWidth / (data.length - 1) : graphWidth;

  ctx.strokeStyle = '#00CC58';
  ctx.lineWidth = 2;
  ctx.beginPath();
  data.forEach((val, i) => {
    const x = paddingLeft + i * stepX;
    const y = height - paddingBottom - (val / maxData) * graphHeight;
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.stroke();

  // Draw data points
  data.forEach((val, i) => {
    const x = paddingLeft + i * stepX;
    const y = height - paddingBottom - (val / maxData) * graphHeight;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, 2 * Math.PI);
    ctx.fillStyle = '#00CC58';
    ctx.fill();
  });

  // Draw X-axis labels: exercise numbers
  ctx.fillStyle = '#00CC58';
  ctx.font = '12px monospace';
  data.forEach((_, i) => {
    const x = paddingLeft + i * stepX;
    ctx.fillText(i + 1, x - 6, height - 10);
  });

  // Draw Y-axis max label
  ctx.fillText(maxY ? maxY : maxData.toFixed(0), 5, 20);
}

// Update charts with new data
function updateCharts(accuracy, timeSec) {
  accuracyHistory.push(accuracy);
  timeHistory.push(timeSec);

  drawLineGraph(accuracyCtx, accuracyHistory, 'Accuracy (%) Over Exercises', 'Accuracy %', 100);
  drawLineGraph(timeCtx, timeHistory, 'Time (seconds) Per Exercise', 'Seconds');
}