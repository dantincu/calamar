# Welcome to the course

Say "ma". In Mandarin, depending on your pitch, you have said *mother*, *hemp*, *horse* or *scold*, or asked a question. In Arabic you have said *what*; in Persian, *we*; in Italian, *but*; in Hindi and Bengali, *mother* again. Say "ne": a Greek or a Korean hears *yes*, a Czech hears *no*.

**Linguistics** is the scientific study of language: its sounds, its words, its grammar, how it varies and how it changes. This course enters it through the smallest unit that everyone can hear and count, the **syllable**, and follows a dozen basic syllables around the world.

## What you will learn

1. **Sounds and syllables**: how speech sounds are made, the International Phonetic Alphabet, the parts of a syllable, why each language allows different syllables, and how tone, pitch accent and morae work.
2. **One syllable, many meanings**: why the link between sound and meaning is arbitrary, why some languages have so many homophones, and a world tour of *ma, mi, na, ne, no, pa, ba, da, ta, ka, la* and *si*.
3. **When sound and meaning meet**: why *mama* and *papa* are nearly universal, and sound symbolism (*bouba* and *kiki*).
4. **Syllables through history**: how linguists tell real relatives from coincidences, Proto-Indo-European roots and Grimm's law, Semitic roots, and words that travelled, like *tea* and *chai*.
5. **Writing syllables**: syllabaries, abugidas and Korean Hangul, with its arithmetic.
6. **Project**: extend and analyze a multilingual syllable dataset.

## The sample files

The tools are small Node.js scripts (Node 18 or later, no packages):

```bash
node syllables.js ma                       # what "ma" means in 15 languages
node syllables.js --compare na ne no       # the yes and no syllables, side by side
node syllabify.js es constructor           # syllables by the rules of Spanish (or it, ro, en)
node syllabify.js ja Tōkyō Hokkaidō        # Japanese syllables and morae
node scripts.js compose ㅎ ㅏ ㄴ           # build a Hangul syllable block
node scripts.js pinyin ma1 ma2 ma3 ma4     # Mandarin tone marks
```

The dataset, `syllables.json`, has over 150 entries in 28 languages. Every entry was checked, but the meanings are short glosses, not full dictionary definitions: a word can have more senses, and its use depends on context. Corrections and additions are the project of the last chapter.

## What you need

No knowledge of any particular language. Words in other scripts always come with a romanization. A little arithmetic appears (probabilities, logarithms, a formula for Hangul), explained where it is used.

## About romanizations

Each language has its own conventions: **pinyin** for Mandarin (tone marks: ā á ǎ à), **Jyutping** numbers for Cantonese (si1 to si6), **Hepburn** for Japanese (with ō for a long o), the **Revised Romanization** for Korean, and simplified, widely used transcriptions for Thai, Hindi, Bengali, Arabic, Persian and Greek. When the exact pronunciation matters, the course uses the **IPA** in square brackets, such as [ma].
