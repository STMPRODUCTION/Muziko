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
  highlightVirtualKey(note, true);
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
    // Wrong note: play buzz sound and update accuracy, but don't reset exercise
    buzzSound.play();
    drawNotes(currentExercise, currentIndex, currentIndex);
    updateStats(); // Update accuracy to reflect the wrong attempt
    // Note: currentIndex stays the same, exercise continues
  }
}

// Handle note off events (if needed for future features)
function handleNoteOff(note) {
  highlightVirtualKey(note, false); // ← ADD THIS
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

  const range = currentClef === "treble" ? [57, 84] : [36, 64];
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

let currentNotes = [];
let currentCorrectCount = 0;
let currentWrongIndex = -1;
let resizeTimeout;

function drawNotes(notes, correctCount = 0, wrongIndex = -1) {
  // Store current state
  currentNotes = notes;
  currentCorrectCount = correctCount;
  currentWrongIndex = wrongIndex;

  const container = document.getElementById("staff");
  clearContainer(container);
  // Get container dimensions
  const containerRect = container.getBoundingClientRect();
  const containerWidth = containerRect.width || container.clientWidth || 750; // fallback to 750
  const containerHeight = containerRect.height || container.clientHeight || 200; // fallback to 200
  
  // Calculate responsive dimensions
  const padding = 50; // padding on sides
  const staveWidth = Math.max(300, containerWidth - padding * 2); // minimum 300px width
  const rendererWidth = containerWidth-50;
  const rendererHeight = Math.max(150, containerHeight); // minimum 150px height
  
  // Calculate stave positioning to center it
  const staveX = (rendererWidth - staveWidth) / 2;
  const staveY = Math.max(40, (rendererHeight - 120) / 2); // center vertically with minimum top margin

  const renderer = new Renderer(container, Renderer.Backends.SVG);
  renderer.resize(rendererWidth, rendererHeight);
  const context = renderer.getContext();
  
  const stave = new Stave(staveX, staveY, staveWidth);
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
  
  // Use the calculated stave width for formatting
  new Formatter().joinVoices([voice]).format([voice], staveWidth - 100); // subtract space for clef
  voice.draw(context, stave);
}

// Handle window resize with debouncing for better performance
function handleResize() {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    if (currentNotes.length > 0) {
      drawNotes(currentNotes, currentCorrectCount, currentWrongIndex);
    }
  }, 150); // 150ms debounce delay
}
// Add resize event listener (only add once)
if (!window.staffResizeListenerAdded) {
  window.addEventListener('resize', handleResize);
  window.staffResizeListenerAdded = true;
}

function clearContainer(container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
}

document.getElementById("start").onclick = async () => {
  try {
    const midiAccess = await navigator.requestMIDIAccess();
    const statusDiv = document.getElementById("status");
    const deviceNameEl = document.getElementById("device-name");

    if (midiAccess.inputs.size > 0) {
      statusDiv.dataset.translate = "midi_connected";
      statusDiv.textContent = translations[currentLanguage].midi_connected;
      statusDiv.className = "connected";

      // Don’t show the actual device name, just show a translated label
      deviceNameEl.dataset.translate = "device_midi";
      deviceNameEl.textContent = translations[currentLanguage].device_midi;

      for (const input of midiAccess.inputs.values()) {
        input.onmidimessage = (event) => {
          const [status, note, velocity] = event.data;
          const isNoteOn = (status & 0xf0) === 0x90 && velocity > 0;

          if (isNoteOn) {
            handleNoteOn(note, velocity);
          } else {
            handleNoteOff(note);
          }
        };
      }
    } else {
      statusDiv.dataset.translate = "no_midi_found";
      statusDiv.textContent = translations[currentLanguage].no_midi_found;
      statusDiv.className = "virtual";

      deviceNameEl.dataset.translate = "device_virtual";
      deviceNameEl.textContent = translations[currentLanguage].device_virtual;
    }

    // Start exercise
    currentExercise = generateRandomExercise();
    currentIndex = 0;
    drawNotes(currentExercise);

  } catch (err) {
    console.error("MIDI access failed:", err);

    const statusDiv = document.getElementById("status");
    const deviceNameEl = document.getElementById("device-name");

    statusDiv.dataset.translate = "midi_failed";
    statusDiv.textContent = translations[currentLanguage].midi_failed;
    statusDiv.className = "virtual";

    deviceNameEl.dataset.translate = "device_virtual";
    deviceNameEl.textContent = translations[currentLanguage].device_virtual;

    currentExercise = generateRandomExercise();
    currentIndex = 0;
    drawNotes(currentExercise);
  }
};
document.addEventListener("DOMContentLoaded", () => {
  drawNotes([]);
});

// Arrays to track exercise data
let accuracyHistory = [];
let timeHistory = [];

// Load saved data from localStorage
function loadSavedData() {
  try {
    const savedAccuracy = localStorage.getItem('midi-exercise-accuracy');
    const savedTime = localStorage.getItem('midi-exercise-time');
    
    if (savedAccuracy) {
      accuracyHistory = JSON.parse(savedAccuracy);
    }
    if (savedTime) {
      timeHistory = JSON.parse(savedTime);
    }
    
    console.log(`Loaded ${accuracyHistory.length} previous exercise records`);
  } catch (error) {
    console.error('Error loading saved data:', error);
    accuracyHistory = [];
    timeHistory = [];
  }
}

// Save data to localStorage
function saveData() {
  try {
    localStorage.setItem('midi-exercise-accuracy', JSON.stringify(accuracyHistory));
    localStorage.setItem('midi-exercise-time', JSON.stringify(timeHistory));
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

// Get canvas contexts after DOM is ready
let accuracyCtx, timeCtx;

window.onload = () => {
  // Load saved data first
  loadSavedData();
  drawCharts();
};

function drawCharts() {
  const accuracyCanvas = document.getElementById('accuracyChart');
  const timeCanvas = document.getElementById('timeChart');
  accuracyCtx = accuracyCanvas.getContext('2d');
  timeCtx = timeCanvas.getContext('2d');

  const accuracyTitle = translations[currentLanguage]['accuracy_chart_title'] || 'Accuracy (%) Over Exercises';
  const timeTitle = translations[currentLanguage]['time_chart_title'] || 'Time (seconds) Per Exercise';
  const accuracyLabel = translations[currentLanguage]['accuracy_y_label'] || 'Accuracy %';
  const timeLabel = translations[currentLanguage]['time_y_label'] || 'Seconds';

  drawLineGraph(accuracyCtx, accuracyHistory, accuracyTitle, accuracyLabel, 100);
  drawLineGraph(timeCtx, timeHistory, timeTitle, timeLabel);
}
window.drawCharts = function() {
  const accuracyCanvas = document.getElementById('accuracyChart');
  const timeCanvas = document.getElementById('timeChart');
  accuracyCtx = accuracyCanvas.getContext('2d');
  timeCtx = timeCanvas.getContext('2d');

  const accuracyTitle = translations[currentLanguage]['accuracy_chart_title'] || 'Accuracy (%) Over Exercises';
  const timeTitle = translations[currentLanguage]['time_chart_title'] || 'Time (seconds) Per Exercise';
  const accuracyLabel = translations[currentLanguage]['accuracy_y_label'] || 'Accuracy %';
  const timeLabel = translations[currentLanguage]['time_y_label'] || 'Seconds';

  drawLineGraph(accuracyCtx, accuracyHistory, accuracyTitle, accuracyLabel, 100);
  drawLineGraph(timeCtx, timeHistory, timeTitle, timeLabel);
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
    //ctx.fillText('No data yet - complete an exercise to see your progress!', width / 2 - 120, height / 2);
    return;
  }

  // Draw line
  const maxData = maxY || Math.max(...data) * 1.1;
  const paddingLeft = 40;
  const paddingBottom = 30;
  const graphWidth = width - paddingLeft - 10;
  const graphHeight = height - 40;

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

  // Commented out: draw data points
  // data.forEach((val, i) => {
  //   const x = paddingLeft + i * stepX;
  //   const y = height - paddingBottom - (val / maxData) * graphHeight;
  //   ctx.beginPath();
  //   ctx.arc(x, y, 4, 0, 2 * Math.PI);
  //   ctx.fillStyle = '#00CC58';
  //   ctx.fill();
  // });

  // Commented out: draw X-axis labels (exercise numbers)
  // ctx.fillStyle = '#00CC58';
  // ctx.font = '12px monospace';
  // data.forEach((_, i) => {
  //   const x = paddingLeft + i * stepX;
  //   ctx.fillText(i + 1, x - 6, height - 10);
  // });

  // Draw Y-axis max label
  ctx.fillText(maxY ? maxY : maxData.toFixed(0), 5, 20);
}


// Update charts with new data
function updateCharts(accuracy, timeSec) {
  accuracyHistory.push(accuracy);
  timeHistory.push(timeSec);

  // Save data after each completed exercise
  saveData();

  drawLineGraph(accuracyCtx, accuracyHistory, 'Accuracy (%) Over Exercises', 'Accuracy %', 100);
  drawLineGraph(timeCtx, timeHistory, 'Time (seconds) Per Exercise', 'Seconds');
}