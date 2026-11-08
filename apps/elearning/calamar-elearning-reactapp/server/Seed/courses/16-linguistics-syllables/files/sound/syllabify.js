// syllabify.js: split written words into syllables by the maximal onset principle, with each language's
// own list of allowed onsets, and count Japanese morae.
// It can't see stress, so a stressed i or u that breaks a vowel group (Italian mì-a, Romanian mi-e) needs an accent
// mark or a manual check.
//
//   node syllabify.js es constructor astronomía ciudad país     Spanish
//   node syllabify.js it costruttore finestra pasta tutto         Italian
//   node syllabify.js ro constructor castravete pasta mâine       Romanian
//   node syllabify.js en constructor astronomy extra              English (simplified)
//   node syllabify.js ja Tōkyō Nippon Hokkaidō kitte             Japanese romaji: syllables and morae
//
// This is a teaching model working on spelling, not on sound. It knows the basic rules (vowel groups,
// allowed onsets) but not stress, morphology or every exception. Dictionaries sometimes split differently.

process.on('uncaughtException', (e) => { console.error(`error: ${e.message}`); process.exit(1); });

const LANGS = {
  es: {
    vowels: 'aeiouáéíóúü',
    // a strong vowel (a e o) with an unstressed i/u, or i+u, form one nucleus (a diphthong)
    diphthongs: ['ai', 'ei', 'oi', 'au', 'eu', 'ou', 'ia', 'ie', 'io', 'iu', 'ua', 'ue', 'ui', 'uo', 'ay', 'ey', 'oy', 'uy'],
    units: ['ch', 'll', 'rr', 'qu', 'gu'],
    onsets: ['pl', 'pr', 'bl', 'br', 'fl', 'fr', 'cl', 'cr', 'gl', 'gr', 'tr', 'dr'],
  },
  it: {
    vowels: 'aeiouàèéìòù',
    diphthongs: ['ia', 'ie', 'io', 'iu', 'ua', 'ue', 'uo', 'ui', 'ai', 'ei', 'oi', 'au', 'eu'],
    units: ['ch', 'gh', 'gn', 'gl', 'sc', 'qu'],
    // Italian puts s + consonant at the start of the next syllable (pa-sta), and C + l/r
    onsets: ['pl', 'pr', 'bl', 'br', 'fl', 'fr', 'cl', 'cr', 'gl', 'gr', 'tr', 'dr', 'vr',
      'sp', 'st', 'sc', 'sb', 'sd', 'sf', 'sg', 'sl', 'sm', 'sn', 'sv', 'spr', 'str', 'scr', 'spl', 'sgr', 'sbr'],
  },
  ro: {
    vowels: 'aeiouăâîy',
    diphthongs: ['ea', 'oa', 'ia', 'ie', 'io', 'iu', 'ua', 'uă', 'ai', 'ei', 'oi', 'ui', 'ăi', 'âi', 'îi', 'au', 'eu', 'ou', 'ău', 'âu', 'iu'],
    units: ['ch', 'gh'],
    onsets: ['pl', 'pr', 'bl', 'br', 'fl', 'fr', 'cl', 'cr', 'gl', 'gr', 'tr', 'dr', 'vl', 'vr', 'hr', 'hl'],
  },
  en: {
    vowels: 'aeiouy',
    diphthongs: ['ea', 'ee', 'oo', 'ou', 'ai', 'ay', 'oa', 'ie', 'ei', 'au', 'aw', 'ow', 'oy', 'oi', 'ey', 'ue'],
    units: ['ch', 'sh', 'th', 'ph', 'wh', 'ck', 'ng', 'qu'],
    onsets: ['pl', 'pr', 'bl', 'br', 'fl', 'fr', 'cl', 'cr', 'gl', 'gr', 'tr', 'dr', 'tw', 'dw', 'sw', 'sl', 'sm', 'sn',
      'sp', 'st', 'sk', 'sc', 'spr', 'str', 'scr', 'spl', 'squ', 'shr', 'thr', 'sch'],
  },
};

function tokenize(word, L) {
  // split into units: multi-letter consonant units first, then single letters
  const out = [];
  let i = 0;
  while (i < word.length) {
    const u = L.units.find((u) => word.startsWith(u, i));
    if (u) { out.push(u); i += u.length; } else { out.push(word[i]); i++; }
  }
  return out;
}

function syllabify(word, lang) {
  const L = LANGS[lang];
  const w = word.toLowerCase();
  const isV = (t) => t.length === 1 && L.vowels.includes(t);
  let toks = tokenize(w, L);
  // English: a word-final silent e after a consonant doesn't make a syllable (make, stone)
  let silentE = false;
  if (lang === 'en' && toks.length > 2 && toks[toks.length - 1] === 'e' && !isV(toks[toks.length - 2]) && toks.filter(isV).length > 1) {
    toks = toks.slice(0, -1); silentE = true;
  }
  // English: y before a vowel is a consonant (yes, beyond)
  const vowelAt = (i) => isV(toks[i]) && !(lang === 'en' && toks[i] === 'y' && i + 1 < toks.length && isV(toks[i + 1]));
  // group vowels into nuclei
  const nuclei = [];
  for (let i = 0; i < toks.length; i++) {
    if (!vowelAt(i)) continue;
    const last = nuclei[nuclei.length - 1];
    if (last && last[1] === i - 1 && L.diphthongs.includes(toks[i - 1] + toks[i]) && last[1] - last[0] < 1) last[1] = i;
    else nuclei.push([i, i]);
  }
  if (nuclei.length <= 1) return [word];
  // place each boundary: consonants between two nuclei -> the largest allowed onset goes right
  const cuts = [];
  for (let k = 0; k + 1 < nuclei.length; k++) {
    const from = nuclei[k][1] + 1, to = nuclei[k + 1][0];   // consonant tokens are toks[from..to-1]
    const cons = toks.slice(from, to);
    let take = Math.min(cons.length, 1);                      // one consonant always goes right
    for (let n = cons.length; n >= 2; n--) {
      if (L.onsets.includes(cons.slice(cons.length - n).join(''))) { take = n; break; }
    }
    // a doubled consonant splits between syllables (it: tut-to; en: let-ter)
    if (cons.length >= 2 && cons[cons.length - take - 1] === cons[cons.length - take]) take = Math.min(take, cons.length - 1);
    cuts.push(to - take);
  }
  const parts = [];
  let start = 0;
  for (const c of cuts) { parts.push(toks.slice(start, c).join('')); start = c; }
  parts.push(toks.slice(start).join('') + (silentE ? 'e' : ''));
  return parts;
}

// Japanese morae from Hepburn romaji: (C)(y)V is one mora; a long vowel (ā, ō, or a doubled vowel), the moraic n,
// and the first half of a doubled consonant each count as one more.
function morae(word) {
  const w = word.toLowerCase().normalize('NFC');
  const LONG = { 'ā': 'aa', 'ī': 'ii', 'ū': 'uu', 'ē': 'ee', 'ō': 'oo' };
  const s = [...w].map((c) => LONG[c] ?? c).join('');
  const out = [];
  let i = 0;
  while (i < s.length) {
    const rest = s.slice(i);
    let m;
    if ((m = rest.match(/^n(?![aeiouy])/))) out.push('n');                          // moraic n
    else if ((m = rest.match(/^([kgsztdhbpmrjfc])\1/)) || (m = rest.match(/^t(?=ch)/))) { out.push(m[0][0]); i += 1; continue; }   // geminate
    else if ((m = rest.match(/^(ky|gy|sh|ch|ts|ny|hy|my|ry|by|py|j|[kgsztdnhbpmyrwf])?[aeiou]/))) out.push(m[0]);
    else throw new Error(`can't read "${rest}" in "${word}"`);
    i += m[0].length;
  }
  // syllables: a mora that is a lone vowel continuing a long vowel or diphthong (ai, ei, oi, ui), n, or a geminate,
  // joins the previous syllable
  const syll = [];
  for (const mo of out) {
    const prev = syll[syll.length - 1];
    const joins = prev && (mo === 'n' || /^[aeiou]$/.test(mo) && (prev.endsWith(mo) || mo === 'i' && /[aeiou]$/.test(prev) || mo === 'u' && prev.endsWith('o')));
    if (joins) syll[syll.length - 1] += mo;
    else syll.push(mo);
  }
  // attach geminate consonants to the previous syllable
  const merged = [];
  for (const s2 of syll) {
    if (/^[kgsztdhbpmrjfc]$/.test(s2) && merged.length) merged[merged.length - 1] += s2;
    else merged.push(s2);
  }
  return { morae: out, syllables: merged };
}

const [lang, ...words] = process.argv.slice(2);
if (lang === 'ja') {
  for (const w of words) {
    const r = morae(w);
    console.log(`${w.padEnd(12)} morae: ${r.morae.join('|').padEnd(20)} ${String(r.morae.length).padStart(2)}    syllables: ${r.syllables.join('.').padEnd(14)} ${r.syllables.length}`);
  }
} else if (LANGS[lang]) {
  for (const w of words) {
    const s = syllabify(w, lang);
    console.log(`${w.padEnd(14)} ${s.join('-').padEnd(20)} ${s.length} syllable${s.length > 1 ? 's' : ''}`);
  }
} else {
  console.log('usage: node syllabify.js es|it|ro|en|ja word ...');
}
