# benchmark (labo, /px/benchmark/app.js) : le droit au silence

Quitter le ploxion pendant une mesure : le calcul continue ~15 s (et les workers), l'appareil rame et la mesure est faussée.

1. Après `var CPU_SRC = …;` :
   var travailleurs = [];
2. Dans tousLesCoeurs, après `try { w = new Worker(url); } catch (e) { return ok(null); }` :
   travailleurs.push(w);
3. Dans mount, la première ligne devient :
   var vue = 'mesurer', courant = null, enCours = false, vivant = true, nom = …
4. Dans lancer(), la boucle :
   for (var i = 0; i < EPREUVES.length; i++) { if (!vivant) return; var e = EPREUVES[i]; … }
   et juste après la boucle : if (!vivant) return;
5. Le démontage :
   return { unmount: function () { vivant = false; travailleurs.splice(0).forEach(function (w) { try { w.terminate(); } catch (e) {} }); container.innerHTML = ''; } };
