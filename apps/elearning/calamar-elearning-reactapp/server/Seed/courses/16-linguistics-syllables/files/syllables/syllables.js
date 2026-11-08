// syllables.js: look up what a basic syllable means across languages, using syllables.json.
//
//   node syllables.js ma                    every meaning of "ma" in the data
//   node syllables.js ma --lang Mandarin    only in one language
//   node syllables.js --compare na ne no    side by side: the "no" and "yes" syllables
//   node syllables.js --stats               how many entries per syllable and per language
//   node syllables.js --homophones          languages with the most meanings for one toneless syllable
//
// Add your own entries to syllables.json: { "syl", "lang", "form", "roman", "meaning", "kind" }.

process.on('uncaughtException', (e) => { console.error(`error: ${e.message}`); process.exit(1); });

const fs = require('fs');
const path = require('path');
const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'syllables.json'), 'utf8')).entries;

const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };

function show(list) {
  const width = Math.max(...list.map((e) => e.lang.length), 8);
  let last = '';
  for (const e of list) {
    const lang = e.lang === last ? '' : e.lang;
    last = e.lang;
    console.log(`  ${lang.padEnd(width)}  ${(e.form + ' ').padEnd(13)}${(e.roman + ' ').padEnd(21)} ${e.meaning}${e.kind !== 'word' ? `  [${e.kind}]` : ''}${e.note ? `  (${e.note})` : ''}`);
  }
}

if (args.includes('--stats')) {
  const bySyl = new Map(), byLang = new Map();
  for (const e of data) {
    bySyl.set(e.syl, (bySyl.get(e.syl) ?? 0) + 1);
    byLang.set(e.lang, (byLang.get(e.lang) ?? 0) + 1);
  }
  console.log(`${data.length} entries, ${bySyl.size} syllables, ${byLang.size} languages\n`);
  console.log('per syllable:  ' + [...bySyl].sort((a, b) => b[1] - a[1]).map(([s, n]) => `${s} ${n}`).join(', '));
  console.log('per language:  ' + [...byLang].sort((a, b) => b[1] - a[1]).map(([l, n]) => `${l} ${n}`).join(', '));
  const kinds = new Map();
  for (const e of data) kinds.set(e.kind, (kinds.get(e.kind) ?? 0) + 1);
  console.log('per kind:      ' + [...kinds].map(([k, n]) => `${k} ${n}`).join(', '));
} else if (args.includes('--homophones')) {
  const groups = new Map();
  for (const e of data) {
    const k = `${e.syl}|${e.lang}`;
    groups.set(k, (groups.get(k) ?? 0) + 1);
  }
  console.log('syllable  language     meanings in the data');
  for (const [k, n] of [...groups].filter(([, n]) => n >= 3).sort((a, b) => b[1] - a[1])) {
    const [s, l] = k.split('|');
    console.log(`  ${s.padEnd(7)} ${l.padEnd(12)} ${n}`);
  }
} else if (args[0] === '--compare') {
  for (const s of args.slice(1)) {
    const list = data.filter((e) => e.syl === s);
    console.log(`\n${s.toUpperCase()} (${list.length} entries)`);
    show(list);
  }
} else if (args[0]) {
  const s = args[0].toLowerCase();
  const lang = opt('--lang');
  const list = data.filter((e) => e.syl === s && (!lang || e.lang.toLowerCase() === lang.toLowerCase()));
  if (!list.length) console.log(`no entries for "${s}"${lang ? ` in ${lang}` : ''}: add some to syllables.json`);
  else {
    console.log(`"${s}": ${list.length} meanings in ${new Set(list.map((e) => e.lang)).size} language${new Set(list.map((e) => e.lang)).size === 1 ? "" : "s"}\n`);
    show(list);
  }
} else {
  console.log('usage: node syllables.js <syllable> [--lang L] | --compare s1 s2 ... | --stats | --homophones');
}
