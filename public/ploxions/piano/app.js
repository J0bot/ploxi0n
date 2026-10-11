
(function(){
    'use strict';
    var ID = 'piano';

    /* ── note data ─────────────────────────────────────────────── */
    // C D E F G A B = white ; C# D# F# G# A# = black
    // We build 2 full octaves: C3→B4 (14 white keys + 10 black keys)
    var WHITE = ['C','D','E','F','G','A','B'];
    var HAS_BLACK = {C:1,D:1,F:1,G:1,A:1}; // no black after E and B

    // Compute frequency from MIDI note number
    function midiToHz(m){ return 440 * Math.pow(2,(m-69)/12); }

    // Build note list for N octaves starting at octave `startOct`
    // Returns [{note, octave, midi, isBlack, label}]
    function buildNotes(startOct, numOct){
        var semis = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
        var notes = [];
        for(var o = startOct; o < startOct + numOct; o++){
            for(var s = 0; s < 12; s++){
                var name = semis[s];
                var midi = (o + 1) * 12 + s; // MIDI: C4=60
                notes.push({note:name, octave:o, midi:midi, isBlack:name.indexOf('#')>=0, label:name+o});
            }
        }
        return notes;
    }

    /* ── AZERTY keyboard mapping ─────────────────────────────── */
    // Row 1 (upper): a z e r t y u i o p (→ white keys C3..B3 + C4 D4)
    // Row 2 (home) : q s d f g h j k l m (→ white keys E4..B4 and some overlap)
    // Black keys on shift equivalents: & é " ' ( - è _ ç à
    // Simpler approach: map physical keys to notes by index
    // Lower row = white keys of octave 3; upper row = white keys of octave 4
    // Black keys on row above: é=C#3, "=D#3, '=F#3, (=G#3, -=A#3
    //                          z(shift)=C#4, e(shift)→ etc. we map ² 1 3 4 5 6 7 ...
    // Practical AZERTY white mapping:
    //  q=C3 s=D3 d=E3 f=F3 g=G3 h=A3 j=B3  k=C4 l=D4 m=E4
    //  a=F4 z=G4 e=A4 r=B4
    // Black:
    //  &=C#3 é=D#3 "=F#3 '=G#3 (=A#3   [no shift needed, these are unshifted AZERTY]
    //  °=C#4 _=D#4 ç=F#4 à=G#4 )=A#4  (position keys above home row)
    // We'll use a simpler set that works regardless of OS layout:
    // Physical key codes (KeyX) rather than key values for robustness
    var KEY_TO_NOTE = {
        // White keys — octave 3 (home row, left)
        'KeyQ':'C3','KeyS':'D3','KeyD':'E3','KeyF':'F3','KeyG':'G3','KeyH':'A3','KeyJ':'B3',
        // White keys — octave 4 (home row, right + upper)
        'KeyK':'C4','KeyL':'D4','KeyM':'E4','KeyA':'F4','KeyZ':'G4','KeyE':'A4','KeyR':'B4',
        // Black keys — octave 3 (number row equivalents, AZERTY: & é " ' ( )
        'Digit2':'C#3','Digit3':'D#3','Digit5':'F#3','Digit6':'G#3','Digit7':'A#3',
        // Black keys — octave 4
        'Digit9':'C#4','Digit0':'D#4','Minus':'F#4','Equal':'G#4',
        'BracketRight':'A#4'
    };
    // Display label for key hint on key face
    var CODE_LABEL = {
        'KeyQ':'Q','KeyS':'S','KeyD':'D','KeyF':'F','KeyG':'G','KeyH':'H','KeyJ':'J',
        'KeyK':'K','KeyL':'L','KeyM':'M','KeyA':'A','KeyZ':'Z','KeyE':'E','KeyR':'R',
        'Digit2':'2','Digit3':'3','Digit5':'5','Digit6':'6','Digit7':'7',
        'Digit9':'9','Digit0':'0','Minus':'-','Equal':'=','BracketRight':']'
    };
    // Reverse: note label → key display
    var NOTE_KEY_LABEL = {};
    Object.keys(KEY_TO_NOTE).forEach(function(code){
        NOTE_KEY_LABEL[KEY_TO_NOTE[code]] = CODE_LABEL[code];
    });

    /* ── ADSR engine ──────────────────────────────────────────── */
    // ac   : AudioContext (created on first gesture)
    // voices: Map noteLabel → {osc, gain, ac}

    function mount(container, ctx){
        var ac = null;
        var voices = {};
        var waveform = 'sine';
        var masterVol = 0.55;
        var pressedKeys = {}; // code → noteLabel (for keyup)

        function ensureAC(){
            if(!ac || ac.state === 'closed'){
                ac = new (window.AudioContext||window.webkitAudioContext)();
            }
            if(ac.state === 'suspended') ac.resume();
            return ac;
        }

        function noteOn(label, midi){
            if(voices[label]) return; // already playing
            var a = ensureAC();
            var hz = midiToHz(midi);

            var osc = a.createOscillator();
            var gainNode = a.createGain();
            osc.type = waveform;
            osc.frequency.value = hz;

            // ADSR: attack 0.008s, decay 0.12s, sustain 0.65, release handled in noteOff
            gainNode.gain.setValueAtTime(0, a.currentTime);
            gainNode.gain.linearRampToValueAtTime(masterVol, a.currentTime + 0.008);
            gainNode.gain.linearRampToValueAtTime(masterVol * 0.65, a.currentTime + 0.008 + 0.12);

            osc.connect(gainNode);
            gainNode.connect(a.destination);
            osc.start();
            voices[label] = {osc:osc, gain:gainNode};
        }

        function noteOff(label){
            var v = voices[label];
            if(!v) return;
            var a = ac;
            var g = v.gain;
            var t = a.currentTime;
            // release 0.18s
            g.gain.cancelScheduledValues(t);
            g.gain.setValueAtTime(g.gain.value, t);
            g.gain.linearRampToValueAtTime(0, t + 0.18);
            var osc = v.osc;
            osc.stop(t + 0.19);
            delete voices[label];
        }

        /* ── Build DOM ──────────────────────────────────────── */
        // Notes: C3..B4 = 2 octaves
        var allNotes = buildNotes(3, 2);
        // Separate white and black
        var whites = allNotes.filter(function(n){ return !n.isBlack; });
        var blacks = allNotes.filter(function(n){ return n.isBlack; });

        // Build HTML
        // We lay out white keys in a flex row; black keys are absolute-positioned
        // relative to a wrapper. We need to compute left offsets for black keys.

        // Map note label → position
        var whiteIndex = {};
        whites.forEach(function(n,i){ whiteIndex[n.label] = i; });
        var WHITE_W = 40; // px (key width + gap)
        var BLACK_OFF = { 'C#': 25, 'D#': 65, 'F#': 145, 'G#': 185, 'A#': 225 };
        // Absolute offset per octave slot (0-based white key index within octave)
        // White key order in octave: C D E F G A B = indices 0..6
        // Black keys sit between: C-D, D-E, F-G, G-A, A-B
        // Left offset = whiteIndex * WHITE_W + adjustment
        function blackLeft(n){
            // find which octave and note name
            var octOffset = (n.octave - 3) * 7 * WHITE_W; // 7 white keys per octave
            var name = n.note.replace('#','');
            var wIdx = WHITE.indexOf(name);
            // black key center sits between wIdx and wIdx+1 white key
            return octOffset + wIdx * WHITE_W + Math.round(WHITE_W * 0.65);
        }

        var whiteHTML = '';
        whites.forEach(function(n){
            var kl = NOTE_KEY_LABEL[n.label] ? '<span class="pno__kl">'+NOTE_KEY_LABEL[n.label]+'</span>' : '';
            // octave marker on C
            var oct = (n.note === 'C') ? '<span class="pno__oct">C'+n.octave+'</span>' : '';
            whiteHTML += '<div class="pno__wk" data-note="'+n.label+'" data-midi="'+n.midi+'" tabindex="-1">'
                       + kl + oct + '</div>';
        });

        var blackHTML = '';
        blacks.forEach(function(n){
            var kl = NOTE_KEY_LABEL[n.label] ? '<span class="pno__kl">'+NOTE_KEY_LABEL[n.label]+'</span>' : '';
            var lx = blackLeft(n);
            blackHTML += '<div class="pno__bk" data-note="'+n.label+'" data-midi="'+n.midi+'" style="left:'+lx+'px">'
                       + kl + '</div>';
        });

        var totalW = whites.length * WHITE_W - 2; // subtract last gap

        container.innerHTML =
            '<div class="pno" tabindex="0">'
          +   '<div class="pno__toolbar">'
          +     '<div class="pno__row"><span class="pno__label">Onde</span>'
          +       '<select class="pno__select" data-wave>'
          +         '<option value="sine">Sine</option>'
          +         '<option value="square">Square</option>'
          +         '<option value="triangle">Triangle</option>'
          +         '<option value="sawtooth">Sawtooth</option>'
          +       '</select>'
          +     '</div>'
          +     '<div class="pno__row"><span class="pno__label">Vol</span>'
          +       '<input class="pno__vol" type="range" data-vol min="0" max="100" value="55">'
          +     '</div>'
          +     '<span class="pno__hint">clavier AZERTY · Q‥R = do→si · 2 3 5 6 7 9 0 - = ] = dièses</span>'
          +   '</div>'
          +   '<div class="pno__stage">'
          +     '<div class="pno__keys" style="width:'+totalW+'px" data-keys>'
          +       whiteHTML
          +       blackHTML
          +     '</div>'
          +   '</div>'
          +   '<div class="pno__status" data-status>Cliquez ou appuyez sur une touche pour jouer.</div>'
          + '</div>';

        var root       = container.querySelector('.pno');
        var waveEl     = container.querySelector('[data-wave]');
        var volEl      = container.querySelector('[data-vol]');
        var statusEl   = container.querySelector('[data-status]');
        var keysEl     = container.querySelector('[data-keys]');

        function setActive(label, on){
            var el = keysEl.querySelector('[data-note="'+label+'"]');
            if(el){ el.classList.toggle('pno--active', on); }
        }
        function status(txt){ statusEl.textContent = txt; }

        /* ── Pointer events (mouse + touch) ─────────────── */
        // We track pointer state per element to handle drag-across-keys
        var pointerDown = false;
        var pointerNote = null;

        function startNote(el){
            var label = el.getAttribute('data-note');
            var midi  = parseInt(el.getAttribute('data-midi'),10);
            if(!label) return;
            if(pointerNote && pointerNote !== label) stopNote(pointerNote);
            pointerNote = label;
            noteOn(label, midi);
            setActive(label, true);
            status(label.replace('#','♯') + ' — ' + midiToHz(midi).toFixed(1) + ' Hz');
        }

        function stopNote(label){
            if(!label) return;
            noteOff(label);
            setActive(label, false);
            if(pointerNote === label) pointerNote = null;
        }

        function onPointerDown(e){
            var el = e.target.closest('[data-note]');
            if(!el) return;
            pointerDown = true;
            e.preventDefault();
            startNote(el);
        }
        function onPointerMove(e){
            if(!pointerDown) return;
            var el = document.elementFromPoint(e.clientX, e.clientY);
            if(el) el = el.closest('[data-note]');
            if(!el) return;
            var label = el.getAttribute('data-note');
            if(label && label !== pointerNote){
                if(pointerNote) stopNote(pointerNote);
                var midi = parseInt(el.getAttribute('data-midi'),10);
                pointerNote = label;
                noteOn(label, midi);
                setActive(label, true);
                status(label.replace('#','♯') + ' — ' + midiToHz(midi).toFixed(1) + ' Hz');
            }
        }
        function onPointerUp(e){
            if(!pointerDown) return;
            pointerDown = false;
            if(pointerNote){ stopNote(pointerNote); pointerNote = null; }
        }

        keysEl.addEventListener('mousedown',  onPointerDown);
        window.addEventListener('mousemove',  onPointerMove);
        window.addEventListener('mouseup',    onPointerUp);
        keysEl.addEventListener('touchstart', onPointerDown, {passive:false});
        window.addEventListener('touchmove',  onPointerMove, {passive:false});
        window.addEventListener('touchend',   onPointerUp);

        /* ── Keyboard events ─────────────────────────────── */
        function onKeyDown(e){
            if(e.repeat) return;
            if(e.ctrlKey||e.metaKey||e.altKey) return;
            var noteLabel = KEY_TO_NOTE[e.code];
            if(!noteLabel) return;
            e.preventDefault();
            // find midi
            var el = keysEl.querySelector('[data-note="'+noteLabel+'"]');
            if(!el) return;
            var midi = parseInt(el.getAttribute('data-midi'),10);
            pressedKeys[e.code] = noteLabel;
            noteOn(noteLabel, midi);
            setActive(noteLabel, true);
            status(noteLabel.replace('#','♯') + ' — ' + midiToHz(midi).toFixed(1) + ' Hz');
        }
        function onKeyUp(e){
            var noteLabel = pressedKeys[e.code];
            if(!noteLabel) return;
            delete pressedKeys[e.code];
            noteOff(noteLabel);
            setActive(noteLabel, false);
        }

        root.addEventListener('keydown', onKeyDown);
        root.addEventListener('keyup',   onKeyUp);
        // Also capture on window so keys work even without focus on root
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup',   onKeyUp);

        /* ── Controls ────────────────────────────────────── */
        waveEl.addEventListener('change', function(){
            waveform = waveEl.value;
        });
        volEl.addEventListener('input', function(){
            masterVol = volEl.value / 100 * 0.9;
        });

        /* ── Bus : entrée tempo (studio.bpm -> métronome) ── */
        // Le séquenceur Studio est l'horloge maître : son BPM cadence le piano.
        var tempoTimer = null;

        function metroClick(){
            try{
                var a = ensureAC();
                if(a.state === 'running'){
                    var mo = a.createOscillator();
                    var mg = a.createGain();
                    mo.type = 'square';
                    mo.frequency.value = 1200;
                    mg.gain.setValueAtTime(Math.max(0.04, masterVol * 0.25), a.currentTime);
                    mg.gain.linearRampToValueAtTime(0, a.currentTime + 0.05);
                    mo.connect(mg);
                    mg.connect(a.destination);
                    mo.start();
                    mo.stop(a.currentTime + 0.06);
                }
            }catch(e){}
            statusEl.classList.add('pno--beat');
            setTimeout(function(){ statusEl.classList.remove('pno--beat'); }, 110);
        }
        function stopMetro(){
            if(tempoTimer){ clearInterval(tempoTimer); tempoTimer = null; }
        }
        function startMetro(bpm){
            stopMetro();
            status('Tempo studio : ' + bpm + ' BPM — métronome ♩');
            metroClick();
            tempoTimer = setInterval(metroClick, Math.round(60000 / bpm));
        }

        /* ── Bus : ports d'entrée (jOSPorts) ─────────────── */
        var busOffs = [];
        try{
            if(window.jOSPorts && window.jOSPorts.on){
                busOffs.push(window.jOSPorts.on('ploxion.piano.tempo', function(payload){
                    try{
                        var p = (payload && typeof payload === 'object') ? payload : {bpm: payload};
                        if(p.playing === false || p.state === 'stop' || p.stop === true){
                            stopMetro();
                            status('Métronome arrêté (studio stop).');
                            return;
                        }
                        var bpm = Number(p.bpm != null ? p.bpm : p.value);
                        if(!isFinite(bpm) || bpm <= 0) return; // payload invalide -> ignore
                        startMetro(Math.min(300, Math.max(20, Math.round(bpm))));
                    }catch(e){}
                }));
            }
        }catch(e){}

        // Focus root so keyboard works immediately
        setTimeout(function(){ root.focus(); }, 0);

        /* ── Unmount ─────────────────────────────────────── */
        function unmount(){
            // Stop all active voices
            Object.keys(voices).forEach(function(label){ noteOff(label); });
            // Droit au silence : métronome + abonnements bus
            stopMetro();
            busOffs.forEach(function(off){ try{ if(off) off(); }catch(e){} });
            busOffs = [];
            // Remove global listeners
            window.removeEventListener('mousemove',  onPointerMove);
            window.removeEventListener('mouseup',    onPointerUp);
            window.removeEventListener('touchmove',  onPointerMove);
            window.removeEventListener('touchend',   onPointerUp);
            window.removeEventListener('keydown',    onKeyDown);
            window.removeEventListener('keyup',      onKeyUp);
            // Close AudioContext
            try{ if(ac) ac.close(); }catch(e){}
            container.innerHTML = '';
        }

        return { unmount: unmount };
    }

    window.jOSApps = window.jOSApps || {};
    window.jOSApps['piano'] = {manifest:{id:'piano',name:'Piano',icon:'🎹'}, mount:mount};
})();
