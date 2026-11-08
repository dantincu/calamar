# Extending and analyzing the dataset

You need all the course files: `syllables.js` with `syllables.json`, `syllabify.js` and `scripts.js`. This project turns you into a field linguist: you will collect data, check it, and test hypotheses on it.

## 1. Know your data

Start with the dataset as it is:

```bash
node syllables.js --stats
```

```
151 entries, 15 syllables, 28 languages

per syllable:  ma 26, mi 15, na 14, da 13, si 13, ne 11, la 11, pa 9, ba 7, ka 7, no 6, ta 6, shi 6, to 5, ga 2
per language:  Mandarin 35, Japanese 19, Vietnamese 11, Swahili 9, Hindi 7, Spanish 7, Romanian 6, Cantonese 6, Italian 5, French 5, Russian 5, Turkish 4, Korean 4, Thai 3, Bengali 3, Arabic 3, Persian 3, Polish 3, Hebrew 2, Greek 2, Czech 2, Portuguese 1, Serbo-Croatian 1, Georgian 1, German 1, Hungarian 1, Tagalog 1, Estonian 1
per kind:      word 121, particle 17, prefix 4, stem 6, suffix 3
```

The data is **biased**, like all linguistic samples. Mandarin and Japanese have many entries because their syllables are short and they have many homophones, but also because the dataset was built around a few syllables that are common in them. Many of the world's 7,000 languages, and whole families, are absent. Before drawing any conclusion, ask what the sample includes and what it leaves out.

## 2. Add a language

Choose a language you know, or one you can research with a good dictionary (not a machine translator), and add at least ten entries for the syllables of the dataset: *ma, mi, na, ne, no, pa, ba, da, ta, to, ka, ga, la, si, shi*. Each entry looks like this:

```json
{ "syl": "ma", "lang": "Tamil", "form": "மா", "roman": "mā", "meaning": "mango tree; great (as a prefix)", "kind": "word" }
```

Rules of good practice:

- `syl` is the plain syllable without tone or length marks, so lookups find it. A word that differs a little (a long vowel, a final consonant) can still be included, with a `note`.
- Give the native script in `form`, the standard romanization in `roman`, and a short, accurate gloss. Include grammatical words (particles, prefixes, suffixes), marked with `kind`.
- **Check every entry** in two independent sources, or with a native speaker. Then run `node syllables.js --stats` to make sure the file is still valid JSON.

**Exercise 1.** Add your entries, then run `node syllables.js <syllable>` for each. Which of your words resemble words in other languages of the dataset? For each resemblance, decide: inheritance, borrowing, the babbling effect, or coincidence? Justify each decision with evidence (a sound correspondence, a historical contact, a nursery word, or nothing).

## 3. Homophony

```bash
node syllables.js --homophones
```

```
syllable  language     meanings in the data
  ma      Vietnamese   6
  si      Cantonese    6
  ma      Mandarin     5
  ba      Mandarin     5
  da      Mandarin     4
  shi     Mandarin     4
  ma      Thai         3
  na      Mandarin     3
  mi      Mandarin     3
  mi      Japanese     3
  si      Mandarin     3
```

**Exercise 2.** In the language you added, how many meanings does each syllable have? Compare with Mandarin and Vietnamese. Relate the answer to the number of possible syllables in that language (chapter 2) and to whether it has tones.

## 4. False friends

A **false friend** is a word that looks or sounds like a word in another language but means something else. The dataset is full of them: Greek *ne* "yes" and Czech *ne* "no"; Romanian *pa* "bye" and Swahili *-pa* "give".

**Exercise 3.** Write a short "survival guide" of ten false friends for a traveller between two languages of the dataset (or between your language and one of them). For each, give both meanings and one example sentence where confusing them would be embarrassing or funny.

## 5. Testing coincidence

Chapter 4 estimated that two unrelated languages share about 2 look-alikes among 200 basic meanings by chance.

**Exercise 4.** Take two unrelated languages you can look up (for example, Swahili and Japanese). Compare the first syllable of the words for 50 basic meanings (body parts, numbers, pronouns, nature words). How many match? Is it more than chance predicts? Now do the same for two related languages (for example, Spanish and Romanian). What do you find, and do the matches show regular sound correspondences?

## 6. Syllables and writing

**Exercise 5.** Syllabify ten long words in Spanish, Italian, Romanian and English with `syllabify.js`, and compare the results with a dictionary. Where does the tool disagree, and why (stress, word structure, a missing rule)? Then fix one rule in `syllabify.js` (for example, add a missing onset to a language's list) and rerun.

**Exercise 6.** Write your name, or a friend's, in Hangul, by choosing the closest Korean sounds and composing the blocks with `node scripts.js compose`. Then write it in katakana (look up a table), and count the morae. Which script represents your name more faithfully, and why?

## What this shows

Every claim about language needs data, and every dataset is a sample with gaps and biases. The same short syllable means many things around the world, mostly by chance, sometimes because of shared ancestry or contact, and sometimes because all humans start talking the same way. Telling these apart, with evidence, is what linguists do.

Congratulations on finishing the course. *Mulțumesc, merci, gracias, 谢谢 xièxie, ありがとう arigatō, asante, धन्यवाद dhanyavād, شكراً shukran, спасибо spasibo, 감사합니다 gamsahamnida.*
