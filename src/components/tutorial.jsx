import React, { useEffect, useRef, useState } from 'react';
import { Renderer, Stave, StaveNote, Voice, Formatter } from 'vexflow';

const NOTES = [
  { midi: 60, label: 'C4', key: 'c/4', annotationKey: 'middle_c' },
  { midi: 62, label: 'D4', key: 'd/4', annotationKey: 'D' },
  { midi: 64, label: 'E4', key: 'e/4', annotationKey: 'E' },
  { midi: 65, label: 'F4', key: 'f/4', annotationKey: 'F' },
  { midi: 67, label: 'G4', key: 'g/4', annotationKey: 'G' },
  { midi: 69, label: 'A4', key: 'a/4', annotationKey: 'a_hz' },
  { midi: 71, label: 'B4', key: 'b/4', annotationKey: 'B' },
  { midi: 72, label: 'C5', key: 'c/5', annotationKey: 'c_octave_up' },
  { midi: 74, label: 'D5', key: 'd/5', annotationKey: 'D' },
  { midi: 76, label: 'E5', key: 'e/5', annotationKey: 'E' },
  { midi: 77, label: 'F5', key: 'f/5', annotationKey: 'F' },
];

const WHITE_MIDIS = [60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77];
const BLACK_KEYS = [
  { midi: 61, afterWhiteIndex: 0 },
  { midi: 63, afterWhiteIndex: 1 },
  { midi: 66, afterWhiteIndex: 3 },
  { midi: 68, afterWhiteIndex: 4 },
  { midi: 70, afterWhiteIndex: 5 },
  { midi: 73, afterWhiteIndex: 7 },
  { midi: 75, afterWhiteIndex: 8 },
];

const WHITE_KEY_W = 30;
const BLACK_KEY_W = 18;
const WHITE_KEY_H = 70;
const BLACK_KEY_H = 42;

function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

const translations = {
  en: {
    middle_c: 'Middle C',
    D: 'D',
    E: 'E',
    F: 'F',
    G: 'G',
    a_hz: 'A · 440Hz',
    B: 'B',
    c_octave_up: 'C (octave up)',
    hint: 'Try pressing the correct key on the piano below',
    p1: '<strong>Sheet music</strong> uses a staff — five horizontal lines — where each line and space represents a specific pitch. The higher a note sits on the staff, the higher it sounds.',
    p2: 'The <strong>treble clef</strong> (the curly symbol) anchors the staff: the second line from the bottom is always G4. From there, notes go up: A, B, C... and down: F, E, D. Notes can also sit on <em>ledger lines</em> — short extra lines above or below the staff — like middle C (C4) which sits just below.',
    p3: 'Each note name runs <strong>A through G</strong>, then repeats in the next octave. The number tells you which octave: C4 is middle C, C5 is one octave higher. The animation above cycles C4 → F5 — watch the note climb the staff as the pitch rises, and listen for the pitch matching the highlighted piano key.'
  },
  es: {
    middle_c: 'Do central',
    D: 'Re',
    E: 'Mi',
    F: 'Fa',
    G: 'Sol',
    a_hz: 'La · 440Hz',
    B: 'Si',
    c_octave_up: 'Do (octava superior)',
    hint: 'Intenta presionar la tecla correcta en el piano de abajo',
    p1: 'La <strong>partitura</strong> utiliza un pentagrama (cinco líneas horizontales) donde cada línea y espacio representa una altura específica. Cuanto más alta esté una nota en el pentagrama, más agudo será su sonido.',
    p2: 'La <strong>clave de sol</strong> (el símbolo rizado) ancla el pentagrama: la segunda línea desde abajo es siempre Sol4 (G4). Desde allí, las notas suben: La, Si, Do... y bajan: Fa, Mi, Re. Las notas también pueden situarse en <em>líneas adicionales</em> (pequeñas líneas extra por encima o por debajo del pentagrama) como el Do central (C4), que se sitúa justo debajo.',
    p3: 'Cada nombre de nota va de <strong>La a Sol (A a G)</strong> y luego se repite en la siguiente octava. El número indica la octava: C4 es el Do central, C5 es una octava más alta. La animación de arriba va de C4 a F5: observa cómo la nota sube por el pentagrama a medida que aumenta la altura y escucha cómo el tono coincide con la tecla del piano iluminada.'
  },
  fr: {
    middle_c: 'Do central',
    D: 'Ré',
    E: 'Mi',
    F: 'Fa',
    G: 'Sol',
    a_hz: 'La · 440Hz',
    B: 'Si',
    c_octave_up: 'Do (octave supérieure)',
    hint: "Essayez d'appuyer sur la bonne touche du piano ci-dessous",
    p1: 'La <strong>musique sur partition</strong> utilise une portée — cinq lignes horizontales — où chaque ligne et chaque espace représentent une hauteur spécifique. Plus une note est placée haut sur la portée, plus elle est aiguë.',
    p2: 'La <strong>clé de sol</strong> (le symbole bouclé) ancre la portée : la deuxième ligne en partant du bas est toujours Sol4 (G4). À partir de là, les notes montent : La, Si, Do... et descendent : Fa, Mi, Ré. Les notes peuvent également se placer sur des <em>lignes supplémentaires</em> — de petites lignes d\'extension au-dessus ou au-dessous de la portée — comme le Do central (C4) qui se trouve juste en dessous.',
    p3: 'Chaque nom de note va de <strong>A à G</strong>, puis se répète à l\'octave suivante. Le numéro indique l\'octave : C4 est le Do central, C5 est une octave plus haut. L\'animation ci-dessus cycle de C4 à F5 — observez la note monter sur la portée à mesure que la hauteur augmente, et écoutez le son correspondre à la touche de piano mise en évidence.'
  },
  de: {
    middle_c: 'Eingestrichenes C (C4)',
    D: 'D',
    E: 'E',
    F: 'F',
    G: 'G',
    a_hz: 'A · 440Hz',
    B: 'H',
    c_octave_up: 'C (eine Oktave höher)',
    hint: 'Versuche, die richtige Taste auf dem Klavier unten zu drücken',
    p1: '<strong>Notenschrift</strong> verwendet ein Liniensystem — fünf horizontale Linien —, bei dem jede Linie und jeder Zwischenraum eine bestimmte Tonhöhe darstellt. Je höher eine Note im Liniensystem steht, desto höher klingt sie.',
    p2: 'Der <strong>Violinschlüssel</strong> (das geschwungene Symbol) verankert das Liniensystem: Die zweite Linie von unten ist immer G4. Von dort aus gehen die Noten nach oben: A, B, C... und nach unten: F, E, D. Noten können auch auf <em>Hilfslinien</em> stehen — kurzen Zusatzlinien oberhalb oder unterhalb des Liniensystems —, wie das eingestrichene C (C4), das sich direkt darunter befindet.',
    p3: 'Jeder Notenname läuft von <strong>A bis G</strong> und wiederholt sich dann in der nächsten Oktave. Die Zahl gibt die Oktave an: C4 ist das mittlere C, C5 ist eine Oktave höher. Die obige Animation läuft von C4 → F5 — beobachte, wie die Note im Liniensystem nach oben klettert, während die Tonhöhe steigt, und höre, wie der Ton mit der markierten Klaviertaste übereinstimmt.'
  },
  it: {
    middle_c: 'Do centrale',
    D: 'Re',
    E: 'Mi',
    F: 'Fa',
    G: 'Sol',
    a_hz: 'La · 440Hz',
    B: 'Si',
    c_octave_up: 'Do (ottava superiore)',
    hint: 'Prova a premere il tasto corretto sul pianoforte qui sotto',
    p1: "Lo <strong>spartito</strong> utilizza un pentagramma — cinque linee orizzontali — in cui ogni linea e spazio rappresenta un'altezza specifica. Più una nota è posizionata in alto sul pentagramma, più il suo suono è acuto.",
    p2: 'La <strong>chiave di violino</strong> (il simbolo arricciato) ancora il pentagramma: la segunda linea dal basso è sempre Sol4 (G4). Da lì, le note salgono: La, Si, Do... e scendono: Fa, Mi, Re. Le note possono anche trovarsi su <em>tagli addizionali</em> — brevi linee extra sopra o sotto il pentagramma — come il Do centrale (C4) che si trova appena sotto.',
    p3: "Ogni nome di nota va da <strong>A a G</strong>, poi si ripete nell'ottava successiva. Il numero indica l'ottava: C4 è il Do centrale, C5 è un'ottava sopra. L'animazione sopra cicla da C4 a F5 — guarda la nota salire sul pentagramma mentre l'altezza cresce e ascolta il suono che corrisponde al tasto evidenziato del pianoforte."
  },
  pt: {
    middle_c: 'Dó central',
    D: 'Ré',
    E: 'Mi',
    F: 'Fá',
    G: 'Sol',
    a_hz: 'Lá · 440Hz',
    B: 'Si',
    c_octave_up: 'Dó (oitava acima)',
    hint: 'Tente pressionar a tecla correta no piano abaixo',
    p1: 'As <strong>partituras</strong> usam uma pauta — cinco linhas horizontais — onde cada linha e espaço representa uma altura específica. Quanto mais alta a nota estiver na pauta, mais agudo será o som.',
    p2: 'A <strong>clave de sol</strong> (o símbolo encaracolado) ancora a pauta: a segunda linha de baixo para cima é sempre Sol4 (G4). A partir daí, as notas sobem: Lá, Si, Dó... e descem: Fá, Mi, Ré. As notas também podem ficar em <em>linhas suplementares</em> — pequenas linhas extras acima ou abaixo da pauta — como o Dó central (C4), que fica logo abaixo.',
    p3: 'Cada nome de nota vai de <strong>A a G</strong>, e depois repete-se na próxima oitava. O número indica a oitava: C4 é o Dó central, C5 é uma oitava acima. A animação acima alterna de C4 → F5 — veja a nota subir na pauta à medida que o tom aumenta e ouça o som correspondente à tecla de piano destacada.'
  },
  pl: {
    middle_c: 'C środkowe',
    D: 'D',
    E: 'E',
    F: 'F',
    G: 'G',
    a_hz: 'A · 440Hz',
    B: 'H',
    c_octave_up: 'C (oktawa wyżej)',
    hint: 'Spróbuj nacisnąć odpowiedni klawisz na pianinie poniżej',
    p1: '<strong>Nutowe pismo</strong> wykorzystuje pięciolinię — pięć poziomych linii — gdzie każda linia i pole reprezentuje określoną wysokość dźwięku. Im wyżej nota znajduje się na pięciolinii, tym wyższy jest jej dźwięk.',
    p2: '<strong>Klucz wiolinowy</strong> (zakręcony symbol) wyznacza punkt odniesienia na pięciolinii: druga linia od dołu to zawsze G4. Od tego miejsca nuty idą w górę: A, B, C... i w dół: F, E, D. Nuty mogą również znajdować się na <em>liniach dodanych</em> — krótkich dodatkowych liniach nad lub pod pięciolinią — tak jak C środkowe (C4), które znajduje się tuż pod nią.',
    p3: 'Nazwa każdej nuty mieści się w przedziale od <strong>A do G</strong>, a następnie powtarza się w kolejnej oktawie. Liczba oznacza oktawę: C4 to C środkowe, C5 to jedna oktawa wyżej. Powyższa animacja krąży w pętli od C4 do F5 — obserwuj, jak nuta wspina się po pięciolinii wraz ze wzrostem wysokości dźwięku i słuchaj, jak dźwięk pasuje do podświetlonego klawisza pianina.'
  },
  ro: {
    middle_c: 'Do central',
    D: 'Re',
    E: 'Mi',
    F: 'Fa',
    G: 'Sol',
    a_hz: 'La · 440Hz',
    B: 'Si',
    c_octave_up: 'Do (octavă mai sus)',
    hint: 'Încearcă să apeși tasta corectă pe pianul de mai jos',
    p1: '<strong>Partitura</strong> folosește un portativ — cinci linii orizontale — unde fiecare linie și spațiu reprezintă o înălțime specifică de sunet. Cu cât o notă este mai sus pe portativ, cu atât sună mai ascuțit (mai sus).',
    p2: '<strong>Cheia de sol</strong> (simbolul ondulat) fixează portativul: a doua linie de jos este întotdeauna Sol4 (G4). De acolo, notele urcă: La, Si, Do... și coboară: Fa, Mi, Re. Notele pot sta și pe <em>linii suplimentare</em> — linii scurte adăugate deasupra sau dedesubtul portativului — cum ar fi Do central (C4), care se află chiar dedesubt.',
    p3: 'Fiecare nume de notă merge de la <strong>A la G</strong>, apoi se repetă în următoarea octavă. Numărul indică octava: C4 este Do central, C5 este cu o octavă mai sus. Animația de mai sus rulează de la C4 → F5 — privește nota cum urcă pe portativ pe măsură ce înălțimea sunetului crește și ascultă cum sunetul se potrivește cu tasta de pian evidențiată.'
  },
  hu: {
    middle_c: 'Egyvonalas C',
    D: 'D',
    E: 'E',
    F: 'F',
    G: 'G',
    a_hz: 'A · 440Hz',
    B: 'H',
    c_octave_up: 'C (egy oktávval feljebb)',
    hint: 'Próbáld meg lenyomni a helyes billentyűt az alábbi zongorán',
    p1: 'A <strong>kotta</strong> vonalrendszert — öt vízszintes vonalat — használ, ahol minden vonal és vonalköz egy-egy konkrét hangmagasságot jelöl. Minél feljebb helyezkedik el egy hang a vonalrendszerben, annál magasabban szól.',
    p2: 'A <strong>violinkulcs</strong> (a kunkori szimbólum) rögzíti a vonalrendszert: alulról a második vonal mindig a G4 hang. Innentől a hangok felfelé haladnak: A, B, C... und lefelé: F, E, D. A hangok elhelyezkedhetnek <em>pótvonalakon</em> is — rövid kiegészítő vonalakon a vonalrendszer alatt vagy felett —, mint például az egyvonalas C (C4), amely közvetlenül alatta található.',
    p3: 'Minden hangnév az <strong>A-tól G-ig</strong> tartó skálát követi, majd ismétlődirs a következő oktávban. A szám az oktávot jelzi: a C4 az egyvonalas C, a C5 egy oktávval magasabb. A fenti animáció a C4 → F5 tartományban mozog — figyeld, ahogy a hang felfelé halad a vonalrendszerben a hangmagasság növekedésével, és halld, ahogy a hang megegyezik a kiemelt zongorabillentyűvel.'
  },
  ru: {
    middle_c: 'До первой октавы',
    D: 'Ре',
    E: 'Ми',
    F: 'Фа',
    G: 'Соль',
    a_hz: 'Ля · 440 Гц',
    B: 'Си',
    c_octave_up: 'До (на октаву выше)',
    hint: 'Попробуйте нажать правильную клавишу на пианино ниже',
    p1: '<strong>Ноты</strong> записываются на нотном стане — пяти горизонтальных линиях, где каждая линия и промежуток обозначают определённую высоту звука. Чем выше нота расположена на нотном стане, тем выше она звучит.',
    p2: '<strong>Скрипичный ключ</strong> (завитой символ) привязывает нотный стан: вторая линия снизу — это всегда Соль первой октавы (G4). Отсюда ноты идут вверх: Ля, Си, До... и вниз: Фа, Ми, Ре. Ноты также могут располагаться на <em>добавочных линейках</em> — коротких линиях выше или ниже нотного стана — например, До первой октавы (C4), которая находится прямо под ним.',
    p3: 'Каждое название ноты идёт от <strong>A до G</strong>, а затем повторяется в следующей октаве. Цифра указывает на октаву: C4 — это До первой октавы, C5 — на октаву выше. Анимация выше циклически переходит от C4 к F5 — следите за тем, как нота поднимается по нотному стану по мере роста высоты звука, и слушайте, как звук совпадает с подсвеченной клавишей пианино.'
  }
};

export default function NotesTutorial({ currentLang = 'en' }) {
  const t = (key) => translations[currentLang]?.[key] || translations['en'][key];

  const staffContainerRef = useRef(null);
  const notesContainerRef = useRef(null);
  const audioCtxRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [pressedMidi, setPressedMidi] = useState(null);
  const [noteColor, setNoteColor] = useState('black');
  const autoPlayingRef = useRef(false);

  const getAudio = () => {
    if (!audioCtxRef.current)
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtxRef.current;
  };

  const playMidi = (midi, duration = 0.6) => {
    const ctx = getAudio();
    const freq = midiToFreq(midi);
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc2.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc2.frequency.setValueAtTime(freq * 2, ctx.currentTime);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain); osc2.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime); osc2.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration); osc2.stop(ctx.currentTime + duration);
  };

  // Auto-cycle
  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setNoteColor('black');
      setTimeout(() => {
        setCurrentIndex(i => {
          const next = (i + 1) % NOTES.length;
          autoPlayingRef.current = true;
          setPressedMidi(NOTES[next].midi);
          setTimeout(() => {
            setPressedMidi(null);
            autoPlayingRef.current = false;
          }, 600);
          return next;
        });
        setFade(true);
      }, 400);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  // 1. Initialize permanent background elements (Staff & Clef)
  useEffect(() => {
    if (!staffContainerRef.current) return;
    const div = staffContainerRef.current;
    div.innerHTML = ''; 

    const renderer = new Renderer(div, Renderer.Backends.SVG);
    renderer.resize(280, 130);
    const ctx = renderer.getContext();
    const svg = div.querySelector('svg');
    if (svg) svg.style.background = 'transparent';

    const stave = new Stave(10, 15, 250);
    stave.addClef('treble');
    stave.setContext(ctx).draw();
  }, []);

  // 2. Redraw ONLY the specific active note with a leftward shift adjustment
  useEffect(() => {
    if (!notesContainerRef.current) return;
    const div = notesContainerRef.current;
    div.innerHTML = ''; 

    const renderer = new Renderer(div, Renderer.Backends.SVG);
    renderer.resize(280, 130);
    const ctx = renderer.getContext();
    const svg = div.querySelector('svg');
    if (svg) svg.style.background = 'transparent';

    const stave = new Stave(10, 15, 250);

    const note = NOTES[currentIndex];
    const vfNote = new StaveNote({ keys: [note.key], duration: 'q', clef: 'treble' });

    vfNote.setXShift(60);

    const color = noteColor === 'green' ? '#00CC58' : noteColor === 'red' ? '#ff4444' : '#222222';
    vfNote.setStyle({ fillStyle: color, strokeStyle: color });

    const voice = new Voice({ num_beats: 1, beat_value: 4 }).setStrict(false);
    voice.addTickables([vfNote]);
    
    new Formatter().joinVoices([voice]).format([voice], 10);
    voice.draw(ctx, stave);
  }, [currentIndex, noteColor]);

  // Handle player pressing a key manually
  const handlePlayerPress = (midi) => {
    if (autoPlayingRef.current) return; 
    playMidi(midi, 0.5);
    setPressedMidi(midi);
    const correctMidi = NOTES[currentIndex].midi;
    if (midi === correctMidi) {
      setNoteColor('green');
    } else {
      setNoteColor('red');
    }
    setTimeout(() => {
      setPressedMidi(null);
      setNoteColor('black');
    }, 700);
  };

  const totalWhiteWidth = WHITE_MIDIS.length * WHITE_KEY_W;

  return (
    <div style={{
      width: '100%',
      maxWidth: '700px',
      margin: '48px auto 0',
      fontFamily: 'Courier New, monospace',
      color: 'var(--accent1, #00CC58)',
      padding: '1px',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.85)',
        borderRadius: '14px',
        padding: '28px 24px 20px',
        marginBottom: '24px',
      }}>

        {/* Note label + localized annotation */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '4px',
          opacity: fade ? 1 : 0,
          transition: 'opacity 0.4s ease',
          minHeight: '52px',
        }}>
          <div style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            letterSpacing: '3px',
            color: noteColor === 'green' ? '#00CC58' : noteColor === 'red' ? '#ff4444' : 'var(--bg, #00CC58)',
            transition: 'color 0.2s ease',
          }}>
            {NOTES[currentIndex].label}
          </div>
          <div style={{ fontSize: '0.75rem', opacity: 0.6, letterSpacing: '1px', color: '#444' }}>
            {t(NOTES[currentIndex].annotationKey)}
          </div>
        </div>

        {/* Stacked Canvas Containers for Staff Stability & Smooth Note Fading */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          position: 'relative',
          height: '130px',
          width: '280px',
          margin: '0 auto',
        }}>
          {/* Layer 1: Persistent Staff Structure */}
          <div ref={staffContainerRef} style={{ position: 'absolute', inset: 0, zIndex: 1 }} />
          
          {/* Layer 2: Independent Note Overlay with Fade Effect */}
          <div 
            ref={notesContainerRef} 
            style={{ 
              position: 'absolute', 
              inset: 0, 
              zIndex: 2,
              opacity: fade ? 1 : 0,
              transition: 'opacity 0.4s ease',
            }} 
          />
        </div>

        {/* Localized Hint text */}
        <div style={{
          textAlign: 'center',
          fontSize: '0.72rem',
          color: '#888',
          marginTop: '4px',
          marginBottom: '8px',
          letterSpacing: '0.5px',
        }}>
          {t('hint')}
        </div>

        {/* Mini Piano */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
          <div style={{
            position: 'relative',
            width: `${totalWhiteWidth}px`,
            height: `${WHITE_KEY_H}px`,
          }}>
            {/* White keys */}
            {WHITE_MIDIS.map((midi, i) => {
              const isAutoPressed = pressedMidi === midi && autoPlayingRef.current;
              const isPlayerPressed = pressedMidi === midi && !autoPlayingRef.current;
              const isCurrentNote = NOTES[currentIndex].midi === midi;
              return (
                <div
                  key={midi}
                  onMouseDown={() => handlePlayerPress(midi)}
                  onMouseUp={() => setPressedMidi(null)}
                  onMouseLeave={() => setPressedMidi(null)}
                  style={{
                    position: 'absolute',
                    left: `${i * WHITE_KEY_W}px`,
                    top: 0,
                    width: `${WHITE_KEY_W - 1}px`,
                    height: `${WHITE_KEY_H}px`,
                    background: isAutoPressed
                      ? '#00CC58'
                      : isPlayerPressed
                        ? (midi === NOTES[currentIndex].midi ? '#00CC58' : '#ff4444')
                        : isCurrentNote
                          ? 'rgba(0,204,88,0.1)'
                          : '#ffffff',
                    border: isCurrentNote ? '1px solid rgba(0,204,88,0.4)' : '1px solid #ccc',
                    borderRadius: '0 0 4px 4px',
                    cursor: 'pointer',
                    zIndex: 1,
                    transition: 'background 0.15s',
                    boxSizing: 'border-box',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    paddingBottom: '4px',
                  }}
                >
                  <span style={{
                    fontSize: '8px',
                    color: isAutoPressed || isPlayerPressed ? '#fff' : '#aaa',
                    pointerEvents: 'none',
                  }}>
                    {isCurrentNote ? NOTES[currentIndex].label : ''}
                  </span>
                </div>
              );
            })}

            {/* Black keys */}
            {BLACK_KEYS.map(({ midi, afterWhiteIndex }) => {
              const isAutoPressed = pressedMidi === midi && autoPlayingRef.current;
              const isPlayerPressed = pressedMidi === midi && !autoPlayingRef.current;
              const leftPos = (afterWhiteIndex + 1) * WHITE_KEY_W - BLACK_KEY_W / 2 - 1;
              return (
                <div
                  key={midi}
                  onMouseDown={e => { e.stopPropagation(); handlePlayerPress(midi); }}
                  onMouseUp={e => { e.stopPropagation(); setPressedMidi(null); }}
                  onMouseLeave={e => { e.stopPropagation(); setPressedMidi(null); }}
                  style={{
                    position: 'absolute',
                    left: `${leftPos}px`,
                    top: 0,
                    width: `${BLACK_KEY_W}px`,
                    height: `${BLACK_KEY_H}px`,
                    background: isAutoPressed
                      ? '#00CC58'
                      : isPlayerPressed
                        ? (midi === NOTES[currentIndex].midi ? '#00CC58' : '#ff4444')
                        : '#222',
                    borderRadius: '0 0 3px 3px',
                    cursor: 'pointer',
                    zIndex: 2,
                    transition: 'background 0.15s',
                    boxShadow: '0 3px 6px rgba(0,0,0,0.4)',
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '18px' }}>
          {NOTES.map((_, i) => (
            <div
              key={i}
              onClick={() => {
                setCurrentIndex(i);
                setNoteColor('black');
                setFade(true);
                playMidi(NOTES[i].midi);
                autoPlayingRef.current = true;
                setPressedMidi(NOTES[i].midi);
                setTimeout(() => { setPressedMidi(null); autoPlayingRef.current = false; }, 600);
              }}
              style={{
                width: i === currentIndex ? '18px' : '6px',
                height: '6px',
                borderRadius: '3px',
                background: 'var(--accent1, #00CC58)',
                opacity: i === currentIndex ? 1 : 0.3,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
      </div>

      {/* Localized Explanation Paragraphs */}
      <div style={{ fontSize: '1rem', lineHeight: '2', opacity: 1, textAlign: 'center', padding: '0 4px' }}>
        <p style={{ margin: '0 0 10px' }} dangerouslySetInnerHTML={{ __html: t('p1') }} />
        <p style={{ margin: '0 0 10px' }} dangerouslySetInnerHTML={{ __html: t('p2') }} />
        <p style={{ margin: 0, padding: '0 0 140px 4px' }} dangerouslySetInnerHTML={{ __html: t('p3') }} />
      </div>
    </div>
  );
}