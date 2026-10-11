
(function () {
    function esc(s){return window.jOSb&&window.jOSb.esc?window.jOSb.esc(s):(function(x){var d=document.createElement('div');d.textContent=x==null?'':x;return d.innerHTML;})(s);}
    // Chaque récit = un xerion : la grande idée + la science qu'elle inspire/prédit.
    var R = [
        { t:'Fondation', a:'Isaac Asimov', y:'1951', m:'Livre', idea:'La psychohistoire : prédire l’avenir des civilisations par les statistiques de masse.', sci:'sociologie statistique, modèles prédictifs → la formule de la certitude.', x:'Le rêve de prévoir l’histoire — le cœur de notre projet.' },
        { t:'Matrix', a:'Wachowski', y:'1999', m:'Film', idea:'L’hypothèse de simulation : et si le réel était entièrement calculé ?', sci:'simulation, réalité virtuelle, neuro-interfaces.', x:'« Et si rien de tout ça n’était réel ? »' },
        { t:'Dr. Stone', a:'Inagaki & Boichi', y:'2017', m:'Anime', idea:'Reconstruire toute la civilisation depuis zéro, uniquement avec la science.', sci:'CE tech-tree — chaque techno redécouverte, étape par étape.', x:'La science comme super-pouvoir. Notre mode par défaut.' },
        { t:'2001 : l’Odyssée de l’espace', a:'Clarke & Kubrick', y:'1968', m:'Film', idea:'HAL 9000 (IA qui dépasse l’humain) et le saut évolutif du monolithe.', sci:'intelligence artificielle, exploration spatiale.', x:'L’outil qui finit par dépasser son créateur.' },
        { t:'Neuromancien', a:'William Gibson', y:'1984', m:'Livre', idea:'Le cyberespace : un univers de données dans lequel on se branche.', sci:'internet, VR, IA — il a nommé le cyberspace avant qu’il existe.', x:'Le futur écrit dix ans en avance.' },
        { t:'Star Trek', a:'Gene Roddenberry', y:'1966', m:'Série', idea:'Communicateur, tricorder, réplicateur : la technologie au service de tous.', sci:'smartphone, imagerie médicale portable, impression 3D.', x:'La SF devient le cahier des charges des ingénieurs.' },
        { t:'De la Terre à la Lune', a:'Jules Verne', y:'1865', m:'Livre', idea:'Envoyer des hommes sur la Lune avec un projectile géant.', sci:'fusée, balistique, programme Apollo (un siècle plus tard).', x:'Il a visé la Lune avant qu’on sache voler.' },
        { t:'Ghost in the Shell', a:'Shirow & Oshii', y:'1989', m:'Anime', idea:'Le cyber-cerveau : où finit l’humain, où commence la machine ?', sci:'neuro-interfaces, IA, identité posthumaine.', x:'« Qu’est-ce qui reste de toi quand tout est augmenté ? »' },
        { t:'Le Problème à trois corps', a:'Liu Cixin', y:'2006', m:'Livre', idea:'La forêt sombre : la sociologie des civilisations à l’échelle cosmique.', sci:'théorie des jeux interstellaire, mécanique céleste, SETI.', x:'La psychohistoire, version cosmos.' },
        { t:'Dune', a:'Frank Herbert', y:'1965', m:'Livre', idea:'Écologie planétaire et prescience : lire les systèmes pour lire l’avenir.', sci:'écologie systémique, modélisation, anticipation.', x:'Le désert comme organisme vivant.' },
        { t:'Le Samouraï virtuel (Snow Crash)', a:'Neal Stephenson', y:'1992', m:'Livre', idea:'Le métavers : un monde virtuel social où l’on vit par avatars.', sci:'VR sociale, avatars, le mot « métavers » lui-même.', x:'Le métavers est né dans ce roman.' },
        { t:'Akira', a:'Katsuhiro Otomo', y:'1988', m:'Anime', idea:'La singularité : un pouvoir qui croît plus vite que la sagesse pour le tenir.', sci:'émergence, neuro-évolution, risque technologique.', x:'Le pouvoir sans le contrôle.' },
        { t:'Blade Runner', a:'P.K. Dick & R. Scott', y:'1982', m:'Film', idea:'Les réplicants : qu’est-ce qui définit l’humain si on peut le fabriquer ?', sci:'IA incarnée, bioéthique, tests de conscience.', x:'« Plus humain que l’humain. »' },
        { t:'Steins;Gate', a:'5pb. / Nitroplus', y:'2011', m:'Anime', idea:'Lignes temporelles et causalité : changer le passé a toujours un prix.', sci:'physique du temps, mondes multiples, causalité.', x:'Chaque choix bifurque une ligne d’univers.' },
        { t:'Moi, Robot', a:'Isaac Asimov', y:'1950', m:'Livre', idea:'Les 3 lois de la robotique : encadrer la machine pour qu’elle ne nuise pas.', sci:'éthique de l’IA, alignement, sécurité robotique.', x:'« Ne pas nuire » — gravé dans la machine.' },
        { t:'1984', a:'George Orwell', y:'1949', m:'Livre', idea:'La surveillance totale et le contrôle du réel par le langage.', sci:'vie privée, données, propagande algorithmique.', x:'« Big Brother te regarde. »' },
        { t:'Le Meilleur des mondes', a:'Aldous Huxley', y:'1932', m:'Livre', idea:'Une société conditionnée par le bonheur, le bio-contrôle et le confort.', sci:'génie génétique, neuro-conditionnement, contrôle social.', x:'La dystopie qui sourit.' },
        { t:'Jurassic Park', a:'Michael Crichton', y:'1990', m:'Livre', idea:'Ressusciter le vivant par l’ADN — et le chaos qui en découle.', sci:'clonage, ADN ancien, théorie du chaos.', x:'« La vie trouve toujours un chemin. »' },
        { t:'Seul sur Mars', a:'Andy Weir', y:'2011', m:'Livre', idea:'Survivre par l’ingénierie pure : résoudre un problème après l’autre.', sci:'agronomie martienne, ISRU, chimie de survie.', x:'« Science the shit out of it. » — l’esprit Dr.Stone.' },
        { t:'Serial Experiments Lain', a:'Yoshitoshi ABe', y:'1998', m:'Anime', idea:'Le réseau dissout l’identité : présente partout, donc nulle part.', sci:'internet, conscience distribuée, réalité augmentée.', x:'« Et tu n’existes que connecté. »' },
        { t:'Contact', a:'Carl Sagan', y:'1985', m:'Livre', idea:'Un message extraterrestre : la rigueur scientifique face à l’inconnu et la foi.', sci:'SETI, radio-astronomie, méthode scientifique.', x:'La preuve contre la croyance.' },
        { t:'Minority Report', a:'Philip K. Dick', y:'1956', m:'Livre', idea:'La pré-crime : prédire le crime avant qu’il arrive — et tuer le libre arbitre.', sci:'analyse prédictive, données, éthique de la prédiction.', x:'Prévoir l’acte, est-ce déjà le créer ?' },
        { t:'SOMA', a:'Frictional Games', y:'2015', m:'Jeu', idea:'Copier une conscience : la copie est-elle encore toi ?', sci:'upload mental, continuité de l’identité, IA.', x:'Le tirage à pile ou face de la conscience.' },
        { t:'Westworld', a:'Nolan & Joy', y:'2016', m:'Série', idea:'Des IA qui s’éveillent à la conscience à force de boucles et de souvenirs.', sci:'IA consciente, mémoire, libre arbitre.', x:'La boucle qui finit par se voir elle-même.' }
    ];
    var MEDS = ['Tous', 'Livre', 'Film', 'Anime', 'Série', 'Jeu'];

    function mount(container, ctx) {
        var med = 'Tous', q = '';
        container.innerHTML =
            '<div class="rc">'
          + '  <div class="rc__bar"><span class="rc__t">📖 <b>Récits</b> · xerions de fiction</span>'
          + '    <input class="rc__f" placeholder="cherche une œuvre, une idée…"><span class="rc__cnt"></span></div>'
          + '  <div class="rc__meds"></div>'
          + '  <div class="rc__list"></div>'
          + '  <div class="rc__foot">Toutes les histoires comme matière première — chaque récit prédit ou inspire une science. Fondation → psychohistoire · Matrix → simulation · Dr.Stone → ce tech-tree.</div>'
          + '</div>';
        var elMeds = container.querySelector('.rc__meds'), elList = container.querySelector('.rc__list');
        var elF = container.querySelector('.rc__f'), elCnt = container.querySelector('.rc__cnt');

        function renderMeds() {
            elMeds.innerHTML = MEDS.map(function (m) {
                return '<button class="rc__med' + (m === med && !q ? ' on' : '') + '" data-m="' + esc(m) + '">' + esc(m) + '</button>';
            }).join('');
        }
        function list() {
            return R.filter(function (r) {
                if (med !== 'Tous' && !q && r.m !== med) return false;
                if (q && (r.t + ' ' + r.a + ' ' + r.idea + ' ' + r.sci + ' ' + r.x + ' ' + r.m).toLowerCase().indexOf(q) === -1) return false;
                return true;
            });
        }
        function render() {
            renderMeds();
            var l = list();
            elCnt.textContent = l.length + (q ? ' trouvés' : '') + ' · ' + R.length + ' récits';
            if (!l.length) { elList.innerHTML = '<div class="rc__msg">aucun — élargis la recherche</div>'; return; }
            elList.innerHTML = l.map(function (r, n) {
                return '<div class="rc__c" data-i="' + n + '" title="ouvrir dans le lecteur BD">'
                     + '<div class="rc__h"><span class="rc__n">' + esc(r.t) + '</span><span class="rc__y">' + esc(r.y) + '</span></div>'
                     + '<div class="rc__by"><span class="rc__med2">' + esc(r.m) + '</span> · ' + esc(r.a) + '</div>'
                     + '<div class="rc__idea">' + esc(r.idea) + '</div>'
                     + '<div class="rc__sci">▸ inspire : ' + esc(r.sci) + '</div>'
                     + '<div class="rc__x">' + esc(r.x) + '</div>'
                     + '</div>';
            }).join('');
        }

        elMeds.addEventListener('click', function (e) { var b = e.target.closest('[data-m]'); if (b) { med = b.getAttribute('data-m'); q = ''; elF.value = ''; render(); } });
        // OUT recits.pick -> bd.load : un récit choisi (clic carte) part au lecteur BD jumeau, lisible en cases/planches.
        elList.addEventListener('click', function (e) {
            var c = e.target.closest('[data-i]'); if (!c) return;
            var r = list()[+c.getAttribute('data-i')]; if (!r) return;
            try {
                if (window.jOSPorts && window.jOSPorts.emit) {
                    window.jOSPorts.emit('recits', 'pick', { title: r.t, t: r.t, a: r.a, y: r.y, m: r.m, idea: r.idea, sci: r.sci, x: r.x });
                    if (window.jOSb && window.jOSb.toast) window.jOSb.toast('📖 « ' + r.t + ' » → lecteur BD');
                }
            } catch (e2) {}
        });
        elF.addEventListener('input', function () { q = elF.value.trim().toLowerCase(); render(); });
        render();
        return { unmount: function () { container.innerHTML = ''; } };
    }

    window.jOSApps = window.jOSApps || {};
    window.jOSApps['recits'] = { manifest: { id: 'recits', name: 'Récits', icon: '📖' }, mount: mount };
})();
