import React, { useState ,useEffect, useRef } from 'react';

export default function ExerciseResults({ results, onNext, onBack }) {
  const chartRef = useRef(null);

  const [visible, setVisible] = useState(false);

  // results = { accuracy, timeTaken, totalNotes, correctNotes, wrongAttempts, notesPerMinute, accuracyOverTime }
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

    // Accuracy line
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
  }, [results]);

  const npm = results.notesPerMinute?.toFixed(0) || '—';
  const acc = results.accuracy?.toFixed(0) || '—';

  return (
    <div style={{
      background: '#00CC58',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Courier New, monospace',
      color: '#1a3d2b',
      padding: '40px 20px',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(20px)',
      transition: 'opacity 0.6s ease, transform 0.6s ease',
    }}>
      <div style={{ display: 'flex', gap: '60px', alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center' }}>
        
        {/* Left: big stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '140px' }}>
          <div>
            <div style={{ fontSize: '1.6rem', opacity: 0.7 }}>npm</div>
            <div style={{ fontSize: '5rem', fontWeight: 'bold', lineHeight: 1 }}>{npm}</div>
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', opacity: 0.7 }}>acc</div>
            <div style={{ fontSize: '5rem', fontWeight: 'bold', lineHeight: 1 }}>{acc}%</div>
          </div>
          <div style={{ marginTop: '14px', fontSize: '0.8rem', opacity: 0.7, lineHeight: 1.8 }}>
            <div>exercise type</div>
            <div>notes {results.totalNotes}</div>
            <div>{results.clef} clef</div>
          </div>
        </div>

        {/* Right: chart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <canvas
            ref={chartRef}
            width={1100}
            height={300}
            style={{ borderRadius: '10px' }}
          />
        </div>
      </div>

      {/* Bottom stats row */}
      <div style={{
        display: 'flex',
        gap: '120px',
        marginTop: '3px',
        marginLeft: '200px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        borderTop: '2px solid rgba(0,0,0,0.25)',
        paddingTop: '10px',
        width: '100%',
        maxWidth: '700px',
      }}>
        {[
          { label: 'correct', value: results.correctNotes },
          { label: 'wrong attempts', value: results.wrongAttempts },
          { label: 'time', value: `${results.timeTaken}s` },
          { label: 'notes/min', value: npm },
        ].map(({ label, value }) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{label}</div>
            <div style={{ fontSize: '1.9rem', fontWeight: 'bold' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
        <button onClick={onBack} style={{
          background: 'transparent',
          border: '2px solid #1a3d2b',
          color: '#1a3d2b',
          padding: '8px 20px',
          borderRadius: '15px',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          fontFamily: 'Courier New, monospace',
          transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.target.style.background = '#1a3d2b'; e.target.style.color = '#00CC58'; }}
          onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#1a3d2b'; }}
        >
          ← Home
        </button>
        <button onClick={onNext} style={{
          background: 'transparent',
          border: '2px solid #1a3d2b',
          color: '#1a3d2b',
          padding: '8px 20px',
          borderRadius: '15px',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          fontFamily: 'Courier New, monospace',
          transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.target.style.background = '#1a3d2b'; e.target.style.color = '#00CC58'; }}
          onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#1a3d2b'; }}
        >
          Next Exercise →
        </button>
      </div>
    </div>
  );
}