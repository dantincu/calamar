// scripts.js: how three writing systems encode syllables.
//
//   node scripts.js hangul 한국어 안녕하세요        Korean: split each syllable block into its letters, and romanize
//   node scripts.js compose ㅎ ㅏ ㄴ                 build a Hangul block from its letters, with the Unicode formula
//   node scripts.js count                           how many Hangul blocks are possible
//   node scripts.js pinyin ma1 ma2 ma3 ma4 ma5      Mandarin: tone numbers to tone marks
//   node scripts.js pinyin ni3 hao3 lü4 xue2 gui4
//   node scripts.js kana ひらがな さくら きって とうきょう    Japanese hiragana to romaji, with the mora count
//
// The Korean romanization is the Revised Romanization, letter by letter: it ignores the sound changes between
// blocks (so 한국어 comes out han-guk-eo, which happens to be right, but 십만 comes out sip-man, pronounced simman).

process.on('uncaughtException', (e) => { console.error(`error: ${e.message}`); process.exit(1); });

// ---------------------------------------------------------------- Hangul
const L = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const L_ROM = ['g', 'kk', 'n', 'd', 'tt', 'r', 'm', 'b', 'pp', 's', 'ss', '', 'j', 'jj', 'ch', 'k', 't', 'p', 'h'];
const V = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
const V_ROM = ['a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye', 'o', 'wa', 'wae', 'oe', 'yo', 'u', 'wo', 'we', 'wi', 'yu', 'eu', 'ui', 'i'];
const T = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const T_ROM = ['', 'k', 'k', 'k', 'n', 'n', 'n', 't', 'l', 'k', 'm', 'l', 'l', 'l', 'p', 'l', 'm', 'p', 'p', 't', 't', 'ng', 't', 't', 'k', 't', 'p', 't'];
const BASE = 0xac00;

function decompose(ch) {
  const code = ch.codePointAt(0) - BASE;
  if (code < 0 || code >= 19 * 21 * 28) return null;
  return { l: Math.floor(code / (21 * 28)), v: Math.floor((code % (21 * 28)) / 28), t: code % 28, code: code + BASE };
}

// ---------------------------------------------------------------- pinyin
function pinyin(syl) {
  const m = syl.match(/^([a-züv:]+)([1-5])$/i);
  if (!m) return syl;
  let [, s, tone] = m;
  s = s.replace(/v|u:/g, 'ü');
  if (tone === '5') return s;   // neutral tone: no mark
  const marks = { a: 'āáǎà', e: 'ēéěè', i: 'īíǐì', o: 'ōóǒò', u: 'ūúǔù', ü: 'ǖǘǚǜ' };
  // the rule: a or e takes the mark; in "ou" the o does; otherwise the last vowel
  let idx = s.search(/[ae]/);
  if (idx < 0) idx = s.indexOf('ou');
  if (idx < 0) {
    for (let i = s.length - 1; i >= 0; i--) if ('iouü'.includes(s[i])) { idx = i; break; }
  }
  return s.slice(0, idx) + marks[s[idx]][Number(tone) - 1] + s.slice(idx + 1);
}

// ---------------------------------------------------------------- kana
const KANA = {
  'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o', 'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
  'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so', 'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
  'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no', 'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
  'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo', 'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
  'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro', 'わ': 'wa', 'を': 'o', 'ん': 'n',
  'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go', 'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
  'だ': 'da', 'ぢ': 'ji', 'づ': 'zu', 'で': 'de', 'ど': 'do', 'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
  'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po',
};
const SMALL_Y = { 'ゃ': 'a', 'ゅ': 'u', 'ょ': 'o' };

function kana(word) {
  const chars = [...word];
  const morae = [];
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    if (SMALL_Y[c] && morae.length) {
      // きゃ kya, しゃ sha, ちゃ cha, じゃ ja: the small y-kana merges with the previous mora
      const prev = morae.pop();
      const stem = prev.slice(0, -1);
      morae.push((/(sh|ch|j)$/.test(stem) ? stem : stem + 'y') + SMALL_Y[c]);
    } else if (c === 'っ') {
      morae.push('Q');   // a geminate: doubles the next consonant
    } else if (c === 'ー') {
      morae.push(morae[morae.length - 1].slice(-1));   // long vowel mark (in katakana words)
    } else if (KANA[c]) {
      morae.push(KANA[c]);
    } else {
      throw new Error(`"${c}" is not in this small hiragana table`);
    }
  }
  const roman = morae.map((m, i) => (m === 'Q' ? (morae[i + 1] ?? '').replace(/^ch/, 't')[0] : m)).join('');
  return { morae: morae.map((m, i) => (m === 'Q' ? (morae[i + 1] ?? '').replace(/^ch/, 't')[0] : m)), roman };
}

const [cmd, ...args] = process.argv.slice(2);

if (cmd === 'hangul') {
  for (const word of args) {
    const parts = [...word].map((ch) => {
      const d = decompose(ch);
      if (!d) return { ch, letters: ch, rom: ch };
      return { ch, letters: `${L[d.l]}+${V[d.v]}${T[d.t] ? '+' + T[d.t] : ''}`, rom: L_ROM[d.l] + V_ROM[d.v] + T_ROM[d.t] };
    });
    console.log(`${word}: ${parts.map((p) => `${p.ch} (${p.letters})`).join('  ')}  ->  ${parts.map((p) => p.rom).join('-')}`);
  }
} else if (cmd === 'compose') {
  const [l, v, t = ''] = args;
  const li = L.indexOf(l), vi = V.indexOf(v), ti = T.indexOf(t);
  if (li < 0 || vi < 0 || ti < 0) throw new Error('give an initial consonant, a vowel and optionally a final consonant, as jamo (ㅎ ㅏ ㄴ)');
  const code = BASE + (li * 21 + vi) * 28 + ti;
  console.log(`initial ${l} = ${li}, vowel ${v} = ${vi}, final ${t || '(none)'} = ${ti}`);
  console.log(`code = 0xAC00 + (${li} x 21 + ${vi}) x 28 + ${ti} = ${code} = U+${code.toString(16).toUpperCase()}  ->  ${String.fromCodePoint(code)}`);
} else if (cmd === 'count') {
  console.log(`19 initial consonants x 21 vowels x 28 finals (27 + none) = ${19 * 21 * 28} possible blocks, U+AC00 to U+D7A3`);
  console.log(`built from 24 basic letters (14 consonants, 10 vowels), which are combined into the 19, 21 and 27 above`);
} else if (cmd === 'pinyin') {
  console.log(args.map((s) => `${s} -> ${pinyin(s)}`).join('   '));
} else if (cmd === 'kana') {
  for (const w of args) {
    const r = kana(w);
    console.log(`${w.padEnd(8)} ${r.roman.padEnd(12)} ${r.morae.length} mora${r.morae.length === 1 ? "" : "e"}: ${r.morae.join('|')}`);
  }
} else {
  console.log('usage: node scripts.js hangul|compose|count|pinyin|kana ... (see the top of the file)');
}
