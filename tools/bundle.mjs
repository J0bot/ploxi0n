// le découpage d'un app.blade.php du labo en bundle (CSS, JS, scripts externes, HTML restant) ; partagé par l'extraction et la compatibilité
export const BLADE = /\{\{(?!--)|\{!!|@(csrf|auth|guest|endauth|if|elseif|else|endif|foreach|endforeach|include|json|php|endphp|isset|can|env|push|stack|section|yield|vite|method|lang|unless)\b/;

export function decouper(src) {
  src = src.replace(/\{\{--[\s\S]*?--\}\}/g, '');
  const css = [...src.matchAll(/<style(?:\s[^>]*)?>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
  const deps = [], js = [];
  for (const m of src.matchAll(/<script(\s[^>]*)?>([\s\S]*?)<\/script>/g)) {
    const attrs = m[1] || '', s = /\ssrc\s*=\s*["']([^"']+)["']/.exec(attrs);
    if (s) deps.push(s[1]); else if (!/type\s*=\s*["'](?!text\/javascript|module)[^"']*["']/.test(attrs)) js.push(m[2]);
  }
  const reste = src.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<script[\s\S]*?<\/script>/g, '').trim();
  return { css, js: js.join('\n;\n'), deps, html: reste, src };
}

