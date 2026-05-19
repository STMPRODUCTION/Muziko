import React, { useState, useEffect, useRef } from 'react';
import '../css/results.css';

export default function ExerciseResults({ results, onNext, onBack }) {
  const chartRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 50);
  }, []);

  useEffect(() => {
    const canvas = chartRef.current;
    if (!canvas || !results.accuracyOverTime?.length) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const pad = { top: 20, bottom: 30, left: 40, right: 20 };
    const data = results.accuracyOverTime;
    const maxY = 100;

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    [0, 25, 50, 75, 100].forEach(v => {
      const y = pad.top + (1 - v / maxY) * (H - pad.top - pad.bottom);
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(W - pad.right, y);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '10px Courier New';
      ctx.textAlign = 'right';
      ctx.fillText(v, pad.left - 4, y + 3);
    });

    // X axis labels
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '10px Courier New';
    ctx.textAlign = 'center';
    data.forEach((_, i) => {
      const x = pad.left + (i / (data.length - 1 || 1)) * (W - pad.left - pad.right);
      ctx.fillText(i + 1, x, H - 5);
    });

    // Smooth accuracy line
    ctx.beginPath();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    data.forEach((v, i) => {
      const x = pad.left + (i / (data.length - 1 || 1)) * (W - pad.left - pad.right);
      const y = pad.top + (1 - v / maxY) * (H - pad.top - pad.bottom);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        const prevX = pad.left + ((i - 1) / (data.length - 1 || 1)) * (W - pad.left - pad.right);
        const prevY = pad.top + (1 - data[i - 1] / maxY) * (H - pad.top - pad.bottom);
        const cpX = (prevX + x) / 2;
        ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
      }
    });
    ctx.stroke();

    // Dots
    data.forEach((v, i) => {
      const x = pad.left + (i / (data.length - 1 || 1)) * (W - pad.left - pad.right);
      const y = pad.top + (1 - v / maxY) * (H - pad.top - pad.bottom);
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    });
  }, [results]);

  const npm = results.notesPerMinute?.toFixed(0) || '—';
  const acc = results.accuracy?.toFixed(0) || '—';

  return (
    <div className={`results-wrapper${visible ? ' visible' : ''}`}>
      <div className="results-top">
        <div className="results-big-stats">
          <div>
            <div className="results-stat-label">npm</div>
            <div className="results-stat-value">{npm}</div>
          </div>
          <div>
            <div className="results-stat-label">acc</div>
            <div className="results-stat-value">{acc}%</div>
          </div>
          <div className="results-meta">
            <div>exercise type</div>
            <div>notes {results.totalNotes}</div>
            <div>{results.clef} clef</div>
          </div>
        </div>

        <div className="results-chart">
          <canvas ref={chartRef} width={1100} height={300} />
        </div>
      </div>

      <div className="results-bottom">
        {[
          { label: 'correct', value: results.correctNotes },
          { label: 'wrong attempts', value: results.wrongAttempts },
          { label: 'time', value: `${results.timeTaken}s` },
          { label: 'notes/min', value: npm },
        ].map(({ label, value }) => (
          <div key={label} className="results-bottom-stat">
            <div className="results-bottom-stat-label">{label}</div>
            <div className="results-bottom-stat-value">{value}</div>
          </div>
        ))}
      </div>

      <div className="results-actions">
        <button className="results-btn" onClick={onNext}>Next Exercise →</button>
      </div>
    </div>
  );
}