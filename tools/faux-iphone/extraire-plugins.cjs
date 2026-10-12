// Les en-têtes des plugins iOS RÉELS (jsName + méthodes + type de retour), lus dans le Swift/Objective-C : ceux de Package.swift, ceux du
// cœur de Capacitor, et ceux de l'app (AppDelegate.swift). Usage : node tools/faux-iphone/extraire-plugins.cjs <sortie.json> (depuis la racine)
const fs=require('fs'),path=require('path');
const walk=(d,ext)=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?(['node_modules','android','Tests'].includes(e.name)?[]:walk(path.join(d,e.name),ext)):e.name.endsWith(ext)?[path.join(d,e.name)]:[]);
const rt=(x)=>x==='CAPPluginReturnCallback'?'callback':x==='CAPPluginReturnNone'?null:'promise';
const lire=(s)=>[...s.matchAll(/(?:CAPPluginMethod|\.init)\(name:\s*"([^"]+)",\s*returnType:\s*(CAPPluginReturn\w+)/g)].map(x=>({name:x[1],rtype:rt(x[2])}));
const pkg=fs.readFileSync('ios/App/CapApp-SPM/Package.swift','utf8');
const dirs=[...pkg.matchAll(/node_modules\/([^"]+)"/g)].map(m=>'node_modules/'+m[1]);
const out={};
for(const d of [...dirs,'node_modules/@capacitor/ios/Capacitor/Capacitor'])for(const f of walk(d,'.swift')){const s=fs.readFileSync(f,'utf8');const j=s.match(/jsName\s*=\s*"([^"]+)"/);if(j)out[j[1]]=lire(s);}
for(const d of dirs)for(const f of walk(d,'.m')){const s=fs.readFileSync(f,'utf8');const j=s.match(/CAP_PLUGIN\(\w+,\s*"([^"]+)"/);if(j&&!out[j[1]])out[j[1]]=[...s.matchAll(/CAP_PLUGIN_METHOD\((\w+),\s*(CAPPluginReturn\w+)\)/g)].map(x=>({name:x[1],rtype:rt(x[2])}));}
const app=fs.readFileSync('ios/App/App/AppDelegate.swift','utf8');
for(const blk of app.split('@objc(').slice(1)){const n=blk.match(/jsName = "([^"]+)"/)[1];out[n]=lire(blk);}
fs.writeFileSync(process.argv[2],JSON.stringify(out));console.log(Object.keys(out).length,'plugins ; PloxiApple',out.PloxiApple.map(m=>m.name).join(','));
