// dna.js: from a DNA sequence to its mRNA and protein, with the standard genetic code.
//
//   node dna.js info ATGGTGCACCTGACTCCTGAGGAG          length, GC content, complement, mRNA, protein
//   node dna.js mutate ATGGTGCACCTGACTCCTGAGGAG 20 T   change base 20 (1-based) to T and compare the proteins
//   node dna.js insert ATGGTGCACCTGACTCCTGAGGAG 10 A   insert a base after position 10 (a frameshift)
//   node dna.js orfs <sequence>                         open reading frames (ATG ... stop) on both strands
//   node dna.js code                                     the codon table
//
// The sequence is the coding (sense) strand, 5' to 3'. Spaces and line breaks are ignored.

const BASES = 'TCAG';
// The standard genetic code, codons ordered TTT, TTC, TTA, TTG, TCT, ... GGG. '*' is a stop codon.
const AMINO = 'FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG';
const NAMES = {
  A: 'Ala', R: 'Arg', N: 'Asn', D: 'Asp', C: 'Cys', E: 'Glu', Q: 'Gln', G: 'Gly', H: 'His', I: 'Ile',
  L: 'Leu', K: 'Lys', M: 'Met', F: 'Phe', P: 'Pro', S: 'Ser', T: 'Thr', W: 'Trp', Y: 'Tyr', V: 'Val', '*': 'Stop',
};

const clean = (s) => {
  const seq = s.toUpperCase().replace(/\s+/g, '');
  if (!/^[ACGT]*$/.test(seq)) throw new Error('a DNA sequence may only contain A, C, G and T');
  return seq;
};

const complement = (seq) => seq.replace(/[ACGT]/g, (b) => ({ A: 'T', T: 'A', C: 'G', G: 'C' })[b]);
const reverseComplement = (seq) => complement(seq).split('').reverse().join('');
const transcribe = (seq) => seq.replace(/T/g, 'U');   // the mRNA has the coding strand's sequence, with U for T

function codonToAmino(codon) {
  const i = BASES.indexOf(codon[0]) * 16 + BASES.indexOf(codon[1]) * 4 + BASES.indexOf(codon[2]);
  return AMINO[i];
}

// Translate from the first base, stopping at the first stop codon (shown as '*').
function translate(seq, { throughStops = false } = {}) {
  let protein = '';
  for (let i = 0; i + 3 <= seq.length; i += 3) {
    const aa = codonToAmino(seq.slice(i, i + 3));
    protein += aa;
    if (aa === '*' && !throughStops) break;
  }
  return protein;
}

const gc = (seq) => (seq.match(/[GC]/g) ?? []).length / seq.length;

function codons(seq) {
  return seq.match(/.{1,3}/g).join(' ');
}

function compare(before, after) {
  const p1 = translate(before), p2 = translate(after);
  const diffs = [];
  for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
    if (p1[i] !== p2[i]) diffs.push(i);
  }
  let kind;
  if (diffs.length === 0) kind = 'silent (same protein)';
  else if (before.length !== after.length) kind = 'frameshift (every codon after it changes)';
  else if (p2[diffs[0]] === '*') kind = `nonsense (premature stop at codon ${diffs[0] + 1})`;
  else kind = `missense (${NAMES[p1[diffs[0]]]}${diffs[0] + 1}${NAMES[p2[diffs[0]]]})`;
  console.log(`before  ${codons(before)}`);
  console.log(`after   ${codons(after)}`);
  console.log(`protein before  ${p1}`);
  console.log(`protein after   ${p2}`);
  console.log(`effect: ${kind}`);
}

function orfs(seq, minCodons = 10) {
  const found = [];
  for (const [strand, s] of [['+', seq], ['-', reverseComplement(seq)]]) {
    for (let frame = 0; frame < 3; frame++) {
      for (let i = frame; i + 3 <= s.length; i += 3) {
        if (s.slice(i, i + 3) !== 'ATG') continue;
        const p = translate(s.slice(i));
        if (p.endsWith('*') && p.length - 1 >= minCodons) {
          found.push({ strand, start: i + 1, length: p.length - 1, protein: p });
          i += 3 * (p.length - 1);   // skip the nested ATGs of this ORF
        }
      }
    }
  }
  return found;
}

const [cmd, raw, posArg, base] = process.argv.slice(2);
if (cmd === 'code') {
  console.log('      second base');
  console.log('       T         C         A         G');
  for (const a of BASES) {
    for (const c of BASES) {
      let line = `${a}  ` ;
      for (const b of BASES) {
        const aa = codonToAmino(a + b + c);
        line += ` ${a}${b}${c} ${NAMES[aa].padEnd(4)}`;
      }
      console.log(line);
    }
  }
} else if (cmd === 'info') {
  const seq = clean(raw);
  console.log(`length       ${seq.length} bases (${Math.floor(seq.length / 3)} codons)`);
  console.log(`GC content   ${(100 * gc(seq)).toFixed(1)} %`);
  console.log(`coding       5'-${seq}-3'`);
  console.log(`template     3'-${complement(seq)}-5'`);
  console.log(`mRNA         5'-${transcribe(seq)}-3'`);
  console.log(`codons       ${codons(seq)}`);
  const p = translate(seq);
  console.log(`protein      ${p}`);
  console.log(`             ${[...p].map((a) => NAMES[a]).join('-')}`);
} else if (cmd === 'mutate' || cmd === 'insert') {
  const seq = clean(raw);
  const pos = Number(posArg);
  const b = clean(base ?? '');
  if (!(pos >= 1 && pos <= seq.length) || b.length < 1) throw new Error('usage: mutate|insert <sequence> <position> <base(s)>');
  const after = cmd === 'mutate'
    ? seq.slice(0, pos - 1) + b + seq.slice(pos - 1 + b.length)
    : seq.slice(0, pos) + b + seq.slice(pos);
  compare(seq, after);
} else if (cmd === 'orfs') {
  const seq = clean(raw);
  const list = orfs(seq, Number(posArg) || 10);
  if (list.length === 0) console.log('no open reading frames of 10 codons or more');
  for (const o of list) console.log(`strand ${o.strand}  start ${String(o.start).padStart(4)}  ${o.length} codons  ${o.protein}`);
} else {
  console.log('usage: node dna.js info|mutate|insert|orfs|code ... (see the top of the file)');
}

module.exports = { complement, reverseComplement, transcribe, translate, gc, orfs };
