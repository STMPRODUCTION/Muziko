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
  highlightVirtualKey(note, false);
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

  const accuracyTitle = translations[currentLanguage]['accuracy_chart_title'] || 'Accuracy Over Exercises';
  const timeTitle = translations[currentLanguage]['time_chart_title'] || 'Time  Per Exercise';
  const accuracyLabel = translations[currentLanguage]['accuracy_y_label'] || 'Accuracy %';
  const timeLabel = translations[currentLanguage]['time_y_label'] || 'Seconds';

  drawLineGraph(accuracyCtx, accuracyHistory, accuracyTitle, accuracyLabel, 100);
  drawLineGraph(timeCtx, timeHistory, timeTitle, timeLabel);
};
// Function to draw a simple line graph with better spacing
function drawLineGraph(ctx, data, label, yLabel, maxY) {
  // Get device pixel ratio for high DPI displays
  const dpr = window.devicePixelRatio || 1;
  const rect = ctx.canvas.getBoundingClientRect();
  
  // Set actual canvas size in memory (scaled for high DPI)
  ctx.canvas.width = rect.width * dpr;
  ctx.canvas.height = rect.height * dpr;
  
  // Scale the drawing context so everything draws at correct size
  ctx.scale(dpr, dpr);
  
  // Use the CSS size for calculations
  const width = rect.width;
  const height = rect.height;
  
  ctx.clearRect(0, 0, width, height);

  // Increased padding for better spacing (adjust based on canvas size)
  const paddingLeft = Math.max(50, width * 0.2);   // 20% of width or minimum 50px
  const paddingRight = Math.max(15, width * 0.05); // 5% of width or minimum 15px
  const paddingTop = Math.max(30, height * 0.15);  // 15% of height or minimum 30px
  const paddingBottom = Math.max(40, height * 0.2); // 20% of height or minimum 40px

  // Draw axes with better positioning
  ctx.strokeStyle = '#00CC58';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(paddingLeft, paddingTop);
  ctx.lineTo(paddingLeft, height - paddingBottom);
  ctx.lineTo(width - paddingRight, height - paddingBottom);
  ctx.stroke();

  // Main title with responsive font size
  const titleFontSize = Math.max(12, Math.min(16, width / 20)); // Scale with width, min 12px, max 16px
  ctx.font = `bold ${titleFontSize}px "Courier New", monospace`;
  ctx.fillStyle = '#00CC58';
  ctx.textAlign = 'center';
  ctx.fillText(label, width / 2, paddingTop - 10);  // Position relative to padding

  // Y-axis label (rotated) with better positioning
  ctx.save();
  ctx.translate(15, height / 2);  // More space from edge
  ctx.rotate(-Math.PI / 2);
  ctx.font = '14px "Courier New", monospace';  
  ctx.textAlign = 'center';
  ctx.fillText(yLabel, 0, 0);
  ctx.restore();

  // Reset text alignment for other text
  ctx.textAlign = 'left';

  if (data.length === 0) {
    // Center the "no data" message with responsive font
    const noDataFontSize = Math.max(10, Math.min(14, width / 25));
    ctx.font = `${noDataFontSize}px "Courier New", monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('No data available', width / 2, height / 2);
    ctx.textAlign = 'left';
    return;
  }

  // Calculate graph dimensions with new padding
  const graphWidth = width - paddingLeft - paddingRight;
  const graphHeight = height - paddingTop - paddingBottom;
  
  // Draw smooth line
  const maxData = maxY || Math.max(...data) * 1.1;
  const stepX = data.length > 1 ? graphWidth / (data.length - 1) : graphWidth;

  if (data.length > 0) {
    ctx.strokeStyle = '#00CC58';
    ctx.lineWidth = 3;  // Slightly thicker for smoother appearance
    ctx.lineCap = 'round';  // Rounded line ends
    ctx.lineJoin = 'round';  // Rounded line joins
    
    // Enable anti-aliasing for smoother lines
    ctx.imageSmoothingEnabled = true;
    
    ctx.beginPath();
    
    if (data.length === 1) {
      // Single point - draw a small circle instead of line
      const x = paddingLeft;
      const y = height - paddingBottom - (data[0] / maxData) * graphHeight;
      ctx.arc(x, y, 2, 0, 2 * Math.PI);
      ctx.fillStyle = '#00CC58';
      ctx.fill();
    } else if (data.length === 2) {
      // Two points - simple line
      const x1 = paddingLeft;
      const y1 = height - paddingBottom - (data[0] / maxData) * graphHeight;
      const x2 = paddingLeft + stepX;
      const y2 = height - paddingBottom - (data[1] / maxData) * graphHeight;
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
    } else {
      // Multiple points - smooth curve using quadratic curves
      const points = data.map((val, i) => ({
        x: paddingLeft + i * stepX,
        y: height - paddingBottom - (val / maxData) * graphHeight
      }));
      
      ctx.moveTo(points[0].x, points[0].y);
      
      for (let i = 1; i < points.length - 1; i++) {
        const cpx = (points[i].x + points[i + 1].x) / 2;
        const cpy = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, cpx, cpy);
      }
      
      // Connect to the last point
      ctx.quadraticCurveTo(
        points[points.length - 1].x, 
        points[points.length - 1].y, 
        points[points.length - 1].x, 
        points[points.length - 1].y
      );
    }
    
    ctx.stroke();
  }

  // Y-axis labels with responsive font size
  const axisLabelFontSize = Math.max(8, Math.min(12, width / 30)); // Scale with width
  ctx.font = `${axisLabelFontSize}px "Courier New", monospace`;
  ctx.textAlign = 'right';
  
  // Draw multiple Y-axis labels for better reference
  const numYLabels = 5;
  for (let i = 0; i <= numYLabels; i++) {
    const value = (maxData * i) / numYLabels;
    const y = height - paddingBottom - (i / numYLabels) * graphHeight;
    ctx.fillText(value.toFixed(1), paddingLeft - 8, y + 4);
  }

  // X-axis labels (exercise numbers) with responsive spacing
  ctx.textAlign = 'center';
  const maxLabelsToShow = Math.floor(graphWidth / 30); // Show labels based on available space
  
  if (data.length <= maxLabelsToShow) {  
    // Show all labels if there's space
    data.forEach((_, i) => {
      const x = paddingLeft + i * stepX;
      ctx.fillText((i + 1).toString(), x, height - paddingBottom + 18);
    });
  } else {
    // Show every nth label for crowded data
    const step = Math.ceil(data.length / maxLabelsToShow);
    data.forEach((_, i) => {
      if (i % step === 0 || i === data.length - 1) {
        const x = paddingLeft + i * stepX;
        ctx.fillText((i + 1).toString(), x, height - paddingBottom + 18);
      }
    });
  }

  // X-axis title with responsive font
  const xTitleFontSize = Math.max(8, Math.min(12, width / 30));
  ctx.font = `${xTitleFontSize}px "Courier New", monospace`;
  ctx.fillText('Exercise #', width / 2, height - 8);
  
  // Reset text alignment
  ctx.textAlign = 'left';
}


// Update charts with new data
function updateCharts(accuracy, timeSec) {
  accuracyHistory.push(accuracy);
  timeHistory.push(timeSec);

  // Save data after each completed exercise
  saveData();

  drawLineGraph(accuracyCtx, accuracyHistory, 'Accuracy Over Exercises', 'Accuracy     ', 100);
  drawLineGraph(timeCtx, timeHistory, 'Time (seconds) Per Exercise', 'Seconds');
}